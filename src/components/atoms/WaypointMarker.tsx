import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface WaypointMarkerProps {
  svgX: number;       // posición X en coordenadas SVG
  svgY: number;       // posición Y en coordenadas SVG
  confirmed: boolean; // false = girando, true = fijo
  orientationAngle?: number; // radianes, solo cuando confirmed = true
  number?: number;    // número de orden del waypoint
}

export default function WaypointMarker({
  svgX,
  svgY,
  confirmed,
  orientationAngle = 0,
  number,
}: WaypointMarkerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!confirmed) {
      // Girar continuamente
      rotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1, // infinito
        false
      );
    } else {
      // Cancelar animación y fijar en el ángulo calculado
      cancelAnimation(rotation);
      rotation.value = (orientationAngle * 180) / Math.PI;
    }
  }, [confirmed, orientationAngle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          position: 'absolute',
          left: svgX - 20,
          top: svgY - 20,
        },
      ]}
    >
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../../../assets/images/waypoint.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>
      {number !== undefined && (
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{number}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
  },
  numberBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
});