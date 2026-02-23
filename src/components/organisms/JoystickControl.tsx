import React from 'react';
import { StyleSheet, View } from 'react-native';
import Joystick from './Joystick';

interface JoystickControlProps {
  onMove: (velocity: { linear: number; angular: number }) => void;
  onStop: () => void;
  size?: number;
}

// Velocidades máximas cuando el joystick está al límite (distance = 1.0)
const MAX_LINEAR_SPEED = 0.9;   // Velocidad lineal máxima (m/s)
const MAX_ANGULAR_SPEED = 1.5;  // Velocidad angular máxima (rad/s)

export default function JoystickControl({ 
  onMove, 
  onStop, 
  size = 180 
}: JoystickControlProps) {

  const handleJoystickMove = (data: { 
    direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'center'; 
    distance: number 
  }) => {
    let linear = 0;
    let angular = 0;

    // La velocidad es proporcional a la distancia del joystick desde el centro
    // distance varía de 0.0 (centro) a 1.0 (borde)
    
    switch (data.direction) {
      case 'up':
        // Adelante - velocidad proporcional a la distancia
        linear = MAX_LINEAR_SPEED * data.distance;
        angular = 0;
        break;
      
      case 'down':
        // Atrás - velocidad proporcional a la distancia
        linear = -MAX_LINEAR_SPEED * data.distance;
        angular = 0;
        break;
      
      case 'left':
        // Girar a la izquierda (sin avanzar) - velocidad proporcional
        linear = 0;
        angular = MAX_ANGULAR_SPEED * data.distance;
        break;
      
      case 'right':
        // Girar a la derecha (sin avanzar) - velocidad proporcional
        linear = 0;
        angular = -MAX_ANGULAR_SPEED * data.distance;
        break;
      
      case 'up-left':
        // Adelante + Girar izquierda - ambas velocidades proporcionales
        linear = MAX_LINEAR_SPEED * data.distance;
        angular = MAX_ANGULAR_SPEED * data.distance * 0.7;
        break;
      
      case 'up-right':
        // Adelante + Girar derecha - ambas velocidades proporcionales
        linear = MAX_LINEAR_SPEED * data.distance;
        angular = -MAX_ANGULAR_SPEED * data.distance * 0.7;
        break;
      
      case 'down-left':
        // Atrás + Girar izquierda - ambas velocidades proporcionales
        linear = -MAX_LINEAR_SPEED * data.distance;
        angular = MAX_ANGULAR_SPEED * data.distance * 0.7;
        break;
      
      case 'down-right':
        // Atrás + Girar derecha - ambas velocidades proporcionales
        linear = -MAX_LINEAR_SPEED * data.distance;
        angular = -MAX_ANGULAR_SPEED * data.distance * 0.7;
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
  },
});