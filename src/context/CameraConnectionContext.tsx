import React, { createContext, useContext, useRef, useState } from 'react';
import { WebRTCVideoService } from '../services/WebRTCVideoService';
import { WebSocketService } from '../services/WebSocketService';

const VIDEO_SERVER_URL = 'http://192.168.18.183:8889';
const VIDEO_STREAM_PATH = 'cam';
const COMMAND_SERVER_URL = 'ws://192.168.137.137:9090';

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

  const canShowError = useRef(true);
  const isDisconnecting = useRef(false);
  const errorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoFailedAttempts = useRef(0);
  const commandsFailedAttempts = useRef(0);
  const videoService = useRef<WebRTCVideoService | null>(null);
  const commandService = useRef<WebSocketService | null>(null);

  // Refs para leer estado actualizado dentro de callbacks
  const videoConnectionStateRef = useRef<ConnectionState>('disconnected');
  const commandConnectionStateRef = useRef<ConnectionState>('disconnected');

  const setVideoState = (state: ConnectionState) => {
    videoConnectionStateRef.current = state;
    setVideoConnectionState(state);
  };

  const setCommandState = (state: ConnectionState) => {
    commandConnectionStateRef.current = state;
    setCommandConnectionState(state);
  };

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

  const connectVideo = async () => {
    if (isDisconnecting.current) return;
    try {
      setVideoState('connecting');
      videoService.current = new WebRTCVideoService({
        serverUrl: VIDEO_SERVER_URL,
        streamPath: VIDEO_STREAM_PATH,
        onStreamReceived: (stream) => {
          if (isDisconnecting.current) return;
          setRemoteStream(stream);
          setVideoState('connected');
          videoFailedAttempts.current = 0;
          if (commandService.current && videoService.current) {
            const videoStartTime = videoService.current.getVideoStartTime();
            commandService.current.updateVideoStartTime(videoStartTime);
          }
        },
        onConnectionStateChange: (state) => {
          if (isDisconnecting.current) return;
          if (state === 'connected' || state === 'connecting') {
            setVideoState(state as ConnectionState);
          }
        },
        onError: () => {
          if (isDisconnecting.current) return;
          setVideoState('failed');
          videoFailedAttempts.current++;
          if (commandConnectionStateRef.current === 'failed') {
            showError('Error de conexión: Video y comandos no disponibles');
          }
        },
      });
      await videoService.current.connect();
    } catch (error: any) {
      if (isDisconnecting.current) return;
      setVideoState('failed');
      videoFailedAttempts.current++;
      throw error;
    }
  };

  const connectCommands = async () => {
    if (isDisconnecting.current) return;
    try {
      setCommandState('connecting');
      commandService.current = new WebSocketService({
        serverUrl: COMMAND_SERVER_URL,
        onConnected: () => {
          if (isDisconnecting.current) return;
          setCommandState('connected');
          commandsFailedAttempts.current = 0;
        },
        onDisconnected: () => {
          if (isDisconnecting.current) return;
          setCommandState('disconnected');
        },
        onMessage: () => {},
        onError: () => {
          if (isDisconnecting.current) return;
          setCommandState('failed');
          commandsFailedAttempts.current++;
          if (videoConnectionStateRef.current === 'failed') {
            showError('Error de conexión: Video y comandos no disponibles');
          }
        },
      });
      const videoStartTime = videoService.current?.getVideoStartTime() || 0;
      await commandService.current.connect(videoStartTime);
    } catch (error: any) {
      if (isDisconnecting.current) return;
      setCommandState('failed');
      commandsFailedAttempts.current++;
      throw error;
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
    setVideoState('disconnected');
    setCommandState('disconnected');
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
    }
  };

  const stopRobot = () => {
    if (commandService.current && commandService.current.isConnected()) {
      commandService.current.stopRobot();
    }
  };

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