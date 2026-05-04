import { useEffect, useMemo, useRef, useState } from 'react';
import {
  hapticError,
  hapticLight,
} from '../../../core/utils/haptics';

const CONNECTING_SPLASH_MS = 2000;

interface UseCameraConnectionFlowParams {
  remoteStream: any;
  connectToRobot: () => Promise<any>;
  hasAttemptedConnection: boolean;
}

export function useCameraConnectionFlow({
  remoteStream,
  connectToRobot,
  hasAttemptedConnection,
}: UseCameraConnectionFlowParams) {
  const [showConnectingSplash, setShowConnectingSplash] = useState(true);
  const [showRetryModal, setShowRetryModal] = useState(false);

  const splashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectToRobotRef = useRef(connectToRobot);
  const hasAttemptedConnectionRef = useRef(hasAttemptedConnection);
  const streamURLRef = useRef<string | null>(null);
  const retryModalShownRef = useRef(false);

  useEffect(() => {
    connectToRobotRef.current = connectToRobot;
  }, [connectToRobot]);

  useEffect(() => {
    hasAttemptedConnectionRef.current = hasAttemptedConnection;
  }, [hasAttemptedConnection]);

  const streamURL = useMemo(() => {
    try {
      if (remoteStream && typeof remoteStream.toURL === 'function') {
        return remoteStream.toURL();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo streamURL:', error);
      return null;
    }
  }, [remoteStream]);

  useEffect(() => {
    streamURLRef.current = streamURL;

    if (streamURL) {
      retryModalShownRef.current = false;
      setShowRetryModal(false);
      setShowConnectingSplash(false);
    }
  }, [streamURL]);

  useEffect(() => {
    if (showRetryModal && !retryModalShownRef.current) {
      retryModalShownRef.current = true;
      void hapticError();
    }

    if (!showRetryModal) {
      retryModalShownRef.current = false;
    }
  }, [showRetryModal]);

  const clearSplashTimeout = () => {
    if (splashTimeoutRef.current) {
      clearTimeout(splashTimeoutRef.current);
      splashTimeoutRef.current = null;
    }
  };

  const startSplashWindow = () => {
    setShowConnectingSplash(true);
    clearSplashTimeout();

    splashTimeoutRef.current = setTimeout(() => {
      setShowConnectingSplash(false);

      if (!streamURLRef.current && hasAttemptedConnectionRef.current) {
        setShowRetryModal(true);
      }
    }, CONNECTING_SPLASH_MS);
  };

  const beginConnectionFlow = () => {
    setShowRetryModal(false);
    retryModalShownRef.current = false;

    // SOLO evitar reconectar si ya hay video real
    if (streamURLRef.current) {
      console.log('[CameraConnectionFlow] skip reconnect, stream already available');
      setShowConnectingSplash(false);
      return;
    }

    startSplashWindow();

    connectToRobotRef.current().catch((error) => {
      console.error('Error conectando al robot:', error);
    });
  };

  const handleRetryConnection = () => {
    void hapticLight();
    setShowRetryModal(false);
    retryModalShownRef.current = false;
    startSplashWindow();

    connectToRobotRef.current().catch((error) => {
      console.error('Error reintentando conexión al robot:', error);
    });
  };

  const handleCancelRetry = () => {
    void hapticLight();
    setShowRetryModal(false);
  };

  const cleanupConnectionFlow = () => {
    clearSplashTimeout();
    setShowConnectingSplash(true);
    setShowRetryModal(false);
    retryModalShownRef.current = false;
  };

  return {
    streamURL,
    showConnectingSplash,
    showRetryModal,
    beginConnectionFlow,
    handleRetryConnection,
    handleCancelRetry,
    cleanupConnectionFlow,
  };
}