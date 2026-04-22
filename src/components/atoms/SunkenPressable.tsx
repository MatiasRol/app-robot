import React, { ReactNode, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SunkenPressableProps {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeScale?: number;
  activeTranslateY?: number;
  activeOpacity?: number;
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
}

export default function SunkenPressable({
  children,
  onPress,
  style,
  disabled = false,
  activeScale = 0.97,
  activeTranslateY = 2,
  activeOpacity = 0.92,
  hitSlop,
}: SunkenPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const animateToPressed = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: activeScale,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: activeTranslateY,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: activeOpacity,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateToReleased = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={animateToPressed}
      onPressOut={animateToReleased}
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim },
          ],
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}