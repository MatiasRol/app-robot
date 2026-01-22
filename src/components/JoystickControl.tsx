import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Joystick from './Joystick';
import { Colors } from '../constants/Colors';

interface JoystickControlProps {
  onMove: (velocity: { linear: number; angular: number }) => void;
  onStop: () => void;
  size?: number;
}

const SPEED_LEVELS = [
  { label: '1x', linear: 0.2, angular: 0.5 },
  { label: '2x', linear: 0.4, angular: 0.8 },
  { label: '3x', linear: 0.6, angular: 1.2 },
  { label: '4x', linear: 0.8, angular: 1.5 },
];

export default function JoystickControl({ 
  onMove, 
  onStop, 
  size = 180 
}: JoystickControlProps) {
  const [speedIndex, setSpeedIndex] = useState(0);

  const currentSpeed = SPEED_LEVELS[speedIndex];

  const handleSpeedChange = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEED_LEVELS.length);
  };

  const handleJoystickMove = (data: { 
    direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'center'; 
    distance: number 
  }) => {
    let linear = 0;
    let angular = 0;

    // Convertir dirección del joystick a velocidades Twist
    switch (data.direction) {
      case 'up':
        // Adelante
        linear = currentSpeed.linear * data.distance;
        angular = 0;
        break;
      
      case 'down':
        // Atrás
        linear = -currentSpeed.linear * data.distance;
        angular = 0;
        break;
      
      case 'left':
        // Girar a la izquierda (sin avanzar)
        linear = 0;
        angular = currentSpeed.angular * data.distance;
        break;
      
      case 'right':
        // Girar a la derecha (sin avanzar)
        linear = 0;
        angular = -currentSpeed.angular * data.distance;
        break;
      
      case 'up-left':
        // Adelante + Girar izquierda
        linear = currentSpeed.linear * data.distance;
        angular = currentSpeed.angular * data.distance * 0.7;
        break;
      
      case 'up-right':
        // Adelante + Girar derecha
        linear = currentSpeed.linear * data.distance;
        angular = -currentSpeed.angular * data.distance * 0.7;
        break;
      
      case 'down-left':
        // Atrás + Girar izquierda
        linear = -currentSpeed.linear * data.distance;
        angular = currentSpeed.angular * data.distance * 0.7;
        break;
      
      case 'down-right':
        // Atrás + Girar derecha
        linear = -currentSpeed.linear * data.distance;
        angular = -currentSpeed.angular * data.distance * 0.7;
        break;
      
      case 'center':
        // Detenido
        linear = 0;
        angular = 0;
        break;
    }

    onMove({ linear, angular });
  };

  const handleJoystickStop = () => {
    onStop();
  };

  return (
    <View style={styles.container}>
      {/* Selector de velocidad */}
      <TouchableOpacity 
        style={styles.speedButton}
        onPress={handleSpeedChange}
        activeOpacity={0.7}
      >
        <Ionicons name="speedometer-outline" size={22} color="#FFF" />
        <Text style={styles.speedText}>{currentSpeed.label}</Text>
      </TouchableOpacity>

      {/* Joystick existente */}
      <Joystick 
        size={size}
        onMove={handleJoystickMove}
        onStop={handleJoystickStop}
        deadZone={0.15}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  speedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});