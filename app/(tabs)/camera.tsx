import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { Colors } from '../../lib/core/constants/Colors';
import { useCameraConnectionContext } from '../../lib/modules/camera/context/CameraConnectionContext';
import JoystickControl from '../../src/components/organisms/JoystickControl';

type CameraMode = 'view' | 'control';

export default function CameraScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const {
    remoteStream,
    isConnecting,
    connectToRobot,
    errorMessage,
    showConnectionError,
    handleRetryConnection,
    handleCancelConnection,
    disconnectFromRobot,
    sendVelocityCommand,
    stopRobot,
  } = useCameraConnectionContext();

  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<CameraMode | null>(null);
  const isKeepAwakeActive = useRef(false);
  const hasTriedConnect = useRef(false);

  const streamURL = useMemo(() => {
    try {
      if (remoteStream && typeof remoteStream.toURL === 'function') {
        return remoteStream.toURL();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo streamURL:', error);
      return null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!remoteStream && !hasTriedConnect.current) {
      hasTriedConnect.current = true;
      connectToRobot().catch((error) => {
        console.error('Error conectando al robot:', error);
      });
    }
  }, [remoteStream, connectToRobot]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });

      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ tabBarStyle: { display: 'none' } });
      }

      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});

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
          },
        });

        if (parent) {
          parent.setOptions({
            tabBarStyle: {
              backgroundColor: Colors.background,
              borderTopColor: 'transparent',
              height: 70,
              paddingBottom: 10,
              paddingTop: 10,
            },
          });
        }

        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {});

        if (isKeepAwakeActive.current) {
          try {
            deactivateKeepAwake();
            isKeepAwakeActive.current = false;
          } catch (error) {
            console.error('Error desactivando keep awake:', error);
          }
        }
      };
    }, [navigation])
  );

  const handleBack = async () => {
    if (isKeepAwakeActive.current) {
      try {
        deactivateKeepAwake();
        isKeepAwakeActive.current = false;
      } catch (error) {
        console.error('Error desactivando keep awake:', error);
      }
    }

    disconnectFromRobot();
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {});
    router.back();
  };

  const handleModeChange = (newMode: CameraMode) => {
    if (newMode !== mode) {
      setPendingMode(newMode);
      setShowModeAlert(true);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) setMode(pendingMode);
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
      console.error('Error enviando comando de velocidad:', error);
    }
  };

  const handleJoystickStop = () => {
    try {
      stopRobot();
    } catch (error) {
      console.error('Error deteniendo robot:', error);
    }
  };

  if (isConnecting && !streamURL) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <Text style={styles.loadingSubtext}>Conectando a ...</Text>
        <Text style={styles.loadingRobotText}>Robot 1</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {streamURL ? (
        <RTCView
          streamURL={streamURL}
          style={styles.cameraView}
          objectFit="cover"
        />
      ) : (
        <View style={styles.noVideoContainer}>
          <Ionicons name="videocam-off-outline" size={64} color="#666" />
          <Text style={styles.noVideoText}>Sin video</Text>
        </View>
      )}

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Image
                source={require('../../assets/images/regresoCamara.png')}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

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

        {mode === 'control' && (
          <View style={styles.joystickContainer}>
            <JoystickControl
              size={220}
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
          </View>
        )}
      </View>

      {showConnectionError && (
        <Modal
          visible={showConnectionError}
          transparent
          animationType="fade"
          onRequestClose={handleCancelConnection}
        >
          <TouchableOpacity
            style={styles.errorOverlay}
            activeOpacity={1}
            onPress={handleCancelConnection}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={48} color="#FF9800" />
                <Text style={styles.errorTitle}>Error de conexión</Text>
                <Text style={styles.errorMessage}>
                  {errorMessage || 'No se pudo conectar al robot'}
                  {'\n\n'}
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
      )}

      {showModeAlert && (
        <Modal
          visible={showModeAlert}
          transparent
          animationType="fade"
          onRequestClose={cancelModeChange}
        >
          <TouchableOpacity
            style={styles.alertOverlay}
            activeOpacity={1}
            onPress={cancelModeChange}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.alertBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={48}
                  color={Colors.primary}
                />
                <Text style={styles.alertTitle}>Cambiar modo</Text>
                <Text style={styles.alertMessage}>
                  ¿Deseas cambiar al modo {pendingMode === 'control' ? 'Control' : 'Visualización'}?
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
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingLogo: {
    width: 90,
    height: 90,
    marginBottom: 18,
  },
  loadingSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3A3A3A',
    marginBottom: 4,
  },
  loadingRobotText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
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
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
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
  joystickContainer: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    zIndex: 5,
  },
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