import { useEffect, useRef, useState } from 'react';
import { WebRTCVideoService } from '../services/WebRTCVideoService';
import { WebSocketService } from '../services/WebSocketService';

const VIDEO_SERVER_URL = 'http://192.168.18.183:8889';
const VIDEO_STREAM_PATH = 'cam';
const COMMAND_SERVER_URL = 'ws://192.168.18.163:9090';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface ConnectionStatus {
  video: ConnectionState;
  commands: ConnectionState;
}

interface UseCameraConnectionReturn {
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

export const useCameraConnection = (): UseCameraConnectionReturn => {
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
  
  const videoService = useRef<WebRTCVideoService | null>(null);
  const commandService = useRef<WebSocketService | null>(null);

  const showError = (message: string) => {
    // Solo mostrar si está permitido
    if (!canShowError.current || isDisconnecting.current) {
      return;
    }
    
    // Bloquear inmediatamente más errores
    canShowError.current = false;
    
    // Limpiar timeout anterior si existe
    if (errorTimeout.current) {
      clearTimeout(errorTimeout.current);
    }
    
    setErrorMessage(message);
    setShowConnectionError(true);
    
    // Permitir mostrar error nuevamente después de 3 segundos
    errorTimeout.current = setTimeout(() => {
      canShowError.current = true;
    }, 3000);
  };

  const connectToRobot = async () => {
    setIsConnecting(true);
    setShowConnectionError(false);
    canShowError.current = true;
    isDisconnecting.current = false;

    try {
      await connectVideo();
      await connectCommands();
      setIsConnecting(false);
    } catch (error: any) {
      setIsConnecting(false);
      showError('No se pudo conectar con el robot. Verifica que las Raspberry Pi estén encendidas.');
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
          showError('Error en video: ' + message);
        },
      });

      await videoService.current.connect();
    } catch (error: any) {
      if (isDisconnecting.current) return;
      setVideoConnectionState('failed');
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
        },
        onDisconnected: () => {
          if (isDisconnecting.current) return;
          setCommandConnectionState('disconnected');
        },
        onMessage: (data) => {},
        onError: (message) => {
          if (isDisconnecting.current) return;
          setCommandConnectionState('failed');
          showError('Error en comandos: ' + message);
        },
      });

      const videoStartTime = videoService.current?.getVideoStartTime() || 0;
      await commandService.current.connect(videoStartTime);
    } catch (error: any) {
      if (isDisconnecting.current) return;
      setCommandConnectionState('failed');
      throw error;
    }
  };

  const disconnectFromRobot = () => {
    // Marcar como desconectando INMEDIATAMENTE
    isDisconnecting.current = true;
    canShowError.current = false;
    
    // Limpiar timeout de error
    if (errorTimeout.current) {
      clearTimeout(errorTimeout.current);
      errorTimeout.current = null;
    }

    // Cerrar servicios
    if (videoService.current) {
      videoService.current.disconnect();
      videoService.current = null;
    }

    if (commandService.current) {
      commandService.current.disconnect();
      commandService.current = null;
    }

    // Limpiar estados
    setRemoteStream(null);
    setVideoConnectionState('disconnected');
    setCommandConnectionState('disconnected');
    setShowConnectionError(false);
  };

  const handleRetryConnection = () => {
    // Cerrar modal inmediatamente
    setShowConnectionError(false);
    
    // Resetear flags
    canShowError.current = true;
    isDisconnecting.current = false;
    
    // Reconectar
    connectToRobot();
  };

  const handleCancelConnection = () => {
    // Cerrar modal INMEDIATAMENTE
    setShowConnectionError(false);
    
    // Bloquear más errores
    canShowError.current = false;
    
    // Desconectar todo
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

  useEffect(() => {
    connectToRobot();

    return () => {
      // Cleanup al desmontar
      if (errorTimeout.current) {
        clearTimeout(errorTimeout.current);
      }
      disconnectFromRobot();
    };
  }, []);

  const isFullyConnected = videoConnectionState === 'connected' && commandConnectionState === 'connected';

  return {
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
  };
};