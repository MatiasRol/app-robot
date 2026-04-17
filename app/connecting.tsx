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

export default function ConnectingScreen() {
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;

  const {
    connectToRobot,
    isConnecting,
    isFullyConnected,
    hasAttemptedConnection,
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
    };
  }, [spinValue]);

  useEffect(() => {
    setShowLocalError(false);

    connectToRobot().catch(() => {
      // El contexto ya maneja parte del estado;
      // aquí el mensaje visual se resuelve con los efectos de abajo.
    });
  }, [connectToRobot]);

  useEffect(() => {
    if (isFullyConnected) {
      setShowLocalError(false);
      router.replace('/(tabs)');
    }
  }, [isFullyConnected, router]);

  useEffect(() => {
    if (hasAttemptedConnection && !isConnecting && !isFullyConnected) {
      setShowLocalError(true);
    }
  }, [hasAttemptedConnection, isConnecting, isFullyConnected]);

  const handleRetry = () => {
    setShowLocalError(false);

    connectToRobot().catch(() => {
      // Se vuelve a evaluar con el estado del contexto
    });
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
          <Text style={styles.errorTitle}>No se conectó el robot</Text>
          <Text style={styles.errorText}>
            {errorMessage ||
              'Verifica que el robot esté encendido y conectado a la red.'}
          </Text>

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleRetry}
            activeOpacity={0.88}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
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
  retryBtn: {
    minWidth: 150,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});