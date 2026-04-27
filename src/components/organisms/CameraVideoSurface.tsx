import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RTCView } from 'react-native-webrtc';

interface CameraVideoSurfaceProps {
  streamURL: string | null;
}

export default function CameraVideoSurface({
  streamURL,
}: CameraVideoSurfaceProps) {
  if (streamURL) {
    return (
      <RTCView
        streamURL={streamURL}
        style={styles.cameraView}
        objectFit="cover"
      />
    );
  }

  return (
    <View style={styles.noVideoContainer}>
      <Ionicons name="videocam-off-outline" size={64} color="#666" />
      <Text style={styles.noVideoTitle}>No se conectó a la cámara</Text>
      <Text style={styles.noVideoText}>
        Verifica que el robot esté encendido y disponible.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 24,
  },
  noVideoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noVideoText: {
    color: '#C7C7C7',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});