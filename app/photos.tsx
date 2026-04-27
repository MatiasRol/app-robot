import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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

type PhotoItem = {
  id: string;
  title: string;
  source: any;
};

export default function PhotosScreen() {
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const photos = useMemo<PhotoItem[]>(
    () => [
      {
        id: '1',
        title: 'Foto 1',
        source: require('../assets/images/robot01.png'),
      },
      {
        id: '2',
        title: 'Foto 2',
        source: require('../assets/images/robot01.png'),
      },
      {
        id: '3',
        title: 'Foto 3',
        source: require('../assets/images/robot01.png'),
      },
      {
        id: '4',
        title: 'Foto 4',
        source: require('../assets/images/robot01.png'),
      },
      {
        id: '5',
        title: 'Foto 5',
        source: require('../assets/images/robot01.png'),
      },
      {
        id: '6',
        title: 'Foto 6',
        source: require('../assets/images/robot01.png'),
      },
    ],
    []
  );

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
            Aquí podrás ver y abrir las imágenes guardadas.
          </Text>
        </View>

        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
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
              <Image source={item.source} style={styles.cardImage} />
            </Pressable>
          )}
        />

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
                  source={selectedPhoto.source}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalTitle}>{selectedPhoto.title}</Text>
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
    height: '72%',
  },
  modalTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});