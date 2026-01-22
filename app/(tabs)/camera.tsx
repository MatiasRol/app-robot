import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import JoystickControl from '../../src/components/JoystickControl';
import { Colors } from '../../src/constants/Colors';
import { WebRTCService } from '../../src/services/WebRTCService';

type CameraMode = 'view' | 'control';

const ROBOT_SERVER_URL = 'http://Xico.local:8080';

export default function CameraScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<CameraMode | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const isKeepAwakeActive = useRef(false);
  const webrtcService = useRef<WebRTCService | null>(null);

  useEffect(() => {
    connectToRobot();

    return () => {
      disconnectFromRobot();
    };
  }, []);

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
          setConnectionState(state);
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

  const handleRetryConnection = () => {
    setShowConnectionError(false);
    connectToRobot();
  };

  const handleCancelConnection = () => {
    setShowConnectionError(false);
    setConnectionState('disconnected');
  };

  const disconnectFromRobot = () => {
    if (webrtcService.current) {
      webrtcService.current.disconnect();
      webrtcService.current = null;
    }
    setRemoteStream(null);
    setConnectionState('disconnected');
  };

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        tabBarStyle: { display: 'none' }
      });

      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }

      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      
      activateKeepAwakeAsync()
        .then(() => {
          isKeepAwakeActive.current = true;
        })
        .catch(() => {});

      return () => {
        navigation.setOptions({
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopColor: 'transparent',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          }
        });

        if (parent) {
          parent.setOptions({
            tabBarStyle: {
              backgroundColor: Colors.background,
              borderTopColor: 'transparent',
              height: 70,
              paddingBottom: 10,
              paddingTop: 10,
            }
          });
        }
        
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        
        if (isKeepAwakeActive.current) {
          try {
            deactivateKeepAwake();
            isKeepAwakeActive.current = false;
          } catch (error) {}
        }
      };
    }, [navigation])
  );

  const handleBack = async () => {
    disconnectFromRobot();
    
    if (isKeepAwakeActive.current) {
      try {
        deactivateKeepAwake();
        isKeepAwakeActive.current = false;
      } catch (error) {}
    }
    
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    router.back();
  };

  const handleModeChange = (newMode: CameraMode) => {
    if (newMode !== mode) {
      setPendingMode(newMode);
      setShowModeAlert(true);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      setMode(pendingMode);
    }
    setShowModeAlert(false);
    setPendingMode(null);
  };

  const cancelModeChange = () => {
    setShowModeAlert(false);
    setPendingMode(null);
  };

  // Manejar movimiento del joystick
  const handleJoystickMove = (velocity: { linear: number; angular: number }) => {
    if (webrtcService.current) {
      // Enviar TwistStamped (puedes cambiar a sendTwist si prefieres)
      webrtcService.current.sendTwistStamped(velocity.linear, velocity.angular);
    }
  };

  // Detener el robot
  const handleJoystickStop = () => {
    if (webrtcService.current) {
      webrtcService.current.stopRobot();
    }
  };

  return (
    <View style={styles.container}>
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.cameraView}
          objectFit="cover"
        />
      ) : (
        <View style={styles.loadingContainer}>
          {isConnecting ? (
            <>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Conectando al robot...</Text>
            </>
          ) : (
            <Text style={styles.loadingText}>
              {connectionState === 'disconnected' && 'Desconectado'}
              {connectionState === 'failed' && 'Error de conexión'}
            </Text>
          )}
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.connectionIndicator}>
            <View 
              style={[
                styles.connectionDot,
                connectionState === 'connected' && styles.connectionDotConnected,
                connectionState === 'connecting' && styles.connectionDotConnecting,
              ]}
            />
            <Text style={styles.connectionText}>
              {connectionState === 'connected' && 'Conectado'}
              {connectionState === 'connecting' && 'Conectando...'}
              {connectionState === 'failed' && 'Error'}
              {connectionState === 'disconnected' && 'Desconectado'}
            </Text>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, mode === 'view' && styles.tabActive]}
              onPress={() => handleModeChange('view')}
            >
              <Text style={[styles.tabText, mode === 'view' && styles.tabTextActive]}>
                Visualización
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, mode === 'control' && styles.tabActive]}
              onPress={() => handleModeChange('control')}
            >
              <Text style={[styles.tabText, mode === 'control' && styles.tabTextActive]}>
                Control
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {mode === 'control' && connectionState === 'connected' && (
          <View style={styles.joystickContainer}>
            <JoystickControl 
              size={180}
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
          </View>
        )}
      </View>

      {/* Modal de error */}
      <Modal
        visible={showConnectionError}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConnectionError(false)}
      >
        <View style={styles.errorOverlay}>
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={60} color="#FF9800" />
            <Text style={styles.errorTitle}>Error de conexión</Text>
            <Text style={styles.errorMessage}>
              {errorMessage}{'\n\n'}
              Verifica que el robot esté encendido y que estés conectado a la misma red WiFi.
            </Text>
            <View style={styles.errorButtons}>
              <TouchableOpacity 
                style={styles.errorButtonCancel}
                onPress={handleCancelConnection}
              >
                <Text style={styles.errorButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.errorButtonRetry}
                onPress={handleRetryConnection}
              >
                <Text style={styles.errorButtonRetryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alerta de cambio de modo */}
      {showModeAlert && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Cambiar modo de cámara</Text>
            <Text style={styles.alertMessage}>
              ¿Estás seguro de que deseas cambiar al modo {pendingMode === 'view' ? 'Visualización' : 'Control'}?
            </Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity 
                style={styles.alertButtonCancel}
                onPress={cancelModeChange}
              >
                <Text style={styles.alertButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.alertButtonConfirm}
                onPress={confirmModeChange}
              >
                <Text style={styles.alertButtonConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 16,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  connectionDotConnected: {
    backgroundColor: '#4CAF50',
  },
  connectionDotConnecting: {
    backgroundColor: '#FF9800',
  },
  connectionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  joystickContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    alignItems: 'center',
  },
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  errorButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  errorButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  errorButtonRetry: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  errorButtonRetryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alertButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  alertButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  alertButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  alertButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
});