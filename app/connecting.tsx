import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const spinValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptIdRef = useRef(0);

  const {
    connectToRobot,
    isFullyConnected,
    errorMessage,
  } = useCameraConnectionContext();

  const [showLocalError, setShowLocalError] = useState(false);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => {
      spinAnimation.stop();
      spinValue.stopAnimation();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [spinValue]);

  const startConnectionAttempt = useCallback(() => {
    attemptIdRef.current += 1;
    const currentAttemptId = attemptIdRef.current;

    setShowLocalError(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      if (!isFullyConnected && attemptIdRef.current === currentAttemptId) {
        setShowLocalError(true);
      }
    }, CONNECTION_TIMEOUT_MS);

    connectToRobot().catch(() => {
      // El timeout controla la UI del error local.
    });
  }, [connectToRobot, isFullyConnected]);

  useEffect(() => {
    startConnectionAttempt();
  }, [startConnectionAttempt]);

  useEffect(() => {
    if (isFullyConnected) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setShowLocalError(false);
      router.replace('/(tabs)');
    }
  }, [isFullyConnected, router]);

  const handleRetry = () => {
    startConnectionAttempt();
  };

  const handleCancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setShowLocalError(false);
    router.replace('/(tabs)');
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isLoading = !showLocalError;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          isLoading && {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {isLoading ? (
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