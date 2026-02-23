import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

export interface ModeOption<T extends string> {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface ModeSelectorProps<T extends string> {
  options: ModeOption<T>[];
  activeMode: T;
  onSelect: (mode: T) => void;
  style?: object;
}

export default function ModeSelector<T extends string>({
  options,
  activeMode,
  onSelect,
  style,
}: ModeSelectorProps<T>) {
  return (
    <View style={[styles.tabs, style]}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.tab, activeMode === opt.value && styles.tabActive]}
          onPress={() => onSelect(opt.value)}
        >
          {opt.icon && (
            <Ionicons
              name={opt.icon}
              size={20}
              color={activeMode === opt.value ? '#FFFFFF' : '#666'}
            />
          )}
          <Text style={[styles.tabText, activeMode === opt.value && styles.tabTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    padding: 4,
    gap: 4,
    elevation: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#FFFFFF' },
});