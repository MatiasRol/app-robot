import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import JoystickControl from '../../src/components/JoystickControl';
import { Colors } from '../../src/constants/Colors';
import { useCameraConnection } from '../../src/hooks/useCameraConnection';
import { useModeControl } from '../../src/hooks/useModeControl';
import { useScreenControl } from '../../src/hooks/useScreenControl';

export default function CameraScreen() {
  // Hooks personalizados
  const {
    connectionState,
    remoteStream,
    isConnecting,
    errorMessage,
    showConnectionError,
    handleRetryConnection,
    handleCancelConnection,
    sendTwistStamped,
    stopRobot,
    disconnectFromRobot,
  } = useCameraConnection();

  const {
    mode,
    showModeAlert,
    pendingMode,
    handleModeChange,
    confirmModeChange,
    cancelModeChange,
  } = useModeControl();

  const { handleBack } = useScreenControl(disconnectFromRobot);

  // Handlers del joystick
  const handleJoystickMove = (velocity: { linear: number; angular: number }) => {
    sendTwistStamped(velocity.linear, velocity.angular);
  };

  const handleJoystickStop = () => {
    stopRobot();
  };

  return (
    <View style={styles.container}>
      {/* Video de la cámara */}
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

      {/* Overlay con controles */}
      <View style={styles.overlay}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          {/* Botón atrás */}
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Espacio flexible */}
          <View style={styles.topBarCenter}>
            {/* Indicador de conexión */}
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
          </View>

          {/* Tabs de modo */}
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

        {/* Joystick en modo control */}
        {mode === 'control' && connectionState === 'connected' && (
          <View style={styles.controlPanel}>
            <JoystickControl 
              size={160}
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
          </View>
        )}
      </View>

      {/* Modal de error de conexión */}
      <Modal
        visible={showConnectionError}
        transparent
        animationType="fade"
        onRequestClose={() => handleCancelConnection()}
      >
        <View style={styles.errorOverlay}>
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={48} color="#FF9800" />
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
      <Modal
        visible={showModeAlert}
        transparent
        animationType="fade"
        onRequestClose={cancelModeChange}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Ionicons 
              name={pendingMode === 'control' ? 'game-controller' : 'eye'} 
              size={40} 
              color={Colors.primary} 
            />
            <Text style={styles.alertTitle}>Cambiar modo</Text>
            <Text style={styles.alertMessage}>
              ¿Cambiar a modo {pendingMode === 'view' ? 'Visualización' : 'Control'}?
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
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
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
  controlPanel: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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

  // Alerta de modo
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