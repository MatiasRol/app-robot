import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    sendTwistStamped,
    stopRobot,
    disconnectFromRobot,
  } = useCameraConnection();

  const { mode, handleModeChange } = useModeControl();
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
      {/* Video de fondo - Pantalla completa */}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.videoBackground}
          objectFit="cover"
        />
      )}

      {/* Overlay de conexión - Solo bloquea cuando está conectando o hay error */}
      {(isConnecting || connectionState === 'failed' || (connectionState === 'connected' && !remoteStream)) && (
        <View style={[
          styles.connectionOverlay,
          // Si solo está esperando video, hacer el overlay más transparente y permitir interacción
          (connectionState === 'connected' && !remoteStream) && styles.connectionOverlayTransparent
        ]}
        pointerEvents={(connectionState === 'connected' && !remoteStream) ? 'none' : 'auto'}
        >
          <View style={styles.connectionBox}>
            {isConnecting ? (
              <>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.connectionText}>Conectando al robot...</Text>
                <Text style={styles.connectionSubtext}>Estableciendo conexión WebRTC</Text>
              </>
            ) : connectionState === 'failed' ? (
              <>
                <Ionicons name="cloud-offline-outline" size={64} color="#FF5252" />
                <Text style={styles.connectionText}>Sin conexión</Text>
                <Text style={styles.connectionSubtext}>{errorMessage || 'No se pudo conectar al robot'}</Text>
              </>
            ) : connectionState === 'connected' && !remoteStream ? (
              <>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.connectionText}>Esperando video...</Text>
                <Text style={styles.connectionSubtext}>Conexión establecida, cargando stream</Text>
              </>
            ) : (
              <>
                <Ionicons name="videocam-off-outline" size={64} color="#FFF" />
                <Text style={styles.connectionText}>Sin video</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Controles superpuestos */}
      <View style={styles.controlsOverlay}>
        {/* Header - Superior */}
        <View style={styles.header}>
          {/* Lado izquierdo: Botón back + Estado */}
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.statusBadge}>
              <View style={[
                styles.statusDot,
                connectionState === 'connected' && styles.statusDotConnected,
                connectionState === 'connecting' && styles.statusDotConnecting,
                connectionState === 'failed' && styles.statusDotFailed,
              ]} />
              <Text style={styles.statusText}>
                {connectionState === 'connected' && 'Conectado'}
                {connectionState === 'connecting' && 'Conectando'}
                {connectionState === 'failed' && 'Desconectado'}
                {connectionState === 'disconnected' && 'Sin conexión'}
              </Text>
            </View>
          </View>

          {/* Centro: Tabs de modo */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'view' && styles.modeTabActive]}
              onPress={() => handleModeChange('view')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="eye"
                size={20}
                color={mode === 'view' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.modeTabText, mode === 'view' && styles.modeTabTextActive]}>
                Vista
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, mode === 'control' && styles.modeTabActive]}
              onPress={() => handleModeChange('control')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="game-controller"
                size={20}
                color={mode === 'control' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.modeTabText, mode === 'control' && styles.modeTabTextActive]}>
                Control
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lado derecho: Espacio vacío para balance */}
          <View style={styles.headerRight} />
        </View>

        {/* Joystick - Esquina inferior derecha */}
        {mode === 'control' && (
          <View style={styles.joystickContainer}>
            <View style={styles.joystickWrapper}>
              <JoystickControl
                size={180}
                onMove={handleJoystickMove}
                onStop={handleJoystickStop}
              />
            </View>
            <Text style={styles.joystickLabel}>Control de movimiento</Text>
          </View>
        )}

        {/* Indicador de modo vista */}
        {mode === 'view' && (
          <View style={styles.viewModeIndicator}>
            <Ionicons name="eye-outline" size={24} color="rgba(255,255,255,0.8)" />
            <Text style={styles.viewModeText}>Modo Visualización</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  
  // Overlay de conexión
  connectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  connectionOverlayTransparent: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  connectionBox: {
    alignItems: 'center',
    gap: 16,
  },
  connectionText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  connectionSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },

  // Overlay de controles
  controlsOverlay: {
    flex: 1,
    position: 'relative',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flex: 1,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9E9E9E',
  },
  statusDotConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDotConnecting: {
    backgroundColor: '#FF9800',
  },
  statusDotFailed: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Tabs de modo
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modeTabActive: {
    backgroundColor: Colors.primary,
  },
  modeTabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },

  // Joystick
  joystickContainer: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    alignItems: 'center',
    gap: 12,
  },
  joystickWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 100,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  joystickLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Indicador modo vista
  viewModeIndicator: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewModeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
});