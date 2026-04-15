import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

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
      <View
        style={[
          styles.iconWrap,
          {
            opacity: confirmed ? 1 : 0.94,
            transform: [{ rotate: `${(orientationAngle * 180) / Math.PI}deg` }],
          },
        ]}
      >
        <Image
          source={require('../../../assets/images/waypoint.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

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
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 38,
    height: 38,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  numberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
});