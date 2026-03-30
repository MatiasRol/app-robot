import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { CoordRow } from '../atoms/CoordRow';

export interface TappedPoint {
  worldX: number;
  worldY: number;
  pixelX: number;
  pixelY: number;
}

interface CoordPanelProps {
  point: TappedPoint | null;
  onClose: () => void;
  onConfirmGoal: () => void;
}

export function CoordPanel({ point, onClose, onConfirmGoal }: CoordPanelProps) {
  if (!point) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>📍 Punto seleccionado</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <CoordRow label="X" value={`${point.worldX.toFixed(3)} m`} />
      <CoordRow label="Y" value={`${point.worldY.toFixed(3)} m`} />
      <CoordRow label="Píxel" value={`(${point.pixelX}, ${point.pixelY})`} />

      <TouchableOpacity style={styles.confirmButton} onPress={onConfirmGoal}>
        <Ionicons name="navigate" size={14} color="#000" />
        <Text style={styles.confirmText}>Establecer como destino</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 14,
    padding: 14,
    minWidth: 200,
    zIndex: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  confirmButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
  },
  confirmText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
});