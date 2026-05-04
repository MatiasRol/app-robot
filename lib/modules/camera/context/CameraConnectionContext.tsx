import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { WebRTCVideoService as WebRTCVideoServiceType } from '../services/WebRTCVideoService';
import type { WebSocketService as WebSocketServiceType } from '../services/WebSocketService';

const VIDEO_SERVER_URL =
  process.env.EXPO_PUBLIC_VIDEO_SERVER_URL || 'http://XicoCamara.local:8889';
const VIDEO_STREAM_PATH =
  process.env.EXPO_PUBLIC_VIDEO_STREAM_PATH || 'cam';
const COMMAND_SERVER_URL =
  process.env.EXPO_PUBLIC_COMMAND_SERVER_URL || 'ws://Xico.local:9090';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';
export type RobotRecordingState = 'idle' | 'starting' | 'recording' | 'stopping';

type LiveRobotPose = {
  worldX: number;
  worldY: number;
  yaw: number;
};

interface ConnectionStatus {
  video: ConnectionState;
  commands: ConnectionState;
}

interface CameraConnectionContextType {
  connectionStatus: ConnectionStatus;
  remoteStream: any;
  isConnecting: boolean;
  errorMessage: string;
  showConnectionError: boolean;
  currentMapId: string | null;
  robotPose: LiveRobotPose | null;
  robotRecordingState: RobotRecordingState;
  isRobotRecording: boolean;
  hasAttemptedConnection: boolean;
  connectToRobot: () => Promise<void>;
  disconnectFromRobot: () => void;
  handleRetryConnection: () => void;
  handleCancelConnection: () => void;
  requestRobotPositionStream: () => void;
  stopRobotPositionStream: () => void;
  sendVelocityCommand: (linear: number, angular: number) => void;
  stopRobot: () => void;
  sendRecordingCommand: (value: 'on' | 'off') => void;
  sendNavigateToPose: (
    x: number,
    y: number,
    quaternion: { x: number; y: number; z: number; w: number }
  ) => void;
  sendFollowWaypoints: (
    waypoints: Array<{
      worldX: number;
      worldY: number;
      quaternion: { x: number; y: number; z: number; w: number };
    }>
  ) => void;
  isFullyConnected: boolean;
}

const CameraConnectionContext = createContext<CameraConnectionContextType | null>(null);

async function settleWithTimeout<T>(
  promise: Promise<T>,
  label: string,
  ms: number = 12000
): Promise<PromiseSettledResult<T>> {
  try {
    const value = await Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), ms)
      ),
    ]);

    return { status: 'fulfilled', value };
  } catch (reason) {
    return { status: 'rejected', reason };
  }
}

export function CameraConnectionProvider({ children }: { children: React.ReactNode }) {
  const [videoConnectionState, setVideoConnectionState] = useState<ConnectionState>('disconnected');
  const [commandConnectionState, setCommandConnectionState] = useState<ConnectionState>('disconnected');

  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [robotPose, setRobotPose] = useState<LiveRobotPose | null>(null);
  const [robotRecordingState, setRobotRecordingState] =
    useState<RobotRecordingState>('idle');
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);

  const canShowError = useRef(true);
  const isDisconnecting = useRef(false);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoService = useRef<WebRTCVideoServiceType | null>(null);
  const commandService = useRef<WebSocketServiceType | null>(null);

  const showError = (message: string) => {
    if (!canShowError.current || isDisconnecting.current) return;

    console.log('[RobotConnect][UI] showError:', message);

    canShowError.current = false;

    if (errorTimeout.current) {
      clearTimeout(errorTimeout.current);
    }

    setErrorMessage(message);
    setShowConnectionError(true);

    errorTimeout.current = setTimeout(() => {
      canShowError.current = true;
    }, 3000);
  };

  const handleRobotMessage = (data: any) => {
    console.log('[RobotConnect][WS] message:', data);

    if (!data?.type) return;

    if (data.type === 'active_map' && typeof data.map === 'string') {
      setCurrentMapId(data.map);
      return;
    }

    if (
      (data.type === 'pos_suscrito' || data.type === 'pos_robot') &&
      typeof data.x === 'number' &&
      typeof data.y === 'number' &&
      typeof data.yaw === 'number'
    ) {
      setRobotPose({
        worldX: data.x,
        worldY: data.y,
        yaw: data.yaw,
      });
      return;
    }

    if (data.type === 'grabacion' && typeof data.message === 'string') {
      const normalized = data.message.trim().toLowerCase();

      if (normalized === 'grabacion iniciada') {
        setRobotRecordingState('recording');
        return;
      }

      if (normalized === 'grabacion finalizada') {
        setRobotRecordingState('idle');
        return;
      }
    }
  };

  const connectVideo = async () => {
    if (isDisconnecting.current) return;

    if (videoConnectionState === 'connected' && remoteStream) {
      console.log('[RobotConnect][VIDEO] already connected, skipping');
      return;
    }

    if (videoConnectionState === 'connecting') {
      console.log('[RobotConnect][VIDEO] already connecting, skipping');
      return;
    }

    try {
      console.log('[RobotConnect][VIDEO] connecting...');
      setVideoConnectionState('connecting');

      const { WebRTCVideoService } = await import('../services/WebRTCVideoService');

      if (videoService.current) {
        await videoService.current.disconnect().catch(() => {});
        videoService.current = null;
      }

      videoService.current = new WebRTCVideoService({
        serverUrl: VIDEO_SERVER_URL,
        streamPath: VIDEO_STREAM_PATH,
        onStreamReceived: (stream) => {
          if (isDisconnecting.current) return;

          console.log('[RobotConnect][VIDEO] stream received');
          setRemoteStream(stream);
          setVideoConnectionState('connected');

          if (commandService.current && videoService.current) {
            const videoStartTime = videoService.current.getVideoStartTime();
            commandService.current.updateVideoStartTime(videoStartTime);
          }
        },
        onConnectionStateChange: (state) => {
          if (isDisconnecting.current) return;

          console.log('[RobotConnect][VIDEO] state:', state);

          if (
            state === 'connected' ||
            state === 'connecting' ||
            state === 'disconnected'
          ) {
            setVideoConnectionState(state as ConnectionState);
          }
        },
        onError: (message) => {
          if (isDisconnecting.current) return;
          console.log('[RobotConnect][VIDEO] error:', message);
          setVideoConnectionState('failed');
        },
      });

      await videoService.current.connect();
      console.log('[RobotConnect][VIDEO] connect resolved');
    } catch (error) {
      if (isDisconnecting.current) return;

      console.log('[RobotConnect][VIDEO] connect rejected:', error);
      setVideoConnectionState('failed');
      throw error;
    }
  };

  const connectCommands = async () => {
    if (isDisconnecting.current) return;

    if (commandService.current?.isConnected() && commandConnectionState === 'connected') {
      console.log('[RobotConnect][WS] already connected, skipping');
      return;
    }

    if (commandConnectionState === 'connecting') {
      console.log('[RobotConnect][WS] already connecting, skipping');
      return;
    }

    try {
      console.log('[RobotConnect][WS] connecting...');
      setCommandConnectionState('connecting');

      const { WebSocketService } = await import('../services/WebSocketService');

      if (commandService.current) {
        commandService.current.disconnect();
        commandService.current = null;
      }

      commandService.current = new WebSocketService({
        serverUrl: COMMAND_SERVER_URL,
        onConnected: () => {
          if (isDisconnecting.current) return;
          console.log('[RobotConnect][WS] connected');
          setCommandConnectionState('connected');
        },
        onDisconnected: () => {
          if (isDisconnecting.current) return;
          console.log('[RobotConnect][WS] disconnected');
          setCommandConnectionState('disconnected');
        },
        onMessage: handleRobotMessage,
        onError: (message) => {
          if (isDisconnecting.current) return;
          console.log('[RobotConnect][WS] error:', message);
          setCommandConnectionState('failed');
        },
      });

      const videoStartTime = videoService.current?.getVideoStartTime() || 0;
      await commandService.current.connect(videoStartTime);
      console.log('[RobotConnect][WS] connect resolved');
    } catch (error) {
      if (isDisconnecting.current) return;

      console.log('[RobotConnect][WS] connect rejected:', error);
      setCommandConnectionState('failed');
      throw error;
    }
  };

  const connectToRobot = async () => {
    console.log('[RobotConnect] connectToRobot start', {
      VIDEO_SERVER_URL,
      VIDEO_STREAM_PATH,
      COMMAND_SERVER_URL,
      videoConnectionState,
      commandConnectionState,
      hasRemoteStream: !!remoteStream,
      hasWsConnected: !!commandService.current?.isConnected(),
      isConnecting,
    });

    setHasAttemptedConnection(true);

    if (isConnecting) {
      console.log('[RobotConnect] global connect already in progress, skipping');
      return;
    }

    const alreadyVideoConnected =
      videoConnectionState === 'connected' && !!remoteStream;
    const alreadyCommandsConnected =
      commandConnectionState === 'connected' &&
      !!commandService.current?.isConnected();

    if (alreadyVideoConnected && alreadyCommandsConnected) {
      console.log('[RobotConnect] everything already connected, skipping');
      return;
    }

    setIsConnecting(true);
    setShowConnectionError(false);
    setErrorMessage('');
    canShowError.current = true;
    isDisconnecting.current = false;

    const tasks: Array<Promise<PromiseSettledResult<any>>> = [];

    if (alreadyVideoConnected) {
      tasks.push(Promise.resolve({ status: 'fulfilled', value: undefined }));
    } else {
      tasks.push(settleWithTimeout(connectVideo(), 'VIDEO', 12000));
    }

    if (alreadyCommandsConnected) {
      tasks.push(Promise.resolve({ status: 'fulfilled', value: undefined }));
    } else {
      tasks.push(settleWithTimeout(connectCommands(), 'COMMANDS', 12000));
    }

    const [videoResult, commandsResult] = await Promise.all(tasks);

    const videoConnected = videoResult.status === 'fulfilled';
    const commandsConnected = commandsResult.status === 'fulfilled';

    console.log('[RobotConnect] connectToRobot end', {
      videoResult,
      commandsResult,
      videoConnected,
      commandsConnected,
    });

    setIsConnecting(false);

    if (!videoConnected && !commandsConnected) {
      showError('No se pudo conectar ni al video ni a los comandos.');
    } else if (!videoConnected) {
      showError('Comandos conectados, pero el video no está disponible.');
    } else if (!commandsConnected) {
      showError('Video conectado, pero los comandos no están disponibles.');
    }
  };

  const requestRobotPositionStream = () => {
    if (commandService.current && commandService.current.isConnected()) {
      commandService.current.requestRobotPositionStream();
    } else {
      console.warn('⚠️ Comandos no disponibles - solicitar_pos ignorado');
    }
  };

  const stopRobotPositionStream = () => {
    if (commandService.current && commandService.current.isConnected()) {
      commandService.current.stopRobotPositionStream();
    }
  };

  const disconnectFromRobot = () => {
    console.log('[RobotConnect] disconnectFromRobot');

    isDisconnecting.current = true;
    canShowError.current = false;

    if (errorTimeout.current) {
      clearTimeout(errorTimeout.current);
      errorTimeout.current = null;
    }

    if (videoService.current) {
      void videoService.current.disconnect();
      videoService.current = null;
    }

    if (commandService.current) {
      commandService.current.disconnect();
      commandService.current = null;
    }

    setRemoteStream(null);
    setCurrentMapId(null);
    setRobotPose(null);
    setRobotRecordingState('idle');
    setVideoConnectionState('disconnected');
    setCommandConnectionState('disconnected');
    setShowConnectionError(false);
    setErrorMessage('');
    setIsConnecting(false);
    setHasAttemptedConnection(false);
  };

  const handleRetryConnection = () => {
    console.log('[RobotConnect] retry');
    setShowConnectionError(false);
    canShowError.current = true;
    isDisconnecting.current = false;
    connectToRobot().catch((error) => {
      console.log('[RobotConnect] retry connect error:', error);
    });
  };

  const handleCancelConnection = () => {
    console.log('[RobotConnect] cancel');
    setShowConnectionError(false);
    canShowError.current = false;
    disconnectFromRobot();
  };

  const sendVelocityCommand = (linear: number, angular: number) => {
    if (commandService.current && commandService.current.isConnected()) {
      commandService.current.sendVelocityCommand(linear, angular);
    } else {
      console.warn('⚠️ Comandos no disponibles - comando ignorado');
    }
  };

  const stopRobot = () => {
    if (commandService.current && commandService.current.isConnected()) {
      commandService.current.stopRobot();
    }
  };

  const sendRecordingCommand = (value: 'on' | 'off') => {
    if (commandService.current && commandService.current.isConnected()) {
      setRobotRecordingState(value === 'on' ? 'starting' : 'stopping');
      commandService.current.sendRecordingCommand(value);
    } else {
      console.warn('⚠️ Comandos no disponibles - grabacion ignorada');
    }
  };

  const sendNavigateToPose = (
    x: number,
    y: number,
    quaternion: { x: number; y: number; z: number; w: number }
  ) => {
    if (commandService.current && commandService.current.isConnected()) {
      commandService.current.sendNavigateToPose(x, y, quaternion);
    } else {
      console.warn('⚠️ Comandos no disponibles - navigate_to_pose ignorado');
    }
  };

  const sendFollowWaypoints = (
    waypoints: Array<{
      worldX: number;
      worldY: number;
      quaternion: { x: number; y: number; z: number; w: number };
    }>
  ) => {
    if (commandService.current && commandService.current.isConnected()) {
      commandService.current.sendFollowWaypoints(waypoints);
    } else {
      console.warn('⚠️ Comandos no disponibles - follow_waypoints ignorado');
    }
  };

  useEffect(() => {
    console.log('[RobotConnect] provider mounted');

    return () => {
      console.log('[RobotConnect] provider unmounted');
      if (errorTimeout.current) {
        clearTimeout(errorTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('[RobotConnect] state snapshot', {
      videoConnectionState,
      commandConnectionState,
      isConnecting,
    });
  }, [videoConnectionState, commandConnectionState, isConnecting]);

  const isFullyConnected =
    videoConnectionState === 'connected' &&
    commandConnectionState === 'connected';

  const isRobotRecording =
    robotRecordingState === 'starting' || robotRecordingState === 'recording';

  return (
    <CameraConnectionContext.Provider
      value={{
        connectionStatus: {
          video: videoConnectionState,
          commands: commandConnectionState,
        },
        remoteStream,
        isConnecting,
        errorMessage,
        showConnectionError,
        currentMapId,
        robotPose,
        robotRecordingState,
        isRobotRecording,
        hasAttemptedConnection,
        connectToRobot,
        disconnectFromRobot,
        handleRetryConnection,
        handleCancelConnection,
        requestRobotPositionStream,
        stopRobotPositionStream,
        sendVelocityCommand,
        stopRobot,
        sendRecordingCommand,
        sendNavigateToPose,
        sendFollowWaypoints,
        isFullyConnected,
      }}
    >
      {children}
    </CameraConnectionContext.Provider>
  );
}

export function useCameraConnectionContext() {
  const context = useContext(CameraConnectionContext);
  if (!context) {
    throw new Error('useCameraConnectionContext must be used within CameraConnectionProvider');
  }
  return context;
}