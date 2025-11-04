import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CameraView from '../../src/components/CameraView';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';

export default function CameraScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Connection Status */}
      <View style={styles.header}>
        <View style={styles.robotInfo}>
          <View style={styles.robotAvatar}>
            <Ionicons name="hardware-chip" size={32} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.connectingText}>Conectando a</Text>
            <Text style={styles.robotName}>Robot 1</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Camera Stream */}
      <View style={styles.cameraContainer}>
        <CameraView />
      </View>

      {/* Placeholder Image (como en tu diseño) */}
      <View style={styles.imagePreview}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.imagePlaceholderText}>
            Vista previa de la cámara
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  robotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  robotAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  robotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    padding: Layout.spacing.xs,
  },
  cameraContainer: {
    height: 200,
    marginBottom: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  imagePreview: {
    flex: 1,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
  },
});