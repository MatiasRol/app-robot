import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

interface JoystickProps {
  onMove?: (data: {
    direction:
      | 'up'
      | 'down'
      | 'left'
      | 'right'
      | 'up-left'
      | 'up-right'
      | 'down-left'
      | 'down-right'
      | 'center';
    distance: number;
  }) => void;
  onStop?: () => void;
  size?: number;
  deadZone?: number;
}

export default function Joystick({
  onMove,
  onStop,
  size = 148,
  deadZone = 0.15,
}: JoystickProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [currentDirection, setCurrentDirection] = useState<string>('center');
  const maxDistance = size / 2 - 28;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        const { dx, dy } = gesture;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = Math.min(distance / maxDistance, 1);

        if (normalizedDistance < deadZone) {
          pan.setValue({ x: 0, y: 0 });
          const direction = 'center';
          setCurrentDirection(direction);
          onMove?.({ direction, distance: 0 });
          return;
        }

        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        let direction:
          | 'up'
          | 'down'
          | 'left'
          | 'right'
          | 'up-left'
          | 'up-right'
          | 'down-left'
          | 'down-right'
          | 'center';

        let snapX = 0;
        let snapY = 0;
        const clampedDistance = Math.min(distance, maxDistance);

        if (angle >= 337.5 || angle < 22.5) {
          direction = 'right';
          snapX = clampedDistance;
          snapY = 0;
        } else if (angle >= 22.5 && angle < 67.5) {
          direction = 'down-right';
          snapX = clampedDistance * 0.707;
          snapY = clampedDistance * 0.707;
        } else if (angle >= 67.5 && angle < 112.5) {
          direction = 'down';
          snapX = 0;
          snapY = clampedDistance;
        } else if (angle >= 112.5 && angle < 157.5) {
          direction = 'down-left';
          snapX = -clampedDistance * 0.707;
          snapY = clampedDistance * 0.707;
        } else if (angle >= 157.5 && angle < 202.5) {
          direction = 'left';
          snapX = -clampedDistance;
          snapY = 0;
        } else if (angle >= 202.5 && angle < 247.5) {
          direction = 'up-left';
          snapX = -clampedDistance * 0.707;
          snapY = -clampedDistance * 0.707;
        } else if (angle >= 247.5 && angle < 292.5) {
          direction = 'up';
          snapX = 0;
          snapY = -clampedDistance;
        } else {
          direction = 'up-right';
          snapX = clampedDistance * 0.707;
          snapY = -clampedDistance * 0.707;
        }

        Animated.spring(pan, {
          toValue: { x: snapX, y: snapY },
          useNativeDriver: false,
          friction: 9,
          tension: 120,
        }).start();

        setCurrentDirection(direction);
        onMove?.({
          direction,
          distance: normalizedDistance,
        });
      },

      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 8,
          tension: 65,
        }).start();

        setCurrentDirection('center');
        onStop?.();
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <View style={styles.innerRing} />
        <View style={styles.guidesContainer}>
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorUp,
              currentDirection === 'up' && styles.activeIndicator,
            ]}
          />
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorUpRight,
              currentDirection === 'up-right' && styles.activeIndicator,
            ]}
          />
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorRight,
              currentDirection === 'right' && styles.activeIndicator,
            ]}
          />
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorDownRight,
              currentDirection === 'down-right' && styles.activeIndicator,
            ]}
          />
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorDown,
              currentDirection === 'down' && styles.activeIndicator,
            ]}
          />
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorDownLeft,
              currentDirection === 'down-left' && styles.activeIndicator,
            ]}
          />
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorLeft,
              currentDirection === 'left' && styles.activeIndicator,
            ]}
          />
          <View
            style={[
              styles.directionIndicator,
              styles.indicatorUpLeft,
              currentDirection === 'up-left' && styles.activeIndicator,
            ]}
          />
        </View>

        <View style={styles.centerCircle} />
      </View>

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
    backgroundColor: 'rgba(13, 17, 28, 0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(157, 193, 255, 0.24)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  innerRing: {
    position: 'absolute',
    width: '72%',
    height: '72%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(157, 193, 255, 0.12)',
  },
  guidesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  directionIndicator: {
    position: 'absolute',
    width: 22,
    height: 3,
    backgroundColor: 'rgba(157, 193, 255, 0.14)',
    borderRadius: 2,
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
    height: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
  },
  indicatorUp: {
    top: 10,
    left: '50%',
    marginLeft: -11,
  },
  indicatorDown: {
    bottom: 10,
    left: '50%',
    marginLeft: -11,
  },
  indicatorLeft: {
    left: 10,
    top: '50%',
    marginTop: -1.5,
    transform: [{ rotate: '90deg' }],
  },
  indicatorRight: {
    right: 10,
    top: '50%',
    marginTop: -1.5,
    transform: [{ rotate: '90deg' }],
  },
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(19, 25, 40, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(157, 193, 255, 0.18)',
  },
  stick: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.36)',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  stickInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    opacity: 0.92,
  },
});