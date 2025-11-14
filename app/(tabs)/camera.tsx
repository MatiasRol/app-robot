import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useState } from 'react';
import { Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Joystick from '../../src/components/Joystick';
import { Colors } from '../../src/constants/Colors';

type CameraMode = 'view' | 'control';

export default function CameraScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeModal, setShowModeModal] = useState(false);
  const [joystickData, setJoystickData] = useState({ x: 0, y: 0, angle: 0, distance: 0 });

  // Ocultar tab bar y bloquear orientación horizontal
  useFocusEffect(
    React.useCallback(() => {
      // Ocultar la barra de navegación inferior
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }

      // Bloquear orientación horizontal
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

      // Limpiar al salir
      return () => {
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
      };
    }, [navigation])
  );

  const handleModeChange = () => {
    setShowModeModal(false);
    setMode(mode === 'view' ? 'control' : 'view');
  };

  const handleBack = async () => {
    // Volver a vertical
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    
    // Navegar a la pantalla principal
    router.back();
  };

  const handleJoystickMove = (data: { x: number; y: number; angle: number; distance: number }) => {
    setJoystickData(data);
    console.log('Joystick:', data);
    // Aquí puedes enviar los comandos al robot
  };

  const handleJoystickStop = () => {
    setJoystickData({ x: 0, y: 0, angle: 0, distance: 0 });
    console.log('Joystick stopped');
    // Aquí puedes detener el robot
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Camera View - Fondo */}
      <View style={styles.cameraBackground}>
        <Ionicons name="videocam-outline" size={80} color="rgba(255, 255, 255, 0.3)" />
        <Text style={styles.placeholderText}>Mostrando cámara</Text>
      </View>

      {/* Overlay Controls */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.robotInfo}>
            <Text style={styles.robotName}>Robot 1</Text>
            <View style={styles.statusDot} />
          </View>

          <TouchableOpacity 
            onPress={() => setShowModeModal(true)}
            style={styles.transparentButton}
          >
            <Ionicons 
              name={mode === 'view' ? 'game-controller-outline' : 'eye-outline'} 
              size={28} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Joystick - Abajo a la izquierda */}
        {mode === 'control' && (
          <View style={styles.joystickContainer}>
            <Joystick 
              size={160} 
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
            
            {/* Indicador de dirección (opcional) */}
            <View style={styles.directionIndicator}>
              <Text style={styles.directionText}>
                {joystickData.distance > 0.1 ? 
                  `${Math.round(joystickData.angle)}° - ${Math.round(joystickData.distance * 100)}%` 
                  : 'Centro'
                }
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomInfo}>
            <Ionicons name="battery-half" size={20} color="#00FF00" />
            <Text style={styles.bottomInfoText}>60%</Text>
          </View>
          
          {mode === 'view' && (
            <Text style={styles.bottomInfoText}>Toca el ícono del control para manejar el robot</Text>
          )}
          
          {mode === 'control' && (
            <Text style={styles.bottomInfoText}>Mueve el joystick para controlar el robot</Text>
          )}
          
          <View style={styles.bottomInfo}>
            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            <Text style={styles.bottomInfoText}>00:00:00</Text>
          </View>
        </View>
      </View>

      {/* Modal de Confirmación */}
      <Modal
        visible={showModeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons 
              name={mode === 'view' ? 'game-controller' : 'eye'} 
              size={56} 
              color={Colors.primary} 
            />
            <Text style={styles.modalTitle}>
              {mode === 'view' ? 'Activar Modo Control' : 'Volver a Modo Vista'}
            </Text>
            <Text style={styles.modalText}>
              {mode === 'view' 
                ? '¿Deseas activar los controles para manejar el robot?'
                : '¿Deseas desactivar los controles y solo ver la cámara?'}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowModeModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleModeChange}
              >
                <Text style={styles.modalButtonTextConfirm}>Aceptar</Text>
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
  cameraBackground: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  
  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  robotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF00',
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Joystick Container
  joystickContainer: {
    position: 'absolute',
    bottom: 100,
    left: 50,
    alignItems: 'center',
  },
  directionIndicator: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  directionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomInfoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    width: '70%',
    maxWidth: 500,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});