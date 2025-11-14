import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

interface JoystickProps {
  onMove?: (data: { x: number; y: number; angle: number; distance: number }) => void;
  onStop?: () => void;
  size?: number;
}

export default function Joystick({ onMove, onStop, size = 140 }: JoystickProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const maxDistance = size / 2 - 25; // Radio máximo menos el radio del stick

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderMove: (_, gesture) => {
        const { dx, dy } = gesture;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Limitar el movimiento al círculo
        if (distance <= maxDistance) {
          pan.setValue({ x: dx, y: dy });
        } else {
          // Normalizar al borde del círculo
          const angle = Math.atan2(dy, dx);
          const limitedX = Math.cos(angle) * maxDistance;
          const limitedY = Math.sin(angle) * maxDistance;
          pan.setValue({ x: limitedX, y: limitedY });
        }

        // Calcular ángulo y distancia normalizada
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const normalizedDistance = Math.min(distance / maxDistance, 1);

        // Callback con los datos
        if (onMove) {
          onMove({
            x: dx / maxDistance,
            y: dy / maxDistance,
            angle,
            distance: normalizedDistance,
          });
        }
      },
      
      onPanResponderRelease: () => {
        // Volver al centro con animación
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 7,
          tension: 40,
        }).start();

        if (onStop) {
          onStop();
        }
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Base del joystick */}
      <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Círculos guía */}
        <View style={[styles.guideCircle, { width: size * 0.6, height: size * 0.6, borderRadius: (size * 0.6) / 2 }]} />
        <View style={[styles.guideCircle, { width: size * 0.3, height: size * 0.3, borderRadius: (size * 0.3) / 2 }]} />
      </View>

      {/* Stick movible */}
      <Animated.View
        style={[
          styles.stick,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.stickInner} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  base: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  stick: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(109, 166, 185, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  stickInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});