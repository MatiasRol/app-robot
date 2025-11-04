import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { MapItem } from '../types';

interface MapCardProps {
  map: MapItem;
}

export default function MapCard({ map }: MapCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => router.push(`/map-detail/${map.id}`)}
    >
      {/* Thumbnail Placeholder */}
      <View style={styles.thumbnail}>
        <Ionicons name="map" size={48} color={Colors.primary} />
      </View>

      {/* Map Info */}
      <View style={styles.info}>
        <View style={styles.header}>
          <Ionicons name="home" size={16} color={Colors.primary} />
          <Text style={styles.mapName}>{map.name}</Text>
        </View>
        <Text style={styles.mapSize}>{map.size}</Text>
        <Text style={styles.mapDate}>
          {map.createdAt.toLocaleDateString('es-ES')}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIcon}>
          <Ionicons name="ellipsis-horizontal" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Layout.spacing.xs,
  },
  mapName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  mapSize: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  mapDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'column',
    gap: Layout.spacing.sm,
  },
  actionIcon: {
    padding: Layout.spacing.xs,
  },
});