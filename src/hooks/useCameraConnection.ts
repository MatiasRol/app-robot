import { useEffect, useRef, useState } from 'react';
import { WebRTCService } from '../services/WebRTCService';

const ROBOT_SERVER_URL = 'http://Xico.local:8080';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface UseCameraConnectionReturn {
  connectionState: ConnectionState;
  remoteStream: any;
  isConnecting: boolean;
  errorMessage: string;
  showConnectionError: boolean;
  connectToRobot: () => Promise<void>;
  disconnectFromRobot: () => void;
  handleRetryConnection: () => void;
  handleCancelConnection: () => void;
  sendTwistStamped: (linear: number, angular: number) => void;
  stopRobot: () => void;
}

export const useCameraConnection = (): UseCameraConnectionReturn => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const webrtcService = useRef<WebRTCService | null>(null);

  const connectToRobot = async () => {
    try {
      setIsConnecting(true);
      setConnectionState('connecting');
      setShowConnectionError(false);

      webrtcService.current = new WebRTCService({
        serverUrl: ROBOT_SERVER_URL,
        onStreamReceived: (stream) => {
          setRemoteStream(stream);
          setConnectionState('connected');
          setIsConnecting(false);
        },
        onConnectionStateChange: (state) => {
          setConnectionState(state as ConnectionState);
        },
        onDataChannelMessage: (data) => {
          // Manejar mensajes del robot
        },
        onError: (message) => {
          setErrorMessage(message);
          setIsConnecting(false);
          setShowConnectionError(true);
        },
      });

      await webrtcService.current.connect();
    } catch (error: any) {
      setIsConnecting(false);
      
      if (!showConnectionError) {
        setErrorMessage('No se pudo conectar al robot');
        setShowConnectionError(true);
      }
    }
  };

  const disconnectFromRobot = () => {
    if (webrtcService.current) {
      webrtcService.current.disconnect();
      webrtcService.current = null;
    }
    setRemoteStream(null);
    setConnectionState('disconnected');
  };

  const handleRetryConnection = () => {
    setShowConnectionError(false);
    connectToRobot();
  };

  const handleCancelConnection = () => {
    setShowConnectionError(false);
    setConnectionState('disconnected');
  };

  const sendTwistStamped = (linear: number, angular: number) => {
    if (webrtcService.current) {
      webrtcService.current.sendTwistStamped(linear, angular);
    }
  };

  const stopRobot = () => {
    if (webrtcService.current) {
      webrtcService.current.stopRobot();
    }
  };

  useEffect(() => {
    connectToRobot();

    return () => {
      disconnectFromRobot();
    };
  }, []);

  return {
    connectionState,
    remoteStream,
    isConnecting,
    errorMessage,
    showConnectionError,
    connectToRobot,
    disconnectFromRobot,
    handleRetryConnection,
    handleCancelConnection,
    sendTwistStamped,
    stopRobot,
  };
};