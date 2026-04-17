import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { WebRTCVideoService as WebRTCVideoServiceType } from '../services/WebRTCVideoService';
import type { WebSocketService as WebSocketServiceType } from '../services/WebSocketService';

const VIDEO_SERVER_URL = 'http://XicoCamara:8889';
const VIDEO_STREAM_PATH = 'cam';
const COMMAND_SERVER_URL = 'ws://Xico:9090';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface ConnectionStatus {
  video: ConnectionState;
  commands: ConnectionState;
}

export interface RobotPoseData {
  position: {
    x: number;
    y: number;
    z: number;
  };
  orientation: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  timestamp?: number | null;
}

interface CameraConnectionContextType {
  connectionStatus: ConnectionStatus;
  remoteStream: any;
  isConnecting: boolean;
  errorMessage: string;
  showConnectionError: boolean;

  currentMapId: string | null;
  currentMapName: string | null;
  robotPose: RobotPoseData | null;
  lastTelemetryTimestamp: number | null;

  connectToRobot: () => Promise<void>;
  disconnectFromRobot: () => void;
  handleRetryConnection: () => void;
  handleCancelConnection: () => void;

  sendVelocityCommand: (linear: number, angular: number) => void;
  stopRobot: () => void;

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

function normalizePose(data: any): RobotPoseData | null {
  const pose = data?.pose ?? data;

  if (!pose?.position || !pose?.orientation) return null;

  return {
    position: {
      x: Number(pose.position.x ?? 0),
      y: Number(pose.position.y ?? 0),
      z: Number(pose.position.z ?? 0),
    },
    orientation: {
      x: Number(pose.orientation.x ?? 0),
      y: Number(pose.orientation.y ?? 0),
      z: Number(pose.orientation.z ?? 0),
      w: Number(pose.orientation.w ?? 1),
    },
    timestamp: data?.timestamp ?? null,
  };
}

export function CameraConnectionProvider({ children }: { children: React.ReactNode }) {
  const [videoConnectionState, setVideoConnectionState] = useState<ConnectionState>('disconnected');
  const [commandConnectionState, setCommandConnectionState] = useState<ConnectionState>('disconnected');

  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [currentMapName, setCurrentMapName] = useState<string | null>(null);
  const [robotPose, setRobotPose] = useState<RobotPoseData | null>(null);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<number | null>(null);

  const canShowError = useRef(true);
  const isDisconnecting = useRef(false);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoFailedAttempts = useRef(0);
  const commandsFailedAttempts = useRef(0);

  const videoService = useRef<WebRTCVideoServiceType | null>(null);
  const commandService = useRef<WebSocketServiceType | null>(null);

  const showError = (message: string) => {
    if (!canShowError.current || isDisconnecting.current) return;

    canShowError.current = false;

    if (errorTimeout.current) clearTimeout(errorTimeout.current);

    setErrorMessage(message);
    setShowConnectionError(true);

    errorTimeout.current = setTimeout(() => {
      canShowError.current = true;
    }, 3000);
  };

  const handleRobotMessage = (data: any) => {
    if (!data?.type) return;

    switch (data.type) {
      case 'robot_status': {
        const nextMapId = data.currentMapId ?? data.current_map_id ?? null;
        const nextMapName = data.currentMapName ?? data.current_map_name ?? null;
        const nextPose = normalizePose(data);

        if (typeof nextMapId === 'string') {
          setCurrentMapId(nextMapId);
        }

        if (typeof nextMapName === 'string') {
          setCurrentMapName(nextMapName);
        }

        if (nextPose) {
          setRobotPose(nextPose);
        }

        if (data.timestamp !== undefined && data.timestamp !== null) {
          setLastTelemetryTimestamp(Number(data.timestamp));
        }

        break;
      }

      case 'telemetry_broadcast': {
        const nextPose = normalizePose(data);

        if (nextPose) {
          setRobotPose(nextPose);
        }

        if (data.timestamp !== undefined && data.timestamp !== null) {
          setLastTelemetryTimestamp(Number(data.timestamp));
        }

        break;
      }

      default:
        break;
    }
  };

  const connectToRobot = async () => {
    setIsConnecting(true);
    setShowConnectionError(false);
    canShowError.current = true;
    isDisconnecting.current = false;
    videoFailedAttempts.current = 0;
    commandsFailedAttempts.current = 0;

    const results = await Promise.allSettled([connectVideo(), connectCommands()]);

    const videoConnected = results[0].status === 'fulfilled';
    const commandsConnected = results[1].status === 'fulfilled';

    setIsConnecting(false);

    if (!videoConnected && !commandsConnected) {
      showError('No se pudo conectar ni al video ni a los comandos. Verifica que las Raspberry Pi estén encendidas.');
    } else if (!videoConnected) {
      console.warn('⚠️ Comandos conectados, pero video no disponible');
    } else if (!commandsConnected) {
      console.warn('⚠️ Video conectado, pero comandos no disponibles');
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
          videoFailedAttempts.current = 0;

          if (commandService.current && videoService.current) {
            const videoStartTime = videoService.current.getVideoStartTime();
            commandService.current.updateVideoStartTime(videoStartTime);
          }
        },
        onConnectionStateChange: (state) => {
          if (isDisconnecting.current) return;

          if (state === 'connected' || state === 'connecting') {
            setVideoConnectionState(state as ConnectionState);
          }
        },
        onError: () => {
          if (isDisconnecting.current) return;

          setVideoConnectionState('failed');
          videoFailedAttempts.current++;

          if (commandConnectionState === 'failed') {
            showError('Error de conexión: Video y comandos no disponibles');
          }
        },
      });

      await videoService.current.connect();
    } catch (error: any) {
      if (isDisconnecting.current) return;

      setVideoConnectionState('failed');
      videoFailedAttempts.current++;
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
          commandsFailedAttempts.current = 0;
        },
        onDisconnected: () => {
          if (isDisconnecting.current) return;

          setCommandConnectionState('disconnected');
        },
        onMessage: handleRobotMessage,
        onError: () => {
          if (isDisconnecting.current) return;

          setCommandConnectionState('failed');
          commandsFailedAttempts.current++;

          if (videoConnectionState === 'failed') {
            showError('Error de conexión: Video y comandos no disponibles');
          }
        },
      });

      const videoStartTime = videoService.current?.getVideoStartTime() || 0;
      await commandService.current.connect(videoStartTime);
    } catch (error: any) {
      if (isDisconnecting.current) return;

      setCommandConnectionState('failed');
      commandsFailedAttempts.current++;
      throw error;
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
      videoService.current.disconnect();
      videoService.current = null;
    }

    if (commandService.current) {
      commandService.current.disconnect();
      commandService.current = null;
    }

    setRemoteStream(null);
    setVideoConnectionState('disconnected');
    setCommandConnectionState('disconnected');
    setShowConnectionError(false);
    setIsConnecting(false);

    setCurrentMapId(null);
    setCurrentMapName(null);
    setRobotPose(null);
    setLastTelemetryTimestamp(null);
  };

  const handleRetryConnection = () => {
    setShowConnectionError(false);
    canShowError.current = true;
    isDisconnecting.current = false;
    connectToRobot();
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
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, []);

  const isFullyConnected =
    videoConnectionState === 'connected' && commandConnectionState === 'connected';

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
        currentMapName,
        robotPose,
        lastTelemetryTimestamp,

        connectToRobot,
        disconnectFromRobot,
        handleRetryConnection,
        handleCancelConnection,
        sendVelocityCommand,
        stopRobot,
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