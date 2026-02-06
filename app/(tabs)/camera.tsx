import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import JoystickControl from '../../src/components/JoystickControl';
import { Colors } from '../../src/constants/Colors';
import { useCameraConnection } from '../../src/hooks/useCameraConnection';

type CameraMode = 'view' | 'control';

export default function CameraScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // Hook de conexión
  const {
    connectionStatus,
    remoteStream,
    isConnecting,
    errorMessage,
    showConnectionError,
    handleRetryConnection,
    handleCancelConnection,
    sendVelocityCommand,
    stopRobot,
  } = useCameraConnection();

  // Estados UI
  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<CameraMode | null>(null);
  const isKeepAwakeActive = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ tabBarStyle: { display: 'none' } });
      }

      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      activateKeepAwakeAsync().then(() => {
        isKeepAwakeActive.current = true;
      }).catch(() => {});

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

  const handleJoystickMove = (velocity: { linear: number; angular: number }) => {
    try {
      sendVelocityCommand(velocity.linear, velocity.angular);
    } catch (error) {
      // Silenciar errores de conexión en consola
    }
  };

  const handleJoystickStop = () => {
    try {
      stopRobot();
    } catch (error) {
      // Silenciar errores de conexión en consola
    }
  };

  const isAnyConnecting = connectionStatus?.video === 'connecting' || connectionStatus?.commands === 'connecting';

  return (
    <View style={styles.container}>
      {/* Video de fondo */}
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.cameraView}
          objectFit="cover"
        />
      ) : (
        <View style={styles.noVideoContainer}>
          {isConnecting || isAnyConnecting ? (
            <>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.noVideoText}>Conectando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="videocam-off-outline" size={64} color="#666" />
              <Text style={styles.noVideoText}>Sin video</Text>
            </>
          )}
        </View>
      )}

      {/* Controles superpuestos */}
      <View style={styles.overlay}>
        {/* Barra superior - PEGADA ARRIBA */}
        <View style={styles.topBar}>
          {/* Botón de regresar - Izquierda */}
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Indicadores de conexión - Centro */}
          <View style={styles.centerSection}>
            <View style={styles.connectionIndicators}>
              {/* Video */}
              <View style={styles.connectionIndicator}>
                <View 
                  style={[
                    styles.connectionDot,
                    connectionStatus?.video === 'connected' && styles.connectionDotConnected,
                    connectionStatus?.video === 'connecting' && styles.connectionDotConnecting,
                  ]}
                />
                <Text style={styles.connectionText}>Video</Text>
              </View>
              
              {/* Comandos */}
              <View style={styles.connectionIndicator}>
                <View 
                  style={[
                    styles.connectionDot,
                    connectionStatus?.commands === 'connected' && styles.connectionDotConnected,
                    connectionStatus?.commands === 'connecting' && styles.connectionDotConnecting,
                  ]}
                />
                <Text style={styles.connectionText}>CMD</Text>
              </View>
            </View>
          </View>

          {/* Tabs de modo - Derecha (estilo deslizable) */}
          <View style={styles.rightSection}>
            <View style={styles.tabs}>
              <TouchableOpacity 
                style={[styles.tab, mode === 'view' && styles.tabActive]}
                onPress={() => handleModeChange('view')}
              >
                <Ionicons 
                  name="eye-outline" 
                  size={20} 
                  color={mode === 'view' ? '#FFFFFF' : '#666'} 
                />
                <Text style={[styles.tabText, mode === 'view' && styles.tabTextActive]}>
                  Ver
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, mode === 'control' && styles.tabActive]}
                onPress={() => handleModeChange('control')}
              >
                <Ionicons 
                  name="game-controller-outline" 
                  size={20} 
                  color={mode === 'control' ? '#FFFFFF' : '#666'} 
                />
                <Text style={[styles.tabText, mode === 'control' && styles.tabTextActive]}>
                  Control
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Joystick - Solo en modo control */}
        {mode === 'control' && (
          <View style={styles.joystickContainer}>
            <JoystickControl 
              size={160}
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
          </View>
        )}
      </View>

      {/* Modal de error */}
      {showConnectionError && (
        <Modal
          visible={showConnectionError}
          transparent
          animationType="fade"
          onRequestClose={handleCancelConnection}
        >
          <View style={styles.errorOverlay}>
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={48} color="#FF9800" />
              <Text style={styles.errorTitle}>Error de conexión</Text>
              <Text style={styles.errorMessage}>
                {errorMessage || 'No se pudo conectar al robot'}{'\n\n'}
                Verifica que las Raspberry Pi estén encendidas.
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
      )}

      {/* Modal de cambio de modo */}
      <Modal
      visible={showConnectionError}
      transparent
      animationType="fade"
      onRequestClose={handleCancelConnection}
    >
      <TouchableOpacity 
        style={styles.errorOverlay}
        activeOpacity={1}
        onPress={handleCancelConnection} // Cerrar al tocar fuera
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} // Prevenir cierre al tocar el contenido
        >
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={48} color="#FF9800" />
            <Text style={styles.errorTitle}>Error de conexión</Text>
            <Text style={styles.errorMessage}>
              {errorMessage || 'No se pudo conectar al robot'}{'\n\n'}
              Verifica que las Raspberry Pi estén encendidas.
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
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
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
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 16,
  },
  noVideoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  
  // Barra superior
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  
  // Secciones
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  // Botón de regresar
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  
  // Indicadores de conexión
  connectionIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Tabs deslizables (estilo original)
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
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
  
  // Joystick
  joystickContainer: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 5,
  },
  
  // Modal de error
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  errorButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  errorButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  errorButtonRetry: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  errorButtonRetryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Modal de cambio de modo
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '75%',
    maxWidth: 350,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  alertButtonCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  alertButtonCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  alertButtonConfirm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  alertButtonConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});