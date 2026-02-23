import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../lib/core/constants/Colors';
import { useCameraConnectionContext } from '../lib/modules/camera/context/CameraConnectionContext';

export default function ConnectingScreen() {
  const router = useRouter();
  const { robotName = 'Robot 1' } = useLocalSearchParams();
  const [dots, setDots] = useState('');

  const {
    connectToRobot,
    disconnectFromRobot,
    connectionStatus,
    isConnecting,
    errorMessage,
    showConnectionError,
  } = useCameraConnectionContext();

  // Animación de puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev === '...' ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Iniciar conexión al montar
  useEffect(() => {
    connectToRobot();
  }, []);

  // Navegar a cámara cuando el video esté conectado
  useEffect(() => {
    if (connectionStatus.video === 'connected') {
      router.replace('/camera');
    }
  }, [connectionStatus.video]);

  const handleRetry = () => {
    connectToRobot();
  };

  const handleGoBack = () => {
    disconnectFromRobot();
    router.back();
  };

  const hasFailed = showConnectionError ||
    (connectionStatus.video === 'failed' && connectionStatus.commands === 'failed' && !isConnecting);

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* Icono del robot */}
        <View style={styles.robotIconContainer}>
          <Image
            source={require('../assets/images/robotNavSelecc.png')}
            style={styles.robotIcon}
            resizeMode="contain"
          />
        </View>

        {!hasFailed ? (
          <>
            {/* Estado: conectando */}
            <Text style={styles.connectingText}>Conectando a{dots}</Text>
            <Text style={styles.robotName}>{robotName}</Text>
          </>
        ) : (
          <>
            {/* Estado: error */}
            <Ionicons name="warning-outline" size={40} color="#FF9800" style={styles.warningIcon} />
            <Text style={styles.errorTitle}>Error de conexión</Text>
            <Text style={styles.errorMessage}>
              {errorMessage || 'No se pudo conectar al robot.'}{'\n'}
              Verifica que las Raspberry Pi estén encendidas.
            </Text>

            <View style={styles.errorButtons}>
              <TouchableOpacity style={styles.buttonCancel} onPress={handleGoBack}>
                <Text style={styles.buttonCancelText}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonRetry} onPress={handleRetry}>
                <Text style={styles.buttonRetryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(58, 62, 71, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 48,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  robotIconContainer: {
    marginBottom: 32,
  },
  robotIcon: {
    width: 140,
    height: 140,
  },
  connectingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  robotName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  warningIcon: {
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
  },
  buttonCancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  buttonRetry: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  buttonRetryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});