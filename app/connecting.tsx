import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../lib/core/constants/Colors';
import { useCameraConnectionContext } from '../lib/modules/camera/context/CameraConnectionContext';

const CONNECTION_TIMEOUT_MS = 2500;

export default function ConnectingScreen() {
  const router = useRouter();
  const hasStartedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    connectionStatus,
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

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    connectToRobot().catch(() => {});

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, CONNECTION_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [connectToRobot]);

  useEffect(() => {
    if (!hasAnyConnection) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    router.replace('/(tabs)');
  }, [hasAnyConnection, router]);

  const handleRetry = () => {
    setTimedOut(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    handleRetryConnection();

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, CONNECTION_TIMEOUT_MS);
  };

  const handleCancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    handleCancelConnection();
    router.replace('/(tabs)');
  };

  const shouldShowError =
    showConnectionError ||
    (timedOut && !hasAnyConnection);

  const statusLabel =
    connectionStatus.video === 'connecting' && connectionStatus.commands === 'connecting'
      ? 'Conectando video y comandos...'
      : connectionStatus.video === 'connecting'
      ? 'Conectando video...'
      : connectionStatus.commands === 'connecting'
      ? 'Conectando comandos...'
      : 'Conectando a ...';

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {shouldShowError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>
            {errorMessage || 'No se pudo conectar al robot'}
          </Text>
          <Text style={styles.errorHint}>
            Verifica que el robot esté encendido y en la misma red.
          </Text>

          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.spinner}
          />

          <View style={styles.textWrap}>
            <Text style={styles.label}>{statusLabel}</Text>
            <Text style={styles.robotName}>Robot 1</Text>

            <TouchableOpacity onPress={handleCancel} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: Colors.logo,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 72,
    height: 72,
  },
  spinner: {
    marginVertical: 4,
  },
  textWrap: {
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  robotName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  cancelLink: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  cancelLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  errorWrap: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.danger,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: Colors.button,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
});