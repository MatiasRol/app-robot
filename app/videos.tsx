import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useMemo, useState } from 'react';
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
  RobotVideo,
  useRobotVideos,
} from '../lib/modules/videos/hooks/useRobotVideos';

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function VideoPlayerCard({ source }: { source: string }) {
  const player = useVideoPlayer(
    {
      uri: source,
      useCaching: false,
    },
    (videoPlayer) => {
      videoPlayer.loop = false;
      videoPlayer.play();
    }
  );

  return (
    <VideoView
      player={player}
      style={styles.modalVideo}
      contentFit="contain"
      allowsFullscreen
      nativeControls
    />
  );
}

export default function VideosScreen() {
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<RobotVideo | null>(null);

  const { videos, loading, error, reloadVideos } = useRobotVideos();

  const selectedStreamUrl = useMemo(() => {
    return selectedVideo?.stream_url || null;
  }, [selectedVideo]);

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
            Aquí podrás ver las portadas y abrir los videos guardados.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.helperText}>Cargando videos...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyTitle}>No se pudieron cargar</Text>
            <Text style={styles.helperText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                void hapticLight();
                void reloadVideos();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>REINTENTAR</Text>
            </TouchableOpacity>
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyTitle}>No hay videos todavía</Text>
            <Text style={styles.helperText}>
              Las portadas subidas por el robot aparecerán aquí.
            </Text>
          </View>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const duration = formatDuration(item.duration_seconds);
              const title = item.title?.trim() || item.cover_file_name;

              return (
                <Pressable
                  style={styles.card}
                  onPress={() => {
                    void hapticLight();
                    setSelectedVideo(item);
                  }}
                >
                  <View style={styles.thumbnailWrap}>
                    <Image
                      source={{ uri: item.cover_url }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />

                    <View style={styles.playOverlay}>
                      <Ionicons name="play" size={28} color="#FFFFFF" />
                    </View>

                    {duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{duration}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardTitle}>{title}</Text>
                </Pressable>
              );
            }}
          />
        )}

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
                {selectedStreamUrl ? (
                  <VideoPlayerCard source={selectedStreamUrl} />
                ) : (
                  <View style={styles.modalFallback}>
                    <Image
                      source={{ uri: selectedVideo.cover_url }}
                      style={styles.modalThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.modalPlayOverlay}>
                      <Ionicons name="warning-outline" size={54} color="#FFFFFF" />
                    </View>
                  </View>
                )}

                <Text style={styles.modalTitle}>
                  {selectedVideo.title?.trim() || selectedVideo.cover_file_name}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {selectedStreamUrl
                    ? 'Reproduciendo video desde el robot.'
                    : 'Este video todavía no tiene identificador para reproducirse.'}
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
    paddingHorizontal: 18,
    paddingTop: 56,
    paddingBottom: 14,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 30,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 16,
    color: Colors.textSecondary,
    maxWidth: 240,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 14,
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
    textAlign: 'right',
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
  modalVideo: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  modalFallback: {
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