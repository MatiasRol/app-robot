import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

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
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <CoordRow label="X" value={`${point.worldX.toFixed(3)} m`} />
      <CoordRow label="Y" value={`${point.worldY.toFixed(3)} m`} />
      <CoordRow label="Píxel" value={`(${point.pixelX}, ${point.pixelY})`} />

      <TouchableOpacity style={styles.confirmBtn} onPress={onConfirmGoal}>
        <Ionicons name="navigate" size={14} color={Colors.text} />
        <Text style={styles.confirmText}>Establecer como destino</Text>
      </TouchableOpacity>
    </View>
  );
}

function CoordRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: Colors.surface + 'F0',
    borderRadius: 16,
    padding: 16,
    minWidth: 210,
    zIndex: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '80',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    gap: 12,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    width: 40,
  },
  value: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  confirmBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  confirmText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});