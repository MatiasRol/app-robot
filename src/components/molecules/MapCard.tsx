import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { MapItem } from '../../../lib/core/types';

interface MapCardProps {
  map: MapItem;
  isActive: boolean;
}

export default function MapCard({ map, isActive }: MapCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/map-detail/${map.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../../../assets/images/casa.png')}
            style={styles.houseIcon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.mapName}>{map.name}</Text>
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: isActive ? '#4CAF50' : '#9E9E9E' },
              ]}
            />
          </View>
          <View style={styles.robotInfo}>
            <Image
              source={require('../../../assets/images/robotNav.png')}
              style={styles.robotIcon}
              resizeMode="contain"
            />
            <Text style={styles.robotText}>{map.size}</Text>
          </View>
        </View>
      </View>
      <View style={styles.thumbnail}>
        <View style={styles.thumbnailPlaceholder} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.accent,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  houseIcon: { width: 28, height: 28, tintColor: Colors.primary },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  mapName: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  robotInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  robotIcon: { width: 16, height: 16, tintColor: Colors.textSecondary },
  robotText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  thumbnail: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden' },
  thumbnailPlaceholder: { width: '100%', height: '100%', backgroundColor: '#D0D0D0' },
});