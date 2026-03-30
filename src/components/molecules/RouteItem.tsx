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
      <View style={styles.info}>
        <Ionicons name="map-outline" size={20} color={Colors.textSecondary} />
        <View style={styles.details}>
          <Text style={styles.name}>{route.name}</Text>
          {route.schedule && (
            <Text style={styles.schedule}>{route.schedule}</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  details: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  schedule: { fontSize: 13, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8 },
});