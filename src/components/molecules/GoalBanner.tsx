import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { GoalPoint } from '../../../src/components/organisms/MapViewer';

interface GoalBannerProps {
  goalPoint: GoalPoint | null;
  onClear: () => void;
}

export function GoalBanner({ goalPoint, onClear }: GoalBannerProps) {
  if (!goalPoint) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Ionicons name="navigate" size={16} color="#00E5FF" />
        <Text style={styles.text}>
          Destino: ({goalPoint.worldX.toFixed(2)}, {goalPoint.worldY.toFixed(2)}) m
        </Text>
      </View>
      <TouchableOpacity onPress={onClear}>
        <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '600',
  },
});