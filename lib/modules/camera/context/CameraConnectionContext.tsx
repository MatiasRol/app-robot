import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { WebRTCVideoService } from '../services/WebRTCVideoService';
import { WebSocketService } from '../services/WebSocketService';

const VIDEO_SERVER_URL = 'http://10.42.0.106:8889';
const VIDEO_STREAM_PATH = 'cam';
const COMMAND_SERVER_URL = 'ws://10.42.0.1:9090';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

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
  connectToRobot: () => Promise<void>;
  disconnectFromRobot: () => void;
  handleRetryConnection: () => void;
  handleCancelConnection: () => void;
  sendVelocityCommand: (linear: number, angular: number) => void;
  stopRobot: () => void;
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

  // Flags de control críticos
  const canShowError = useRef(true);
  const isDisconnecting = useRef(false);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracking de intentos fallidos
  const videoFailedAttempts = useRef(0);
  const commandsFailedAttempts = useRef(0);

  const videoService = useRef<WebRTCVideoService | null>(null);
  const commandService = useRef<WebSocketService | null>(null);

  const showError = (message: string) => {
    if (!canShowError.current || isDisconnecting.current) {
      return;
    }
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

  const connectToRobot = async () => {
    setIsConnecting(true);
    setShowConnectionError(false);
    canShowError.current = true;
    isDisconnecting.current = false;

    videoFailedAttempts.current = 0;
    commandsFailedAttempts.current = 0;

    const videoPromise = connectVideo();
    const commandsPromise = connectCommands();

    const results = await Promise.allSettled([videoPromise, commandsPromise]);

    const videoResult = results[0];
    const commandsResult = results[1];

    const videoConnected = videoResult.status === 'fulfilled';
    const commandsConnected = commandsResult.status === 'fulfilled';

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
        onError: (message) => {
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
        onMessage: (data) => {},
        onError: (message) => {
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

  useEffect(() => {
    return () => {
      if (errorTimeout.current) {
        clearTimeout(errorTimeout.current);
      }
    };
  }, []);

  const isFullyConnected = videoConnectionState === 'connected' && commandConnectionState === 'connected';

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
        connectToRobot,
        disconnectFromRobot,
        handleRetryConnection,
        handleCancelConnection,
        sendVelocityCommand,
        stopRobot,
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