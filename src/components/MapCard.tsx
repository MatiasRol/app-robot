import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
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
      activeOpacity={0.8}
    >
      {/* Icono del mapa */}
      <View style={styles.iconContainer}>
        <Ionicons name="home" size={20} color={Colors.primary} />
      </View>

      {/* Thumbnail del mapa */}
      <View style={styles.thumbnail}>
        <Image
          source={{ uri: map.thumbnail }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      </View>

      {/* Info del mapa - SOLO NOMBRE */}
      <View style={styles.info}>
        <Text style={styles.mapName}>{map.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbnail: {
    width: 100,
    height: 80,
    backgroundColor: '#D0D0D0',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  mapName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
});