import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
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

export default function ConnectingScreen() {
  const router = useRouter();

  const {
    remoteStream,
    errorMessage,
    showConnectionError,
    handleRetryConnection,
    handleCancelConnection,
  } = useCameraConnectionContext();

  // Cuando el stream esté listo → navega a la cámara
  useEffect(() => {
    if (remoteStream) {
      router.replace('/(tabs)/camera');
    }
  }, [remoteStream]);

  const handleCancel = () => {
    handleCancelConnection();
    router.back();
  };

  return (
    <View style={styles.container}>

      {/* Logo */}
      <View style={styles.logoWrap}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Spinner o error */}
      {showConnectionError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>
            {errorMessage || 'No se pudo conectar al robot'}
          </Text>
          <Text style={styles.errorHint}>
            Verifica que las Raspberry Pi estén encendidas.
          </Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetryConnection}>
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
            <Text style={styles.label}>Conectando a ...</Text>
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

  // Logo
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

  // Spinner
  spinner: {
    marginVertical: 4,
  },

  // Texto conectando
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

  // Error
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