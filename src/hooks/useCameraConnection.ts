import { useEffect, useRef, useState } from 'react';
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
  
  // Tracking de intentos fallidos
  const videoFailedAttempts = useRef(0);
  const commandsFailedAttempts = useRef(0);
  
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
    
    // Resetear contadores de fallos
    videoFailedAttempts.current = 0;
    commandsFailedAttempts.current = 0;

    // Conectar ambos servicios de forma independiente
    const videoPromise = connectVideo();
    const commandsPromise = connectCommands();

    // Esperar a que ambos intenten conectarse
    const results = await Promise.allSettled([videoPromise, commandsPromise]);
    
    const videoResult = results[0];
    const commandsResult = results[1];
    
    // Verificar si al menos UNO conectó exitosamente
    const videoConnected = videoResult.status === 'fulfilled';
    const commandsConnected = commandsResult.status === 'fulfilled';
    
    setIsConnecting(false);
    
    // Solo mostrar error si AMBOS fallaron
    if (!videoConnected && !commandsConnected) {
      showError('No se pudo conectar ni al video ni a los comandos. Verifica que las Raspberry Pi estén encendidas.');
    } else if (!videoConnected) {
      // Video falló pero comandos OK - solo advertencia en consola
      console.warn('⚠️ Comandos conectados, pero video no disponible');
    } else if (!commandsConnected) {
      // Comandos fallaron pero video OK - solo advertencia en consola
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
          
          // Sincronizar timestamp con comandos si está conectado
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
          
          // Solo mostrar error si comandos también falló
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
          
          // Solo mostrar error si video también falló
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
    } else {
      // Silencioso - no hacer nada si comandos no están disponibles
      console.warn('⚠️ Comandos no disponibles - comando ignorado');
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