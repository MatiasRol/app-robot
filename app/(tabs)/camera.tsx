import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCameraConnectionContext } from '../../lib/modules/camera/context/CameraConnectionContext';
import { useCameraBackHandler } from '../../lib/modules/camera/hooks/useCameraBackHandler';
import { useCameraConnectionFlow } from '../../lib/modules/camera/hooks/useCameraConnectionFlow';
import {
  useCameraModeState,
} from '../../lib/modules/camera/hooks/useCameraModeState';
import { useCameraRobotControl } from '../../lib/modules/camera/hooks/useCameraRobotControl';
import { useCameraScreenLifecycle } from '../../lib/modules/camera/hooks/useCameraScreenLifecycle';
import CameraModeAlert from '../../src/components/molecules/CameraModeAlert';
import CameraRetryModal from '../../src/components/molecules/CameraRetryModal';
import CameraControlOverlay from '../../src/components/organisms/CameraControlOverlay';
import CameraLoadingSplash from '../../src/components/organisms/CameraLoadingSplash';
import CameraTopBar from '../../src/components/organisms/CameraTopBar';
import CameraVideoSurface from '../../src/components/organisms/CameraVideoSurface';

export default function CameraScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const {
    remoteStream,
    connectToRobot,
    errorMessage,
    hasAttemptedConnection,
    sendVelocityCommand,
    stopRobot,
  } = useCameraConnectionContext();

  const stopRobotRef = useRef(stopRobot);

  useEffect(() => {
    stopRobotRef.current = stopRobot;
  }, [stopRobot]);

  const {
    streamURL,
    showConnectingSplash,
    showRetryModal,
    beginConnectionFlow,
    handleRetryConnection,
    handleCancelRetry,
    cleanupConnectionFlow,
  } = useCameraConnectionFlow({
    remoteStream,
    connectToRobot,
    hasAttemptedConnection,
  });

  const {
    handleJoystickMove,
    handleJoystickStop,
    stopRobotSafely,
  } = useCameraRobotControl({
    sendVelocityCommand,
    stopRobot,
  });

  const {
    mode,
    pendingMode,
    showModeAlert,
    handleModeChange,
    confirmModeChange,
    cancelModeChange,
    resetModeState,
  } = useCameraModeState({
    onLeaveControl: () => {
      stopRobotSafely();
    },
  });

  const { handleBack } = useCameraBackHandler({
    router,
    stopRobotSafely,
  });

  const handleEnterScreen = useCallback(() => {
    beginConnectionFlow();
  }, [beginConnectionFlow]);

  const handleExitScreen = useCallback(() => {
    cleanupConnectionFlow();

    try {
      stopRobotRef.current();
    } catch (error) {
      console.error('Error deteniendo robot al salir de cámara:', error);
    }

    resetModeState();
  }, [cleanupConnectionFlow, resetModeState]);

  useCameraScreenLifecycle({
    navigation,
    onEnter: handleEnterScreen,
    onExit: handleExitScreen,
  });

  if (showConnectingSplash) {
    return <CameraLoadingSplash robotName="Robot 1" />;
  }

  return (
    <View style={styles.container}>
      <CameraVideoSurface streamURL={streamURL} />

      <View style={styles.overlay}>
        <CameraTopBar
          mode={mode}
          onBack={handleBack}
          onModeChange={handleModeChange}
        />

        <CameraControlOverlay
          visible={mode === 'control'}
          onMove={handleJoystickMove}
          onStop={handleJoystickStop}
        />
      </View>

      <CameraRetryModal
        visible={showRetryModal && !streamURL}
        errorMessage={errorMessage}
        onCancel={handleCancelRetry}
        onRetry={handleRetryConnection}
      />

      <CameraModeAlert
        visible={showModeAlert}
        pendingMode={pendingMode}
        onCancel={cancelModeChange}
        onConfirm={confirmModeChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
});