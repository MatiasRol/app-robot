import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  hapticError,
  hapticLight,
} from '../lib/core/utils/haptics';
import { useCameraConnectionContext } from '../lib/modules/camera/context/CameraConnectionContext';

const CONNECTION_TIMEOUT_MS = 2500;
const MIN_SPLASH_DURATION_MS = 2000;

export default function ConnectingScreen() {
  const router = useRouter();

  const hasStartedRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorShownRef = useRef(false);
  const minDelayDoneRef = useRef(false);

  const spinAnim = useRef(new Animated.Value(0)).current;

  const {
    connectionStatus,
    isConnecting,
    errorMessage,
    showConnectionError,
    connectToRobot,
    handleRetryConnection,
    handleCancelConnection,
  } = useCameraConnectionContext();

  const [timedOut, setTimedOut] = useState(false);

  const hasAnyConnection =
    connectionStatus.video === 'connected' ||
    connectionStatus.commands === 'connected';

  const shouldShowError =
    showConnectionError || (timedOut && !hasAnyConnection);

  useEffect(() => {
    console.log('[ConnectingScreen] mounted');

    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    loop.start();

    return () => {
      console.log('[ConnectingScreen] unmounted');
      loop.stop();
      spinAnim.stopAnimation();

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (minDelayRef.current) clearTimeout(minDelayRef.current);
    };
  }, [spinAnim]);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    console.log('[ConnectingScreen] starting robot connection');

    connectToRobot().catch((error) => {
      console.log('[ConnectingScreen] connectToRobot rejected:', error);
    });

    timeoutRef.current = setTimeout(() => {
      console.log('[ConnectingScreen] timeout reached');
      setTimedOut(true);
    }, CONNECTION_TIMEOUT_MS);

    minDelayRef.current = setTimeout(() => {
      console.log('[ConnectingScreen] minimum splash delay completed');
      minDelayDoneRef.current = true;
    }, MIN_SPLASH_DURATION_MS);
  }, [connectToRobot]);

  useEffect(() => {
    console.log('[ConnectingScreen] state snapshot', {
      video: connectionStatus.video,
      commands: connectionStatus.commands,
      hasAnyConnection,
      isConnecting,
      timedOut,
      shouldShowError,
      minDelayDone: minDelayDoneRef.current,
    });
  }, [
    connectionStatus.video,
    connectionStatus.commands,
    hasAnyConnection,
    isConnecting,
    timedOut,
    shouldShowError,
  ]);

  useEffect(() => {
    if (shouldShowError && !errorShownRef.current) {
      errorShownRef.current = true;
      void hapticError();
    }

    if (!shouldShowError) {
      errorShownRef.current = false;
    }
  }, [shouldShowError]);

  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (!hasAnyConnection) return;
    if (isConnecting) return;
    if (!minDelayDoneRef.current) return;

    hasNavigatedRef.current = true;

    console.log('[ConnectingScreen] navigating to /(tabs)');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    router.replace('/(tabs)');
  }, [hasAnyConnection, isConnecting, router]);

  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (!hasAnyConnection) return;
    if (isConnecting) return;

    if (!minDelayDoneRef.current) {
      const waitForMinDelay = setInterval(() => {
        if (minDelayDoneRef.current && !hasNavigatedRef.current) {
          clearInterval(waitForMinDelay);
          hasNavigatedRef.current = true;

          console.log('[ConnectingScreen] navigating after min delay to /(tabs)');

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          router.replace('/(tabs)');
        }
      }, 100);

      return () => clearInterval(waitForMinDelay);
    }
  }, [hasAnyConnection, isConnecting, router]);

  const handleRetry = () => {
    console.log('[ConnectingScreen] retry tapped');
    void hapticLight();

    setTimedOut(false);
    errorShownRef.current = false;
    hasNavigatedRef.current = false;
    minDelayDoneRef.current = false;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (minDelayRef.current) clearTimeout(minDelayRef.current);

    handleRetryConnection();

    timeoutRef.current = setTimeout(() => {
      console.log('[ConnectingScreen] timeout reached after retry');
      setTimedOut(true);
    }, CONNECTION_TIMEOUT_MS);

    minDelayRef.current = setTimeout(() => {
      console.log('[ConnectingScreen] minimum splash delay completed after retry');
      minDelayDoneRef.current = true;
    }, MIN_SPLASH_DURATION_MS);
  };

  const handleCancel = () => {
    console.log('[ConnectingScreen] cancel tapped');
    void hapticLight();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (minDelayRef.current) {
      clearTimeout(minDelayRef.current);
      minDelayRef.current = null;
    }

    handleCancelConnection();
    router.replace('/(tabs)');
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/logo.png')}
        style={[styles.logo, { transform: [{ rotate: spin }] }]}
        resizeMode="contain"
      />

      {!shouldShowError && <Text style={styles.connectingText}>Conectando</Text>}

      <Modal
        visible={shouldShowError}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          style={styles.errorOverlay}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>No se pudo conectar</Text>

              <Text style={styles.errorMessage}>
                {errorMessage || 'No se pudo conectar al robot'}
              </Text>

              <View style={styles.errorButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancel}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={handleRetry}
                  activeOpacity={0.85}
                >
                  <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
  },
  connectingText: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '500',
    color: '#1B1B1B',
  },

  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorBox: {
    width: 260,
    backgroundColor: '#F4F4F4',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#202020',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  errorButtons: {
    width: '100%',
    gap: 10,
  },
  cancelBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#8A8A8A',
    fontSize: 16,
    fontWeight: '500',
  },
  retryBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#124BAF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});