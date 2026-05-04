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

  const canShowError = useRef(true);
  const isDisconnecting = useRef(false);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoService = useRef<WebRTCVideoServiceType | null>(null);
  const commandService = useRef<WebSocketServiceType | null>(null);

  const showError = (message: string) => {
    if (!canShowError.current || isDisconnecting.current) return;

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

    if (data.type === 'pos_detenido') {
      return;
    }
  };

  const connectToRobot = async () => {
    setIsConnecting(true);
    setShowConnectionError(false);
    setErrorMessage('');
    canShowError.current = true;
    isDisconnecting.current = false;

    const results = await Promise.allSettled([connectVideo(), connectCommands()]);

    const videoConnected = results[0].status === 'fulfilled';
    const commandsConnected = results[1].status === 'fulfilled';

    setIsConnecting(false);

    if (!videoConnected && !commandsConnected) {
      showError('No se pudo conectar ni al video ni a los comandos.');
    } else if (!videoConnected) {
      showError('Comandos conectados, pero el video no está disponible.');
    } else if (!commandsConnected) {
      showError('Video conectado, pero los comandos no están disponibles.');
    }
  };

  const connectVideo = async () => {
    if (isDisconnecting.current) return;

    try {
      setVideoConnectionState('connecting');

      const { WebRTCVideoService } = await import('../services/WebRTCVideoService');

      videoService.current = new WebRTCVideoService({
        serverUrl: VIDEO_SERVER_URL,
        streamPath: VIDEO_STREAM_PATH,
        onStreamReceived: (stream) => {
          if (isDisconnecting.current) return;

          setRemoteStream(stream);
          setVideoConnectionState('connected');

          if (commandService.current && videoService.current) {
            const videoStartTime = videoService.current.getVideoStartTime();
            commandService.current.updateVideoStartTime(videoStartTime);
          }
        },
        onConnectionStateChange: (state) => {
          if (isDisconnecting.current) return;

          if (
            state === 'connected' ||
            state === 'connecting' ||
            state === 'disconnected'
          ) {
            setVideoConnectionState(state as ConnectionState);
          }
        },
        onError: () => {
          if (isDisconnecting.current) return;
          setVideoConnectionState('failed');
        },
      });

      await videoService.current.connect();
    } catch (error) {
      if (isDisconnecting.current) return;

      setVideoConnectionState('failed');
      throw error;
    }
  };

  const connectCommands = async () => {
    if (isDisconnecting.current) return;

    try {
      setCommandConnectionState('connecting');

      const { WebSocketService } = await import('../services/WebSocketService');

      commandService.current = new WebSocketService({
        serverUrl: COMMAND_SERVER_URL,
        onConnected: () => {
          if (isDisconnecting.current) return;
          setCommandConnectionState('connected');
        },
        onDisconnected: () => {
          if (isDisconnecting.current) return;
          setCommandConnectionState('disconnected');
        },
        onMessage: handleRobotMessage,
        onError: () => {
          if (isDisconnecting.current) return;
          setCommandConnectionState('failed');
        },
      });

      const videoStartTime = videoService.current?.getVideoStartTime() || 0;
      await commandService.current.connect(videoStartTime);
    } catch (error) {
      if (isDisconnecting.current) return;

      setCommandConnectionState('failed');
      throw error;
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
  };

  const handleRetryConnection = () => {
    setShowConnectionError(false);
    canShowError.current = true;
    isDisconnecting.current = false;
    connectToRobot().catch(() => {});
  };

  const handleCancelConnection = () => {
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
    return () => {
      if (errorTimeout.current) {
        clearTimeout(errorTimeout.current);
      }
    };
  }, []);

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