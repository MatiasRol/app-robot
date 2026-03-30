import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { OperationMode } from '../../../lib/modules/maps/hooks/useOperationMode';

interface OperationModeSelectorProps {
  mode: OperationMode;
  onChange: (mode: OperationMode) => void;
}

export function OperationModeSelector({ mode, onChange }: OperationModeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modo de operación</Text>
      <View style={styles.tabs}>
        {(['vigilancia', 'servicio'] as OperationMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.tab, mode === m && styles.tabActive]}
            onPress={() => onChange(m)}
          >
            <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
              {m === 'vigilancia' ? 'Vigilancia' : 'Servicio'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#FFFFFF' },
});