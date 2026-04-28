import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../lib/core/constants/Colors';
import { hapticLight } from '../lib/core/utils/haptics';
import {
  RobotPhoto,
  useRobotPhotos,
} from '../lib/modules/photos/hooks/useRobotPhotos';
import { usePhotoDownload } from '../lib/modules/photos/hooks/usePhotoDownload';

export default function PhotosScreen() {
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<RobotPhoto | null>(null);

  const { photos, loading, error, reloadPhotos } = useRobotPhotos();
  const { downloadingPhotoId, downloadPhoto } = usePhotoDownload();

  const isDownloadingSelected =
    !!selectedPhoto && downloadingPhotoId === String(selectedPhoto.id);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            void hapticLight();
            router.back();
          }}
          activeOpacity={0.85}
        >
          <Image
            source={require('../assets/images/regreso.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>TUS{'\n'}FOTOS!</Text>
          <Text style={styles.subtitle}>
            Aquí podrás ver, abrir y descargar las imágenes guardadas.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.helperText}>Cargando fotos...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyTitle}>No se pudieron cargar</Text>
            <Text style={styles.helperText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                void hapticLight();
                void reloadPhotos();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>REINTENTAR</Text>
            </TouchableOpacity>
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyTitle}>No hay fotos todavía</Text>
            <Text style={styles.helperText}>
              Las imágenes subidas por el robot aparecerán aquí.
            </Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => {
                  void hapticLight();
                  setSelectedPhoto(item);
                }}
              >
                <Image
                  source={{ uri: item.url }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              </Pressable>
            )}
          />
        )}

        <Modal
          visible={selectedPhoto !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => {
                void hapticLight();
                setSelectedPhoto(null);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {selectedPhoto && (
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: selectedPhoto.url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <Text style={styles.modalTitle}>{selectedPhoto.file_name}</Text>

                <TouchableOpacity
                  style={[
                    styles.downloadButton,
                    isDownloadingSelected && styles.downloadButtonDisabled,
                  ]}
                  onPress={() => {
                    void downloadPhoto(selectedPhoto);
                  }}
                  disabled={isDownloadingSelected}
                  activeOpacity={0.85}
                >
                  {isDownloadingSelected ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.downloadButtonText}>DESCARGAR</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 16,
    zIndex: 20,
  },
  backIcon: {
    width: 40,
    height: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 30,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 16,
    color: Colors.textSecondary,
    maxWidth: 230,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 16,
    minWidth: 140,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#124BAF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalClose: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 30,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '68%',
  },
  modalTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  downloadButton: {
    marginTop: 16,
    minWidth: 170,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#124BAF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
  },
  downloadButtonDisabled: {
    opacity: 0.75,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});