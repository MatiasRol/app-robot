import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

interface CoordRowProps {
  label: string;
  value: string;
}

export function CoordRow({ label, value }: CoordRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    width: 40,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});