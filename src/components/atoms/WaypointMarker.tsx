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
  svgX: number;
  svgY: number;
  confirmed: boolean;
  orientationAngle?: number;
  number?: number;
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
      rotation.value = withRepeat(
        withTiming(360, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = (orientationAngle * 180) / Math.PI;
    }
  }, [confirmed, orientationAngle, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          position: 'absolute',
          left: svgX - 18,
          top: svgY - 18,
        },
      ]}
    >
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../../../assets/images/waypoints.png')}
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 36,
    height: 36,
  },
  numberBadge: {
    position: 'absolute',
    top: -7,
    right: -7,
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
    color: '#0D111C',
  },
});