import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

export interface Route {
  id: string;
  name: string;
  schedule?: string;
}

interface RouteItemProps {
  route: Route;
  onEdit: () => void;
  onDelete: () => void;
}

export function RouteItem({ route, onEdit, onDelete }: RouteItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="hardware-chip-outline" size={18} color={Colors.textSecondary} />
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{route.name}</Text>
        {route.schedule && (
          <Text style={styles.schedule}>{route.schedule}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
        <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider + '30',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  schedule: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  editBtn: {
    padding: 8,
  },
});