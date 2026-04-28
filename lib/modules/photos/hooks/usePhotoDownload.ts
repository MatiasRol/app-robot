import React from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import {
  hapticError,
  hapticLight,
  hapticSuccess,
  hapticWarning,
} from '../../../core/utils/haptics';
import type { RobotPhoto } from './useRobotPhotos';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function usePhotoDownload() {
  const [downloadingPhotoId, setDownloadingPhotoId] = React.useState<string | null>(null);

  const downloadPhoto = React.useCallback(async (photo: RobotPhoto) => {
    try {
      if (!photo.url) {
        void hapticWarning();
        Alert.alert('Descarga', 'La foto no tiene una URL válida.');
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        void hapticWarning();
        Alert.alert(
          'Permiso requerido',
          'Debes permitir acceso a tus fotos para guardar la imagen.'
        );
        return;
      }

      setDownloadingPhotoId(String(photo.id));
      void hapticLight();

      const fileName = sanitizeFileName(photo.file_name || `foto_${photo.id}.jpg`);
      const targetUri = `${FileSystem.cacheDirectory}${fileName}`;

      const result = await FileSystem.downloadAsync(photo.url, targetUri);

      const asset = await MediaLibrary.createAssetAsync(result.uri);
      const existingAlbum = await MediaLibrary.getAlbumAsync('Robot Fotos');

      if (existingAlbum) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], existingAlbum, false);
      } else {
        await MediaLibrary.createAlbumAsync('Robot Fotos', asset, false);
      }

      void hapticSuccess();
      Alert.alert('Descarga completa', 'La foto se guardó en tu galería.');
    } catch (error) {
      console.error('Error descargando foto:', error);
      void hapticError();
      Alert.alert('Error', 'No se pudo descargar la foto.');
    } finally {
      setDownloadingPhotoId(null);
    }
  }, []);

  return {
    downloadingPhotoId,
    downloadPhoto,
  };
}