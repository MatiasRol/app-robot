import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

interface JoystickProps {
  onMove?: (data: { 
    direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'center'; 
    distance: number 
  }) => void;
  onStop?: () => void;
  size?: number;
  deadZone?: number;
}

export default function Joystick({ 
  onMove, 
  onStop, 
  size = 140,
  deadZone = 0.15 
}: JoystickProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [currentDirection, setCurrentDirection] = useState<string>('center');
  const maxDistance = size / 2 - 25;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderMove: (_, gesture) => {
        const { dx, dy } = gesture;
        
        // Calcular distancia total desde el centro
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        
        // Si está en la zona muerta, considerar como centro
        if (normalizedDistance < deadZone) {
          pan.setValue({ x: 0, y: 0 });
          const direction = 'center';
          setCurrentDirection(direction);
          if (onMove) {
            onMove({ direction, distance: 0 });
          }
          return;
        }
        
        // Calcular ángulo en grados (0-360)
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        
        // Determinar dirección (8 direcciones)
        let direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'center';
        let snapX = 0;
        let snapY = 0;
        
        const clampedDistance = Math.min(distance, maxDistance);
        
        // 8 direcciones basadas en ángulos
        if (angle >= 337.5 || angle < 22.5) {
          // Derecha (0°)
          direction = 'right';
          snapX = clampedDistance;
          snapY = 0;
        } else if (angle >= 22.5 && angle < 67.5) {
          // Abajo-Derecha (45°)
          direction = 'down-right';
          snapX = clampedDistance * 0.707; // cos(45°)
          snapY = clampedDistance * 0.707; // sin(45°)
        } else if (angle >= 67.5 && angle < 112.5) {
          // Abajo (90°)
          direction = 'down';
          snapX = 0;
          snapY = clampedDistance;
        } else if (angle >= 112.5 && angle < 157.5) {
          // Abajo-Izquierda (135°)
          direction = 'down-left';
          snapX = -clampedDistance * 0.707;
          snapY = clampedDistance * 0.707;
        } else if (angle >= 157.5 && angle < 202.5) {
          // Izquierda (180°)
          direction = 'left';
          snapX = -clampedDistance;
          snapY = 0;
        } else if (angle >= 202.5 && angle < 247.5) {
          // Arriba-Izquierda (225°)
          direction = 'up-left';
          snapX = -clampedDistance * 0.707;
          snapY = -clampedDistance * 0.707;
        } else if (angle >= 247.5 && angle < 292.5) {
          // Arriba (270°)
          direction = 'up';
          snapX = 0;
          snapY = -clampedDistance;
        } else {
          // Arriba-Derecha (315°)
          direction = 'up-right';
          snapX = clampedDistance * 0.707;
          snapY = -clampedDistance * 0.707;
        }
        
        // Animar hacia la dirección seleccionada
        Animated.spring(pan, {
          toValue: { x: snapX, y: snapY },
          useNativeDriver: false,
          friction: 10,
          tension: 100,
        }).start();
        
        setCurrentDirection(direction);
        
        // Callback con dirección y distancia normalizada
        if (onMove) {
          onMove({
            direction,
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

        setCurrentDirection('center');
        
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
        {/* Guías direccionales (8 direcciones) */}
        <View style={styles.guidesContainer}>
          {/* Arriba */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorUp, 
            currentDirection === 'up' && styles.activeIndicator
          ]} />
          
          {/* Arriba-Derecha */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorUpRight, 
            currentDirection === 'up-right' && styles.activeIndicator
          ]} />
          
          {/* Derecha */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorRight, 
            currentDirection === 'right' && styles.activeIndicator
          ]} />
          
          {/* Abajo-Derecha */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorDownRight, 
            currentDirection === 'down-right' && styles.activeIndicator
          ]} />
          
          {/* Abajo */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorDown, 
            currentDirection === 'down' && styles.activeIndicator
          ]} />
          
          {/* Abajo-Izquierda */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorDownLeft, 
            currentDirection === 'down-left' && styles.activeIndicator
          ]} />
          
          {/* Izquierda */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorLeft, 
            currentDirection === 'left' && styles.activeIndicator
          ]} />
          
          {/* Arriba-Izquierda */}
          <View style={[
            styles.directionIndicator, 
            styles.indicatorUpLeft, 
            currentDirection === 'up-left' && styles.activeIndicator
          ]} />
        </View>
        
        {/* Círculo central */}
        <View style={styles.centerCircle} />
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
  guidesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  directionIndicator: {
    position: 'absolute',
    width: 25,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  activeIndicator: {
    backgroundColor: 'rgba(109, 166, 185, 1)',
    height: 4,
    shadowColor: '#6DA6B9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  // Direcciones cardinales (4 principales)
  indicatorUp: {
    top: 8,
    left: '50%',
    marginLeft: -12.5,
  },
  indicatorDown: {
    bottom: 8,
    left: '50%',
    marginLeft: -12.5,
  },
  indicatorLeft: {
    left: 8,
    top: '50%',
    marginTop: -1.5,
    transform: [{ rotate: '90deg' }],
  },
  indicatorRight: {
    right: 8,
    top: '50%',
    marginTop: -1.5,
    transform: [{ rotate: '90deg' }],
  },
  // Direcciones diagonales
  indicatorUpRight: {
    top: 18,
    right: 18,
    transform: [{ rotate: '45deg' }],
  },
  indicatorUpLeft: {
    top: 18,
    left: 18,
    transform: [{ rotate: '-45deg' }],
  },
  indicatorDownRight: {
    bottom: 18,
    right: 18,
    transform: [{ rotate: '-45deg' }],
  },
  indicatorDownLeft: {
    bottom: 18,
    left: 18,
    transform: [{ rotate: '45deg' }],
  },
  centerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stick: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(109, 166, 185, 0.9)',
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