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

type VideoItem = {
  id: string;
  title: string;
  thumbnail: any;
  duration: string;
};

export default function VideosScreen() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const videos = useMemo<VideoItem[]>(
    () => [
      {
        id: '1',
        title: 'Video 1',
        thumbnail: require('../assets/images/robot01.png'),
        duration: '00:18',
      },
      {
        id: '2',
        title: 'Video 2',
        thumbnail: require('../assets/images/robot01.png'),
        duration: '00:32',
      },
      {
        id: '3',
        title: 'Video 3',
        thumbnail: require('../assets/images/robot01.png'),
        duration: '01:05',
      },
      {
        id: '4',
        title: 'Video 4',
        thumbnail: require('../assets/images/robot01.png'),
        duration: '00:41',
      },
      {
        id: '5',
        title: 'Video 5',
        thumbnail: require('../assets/images/robot01.png'),
        duration: '00:27',
      },
      {
        id: '6',
        title: 'Video 6',
        thumbnail: require('../assets/images/robot01.png'),
        duration: '00:54',
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
          <Text style={styles.title}>TUS{'\n'}VIDEOS!</Text>
          <Text style={styles.subtitle}>
            Aquí podrás ver las miniaturas y abrir los videos guardados.
          </Text>
        </View>

        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => {
                void hapticLight();
                setSelectedVideo(item);
              }}
            >
              <View style={styles.thumbnailWrap}>
                <Image source={item.thumbnail} style={styles.thumbnail} />
                <View style={styles.playOverlay}>
                  <Ionicons name="play" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
            </Pressable>
          )}
        />

        <Modal
          visible={selectedVideo !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedVideo(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => {
                void hapticLight();
                setSelectedVideo(null);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {selectedVideo && (
              <View style={styles.modalContent}>
                <View style={styles.modalVideoMock}>
                  <Image
                    source={selectedVideo.thumbnail}
                    style={styles.modalThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.modalPlayOverlay}>
                    <Ionicons name="play-circle" size={72} color="#FFFFFF" />
                  </View>
                </View>

                <Text style={styles.modalTitle}>{selectedVideo.title}</Text>
                <Text style={styles.modalSubtitle}>
                  Aquí luego conectamos la reproducción real del video.
                </Text>
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
    maxWidth: 240,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#D9D9D9',
    overflow: 'hidden',
  },
  thumbnailWrap: {
    width: '100%',
    height: 170,
    backgroundColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  modalVideoMock: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalThumbnail: {
    width: '100%',
    height: '100%',
  },
  modalPlayOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#D1D1D1',
    textAlign: 'center',
    lineHeight: 18,
  },
});