import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BatteryBarProps {
  percentage: number;
}

export default function BatteryBar({ percentage }: BatteryBarProps) {
  const color = percentage > 50 ? '#4CAF50' : percentage > 20 ? '#FF9800' : '#F44336';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{percentage}%</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { height: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  label: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  track: {
    width: 35,
    height: 160,
    backgroundColor: '#E0E0E0',
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', borderRadius: 18 },
});