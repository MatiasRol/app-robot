import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Joystick from '../../src/components/Joystick';
import { Colors } from '../../src/constants/Colors';

type CameraMode = 'view' | 'control';

export default function CameraScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeModal, setShowModeModal] = useState(false);
  const isKeepAwakeActive = useRef(false);

  // Ocultar tab bar y bloquear orientación horizontal
  useFocusEffect(
    React.useCallback(() => {
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

  const handleModeChange = () => {
    setShowModeModal(false);
    const newMode = mode === 'view' ? 'control' : 'view';
    setMode(newMode);
  };

  const handleBack = async () => {
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

  const handleJoystickMove = (data: { 
    direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'center'; 
    distance: number 
  }) => {
    console.log('🎮 Direction:', data.direction, 'Speed:', Math.round(data.distance * 100) + '%');
  };

  const handleJoystickStop = () => {
    console.log('🎮 Robot stopped');
  };

  return (
    <View style={styles.container}>
      {/* Camera View - Fondo (mantener tu fondo actual) */}
      <View style={styles.cameraBackground}>
        {/* Aquí puedes poner tu imagen de fondo o video */}
        <Image 
          source={require('../../assets/images/camera-visor-black-background.png')} 
          style={styles.cameraImage}
          resizeMode="cover"
        />
        {/* Overlay oscuro para mejor contraste */}
        <View style={styles.cameraOverlay} />
      </View>

      {/* UI Overlay */}
      <View style={styles.overlay}>
        {/* Top Bar - Minimalista */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tabs de Visualización/Control - Centro Superior */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, mode === 'view' && styles.tabActive]}
              onPress={() => setMode('view')}
            >
              <Text style={[styles.tabText, mode === 'view' && styles.tabTextActive]}>
                Visualización
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, mode === 'control' && styles.tabActive]}
              onPress={() => setMode('control')}
            >
              <Text style={[styles.tabText, mode === 'control' && styles.tabTextActive]}>
                Control
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Joystick - Solo visible en modo control */}
        {mode === 'control' && (
          <View style={styles.joystickContainer}>
            <Joystick 
              size={180} 
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
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
  cameraBackground: {
    flex: 1,
    position: 'relative',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Overlay sutil
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  
  // Top Bar - Minimalista
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Tabs Container
  tabsContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
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
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Joystick
  joystickContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    alignItems: 'center',
  },
});