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
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/images/casa.png')}
            style={styles.houseIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.mapName}>{map.name}</Text>
          <View style={styles.robotInfo}>
            <Image
              source={require('../../assets/images/robotNav.png')}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.accent,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  houseIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.primary,
  },
  info: {
    flex: 1,
  },
  mapName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  robotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  robotIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textSecondary,
  },
  robotText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D0D0D0',
  },
});