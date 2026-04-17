import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../lib/core/constants/Colors';
import { useCameraConnectionContext } from '../lib/modules/camera/context/CameraConnectionContext';

const CONNECTION_TIMEOUT_MS = 2000;

export default function ConnectingScreen() {
  const router = useRouter();

  const {
    connectToRobot,
    isFullyConnected,
    errorMessage,
  } = useCameraConnectionContext();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(true);

  const stopSpin = () => {
    if (spinLoopRef.current) {
      spinLoopRef.current.stop();
      spinLoopRef.current = null;
    }
    rotateAnim.stopAnimation();
  };

  const startSpin = () => {
    stopSpin();
    rotateAnim.setValue(0);

    spinLoopRef.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinLoopRef.current.start();
  };

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startAttempt = () => {
    clearTimer();
    setLoading(true);
    startSpin();

    connectToRobot().catch(() => {
      // La UI del error la controla el timeout.
    });

    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      if (!isFullyConnected) {
        setLoading(false);
        stopSpin();
      }
    }, CONNECTION_TIMEOUT_MS);
  };

  useEffect(() => {
    mountedRef.current = true;
    startAttempt();

    return () => {
      mountedRef.current = false;
      clearTimer();
      stopSpin();
    };
  }, []);

  useEffect(() => {
    if (isFullyConnected) {
      clearTimer();
      stopSpin();
      router.replace('/(tabs)');
    }
  }, [isFullyConnected, router]);

  const handleRetry = () => {
    startAttempt();
  };

  const handleCancel = () => {
    clearTimer();
    stopSpin();
    router.replace('/(tabs)');
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          loading ? { transform: [{ rotate: spin }] } : undefined,
        ]}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {loading ? (
        <View style={styles.textWrap}>
          <Text style={styles.label}>Conectando a ...</Text>
          <Text style={styles.robotName}>Robot 1</Text>
        </View>
      ) : (
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>No se pudo conectar al robot</Text>
          <Text style={styles.errorText}>
            {errorMessage ||
              'Verifica que el robot esté encendido y conectado a la red.'}
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.88}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRetry}
              activeOpacity={0.88}
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  logoWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 90,
    height: 90,
  },

  textWrap: {
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A3A3A',
    marginBottom: 4,
  },
  robotName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  errorWrap: {
    alignItems: 'center',
    maxWidth: 320,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 18,
  },

  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    minWidth: 130,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E9E9E9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#2F2F2F',
    fontSize: 15,
    fontWeight: '600',
  },
  retryBtn: {
    minWidth: 130,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});