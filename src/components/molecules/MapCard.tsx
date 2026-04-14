import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { MapItem } from '../../../lib/core/types';

interface MapCardProps {
  map: MapItem;
  isActive: boolean;
}

export default function MapCard({ map }: MapCardProps) {
  const router = useRouter();

  const imageUri = map.thumbnail || map.png_url || '';

  const imageSource: ImageSourcePropType | undefined = imageUri
    ? { uri: imageUri }
    : undefined;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/map-detail/${map.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Image
            source={require('../../../assets/images/casa.png')}
            style={styles.houseIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.mapName}>{map.name}</Text>
      </View>

      <View style={styles.previewContainer}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.placeholderText}>Sin vista previa</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  houseIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
  },
  mapName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E2E2E',
  },
  previewContainer: {
    width: '100%',
    height: 150,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#D9D9D9',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9D9D9',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});