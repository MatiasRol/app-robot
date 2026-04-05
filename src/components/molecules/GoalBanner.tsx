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
        <Ionicons name="navigate" size={16} color={Colors.mapBorder} />
        <Text style={styles.text}>
          Destino: ({goalPoint.worldX.toFixed(2)}, {goalPoint.worldY.toFixed(2)}) m
        </Text>
      </View>
      <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
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
    backgroundColor: Colors.surface + 'F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 20,
    borderWidth: 1,
    borderColor: Colors.mapBorder + '80',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: Colors.mapBorder,
    fontSize: 13,
    fontWeight: '600',
  },
});