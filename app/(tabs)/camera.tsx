import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import Joystick from '../../src/components/Joystick';
import { Colors } from '../../src/constants/Colors';
import { WebRTCService } from '../../src/services/WebRTCService';

type CameraMode = 'view' | 'control';

const ROBOT_SERVER_URL = 'http://192.168.1.100:8080';

export default function CameraScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<CameraMode | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [remoteStream, setRemoteStream] = useState<any>(null);
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
      setConnectionState('connecting');

      webrtcService.current = new WebRTCService({
        serverUrl: ROBOT_SERVER_URL,
        onStreamReceived: (stream) => {
          console.log('✅ Stream recibido');
          setRemoteStream(stream);
          setConnectionState('connected');
        },
        onConnectionStateChange: (state) => {
          setConnectionState(state);
          if (state === 'failed' || state === 'disconnected') {
            Alert.alert(
              'Conexión perdida',
              'Se perdió la conexión con el robot. ¿Reintentar?',
              [
                { text: 'Cancelar', onPress: () => router.back() },
                { text: 'Reintentar', onPress: () => connectToRobot() },
              ]
            );
          }
        },
        onDataChannelMessage: (data) => {
          console.log('Mensaje del robot:', data);
        },
      });

      await webrtcService.current.connect();
    } catch (error) {
      console.error('Error conectando:', error);
      setConnectionState('failed');
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar al robot. Verifica la IP del servidor.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
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
        .catch((error) => {
          console.warn('⚠️ Failed to activate wake lock:', error);
        });

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
          } catch (error) {
            console.warn('⚠️ Failed to deactivate wake lock:', error);
          }
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
      } catch (error) {
        console.warn('⚠️ Failed to deactivate wake lock on back:', error);
      }
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

  const handleJoystickMove = (data: { 
    direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'center'; 
    distance: number 
  }) => {
    console.log('🎮 Direction:', data.direction, 'Speed:', Math.round(data.distance * 100) + '%');
    
    if (webrtcService.current) {
      webrtcService.current.sendCommand('move', {
        direction: data.direction,
        speed: data.distance,
      });
    }
  };

  const handleJoystickStop = () => {
    console.log('🎮 Robot stopped');
    
    if (webrtcService.current) {
      webrtcService.current.sendCommand('stop');
    }
  };

  return (
    <View style={styles.container}>
      {/* Ocultar barra de estado */}
      <StatusBar hidden />
      
      {/* Cámara como fondo completo */}
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.cameraBackground}
          objectFit="cover"
        />
      ) : (
        <View style={styles.loadingContainer} />
      )}

      {/* Botón de regresar - Esquina superior izquierda */}
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Indicador de conexión - Centrado arriba */}
      <View style={styles.connectionIndicatorWrapper}>
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
          </Text>
        </View>
      </View>

      {/* Selector de modo - Esquina superior derecha */}
      <View style={styles.modeSelector}>
        <TouchableOpacity 
          style={[styles.modeButton, mode === 'view' && styles.modeButtonActive]}
          onPress={() => handleModeChange('view')}
        >
          <Ionicons 
            name="eye-outline" 
            size={20} 
            color={mode === 'view' ? '#FFFFFF' : '#666'} 
          />
          <Text style={[styles.modeText, mode === 'view' && styles.modeTextActive]}>
            Ver
          </Text>
        </TouchableOpacity>
        
        <View style={styles.modeDivider} />
        
        <TouchableOpacity 
          style={[styles.modeButton, mode === 'control' && styles.modeButtonActive]}
          onPress={() => handleModeChange('control')}
        >
          <Ionicons 
            name="game-controller-outline" 
            size={20} 
            color={mode === 'control' ? '#FFFFFF' : '#666'} 
          />
          <Text style={[styles.modeText, mode === 'control' && styles.modeTextActive]}>
            Control
          </Text>
        </TouchableOpacity>
      </View>

      {/* Joystick - Abajo derecha */}
      {mode === 'control' && connectionState === 'connected' && (
        <View style={styles.joystickContainer}>
          <Joystick 
            size={180} 
            onMove={handleJoystickMove}
            onStop={handleJoystickStop}
          />
        </View>
      )}

      {/* Modal de confirmación */}
      {showModeAlert && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Ionicons 
              name="swap-horizontal" 
              size={48} 
              color={Colors.primary} 
              style={styles.alertIcon}
            />
            <Text style={styles.alertTitle}>Cambiar modo</Text>
            <Text style={styles.alertMessage}>
              ¿Cambiar al modo {pendingMode === 'view' ? 'Visualización' : 'Control'}?
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
  cameraBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Botón de regresar - Esquina superior izquierda
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  
  // Indicador de conexión - Centrado en X y Y
  connectionIndicatorWrapper: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  
  // Selector de modo - Esquina superior derecha
  modeSelector: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  modeDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 8,
  },
  
  // Joystick - Abajo derecha
  joystickContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    zIndex: 10,
  },

  // Modal de alerta
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  alertIcon: {
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  alertButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});