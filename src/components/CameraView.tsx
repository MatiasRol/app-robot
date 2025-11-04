import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function CameraView() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="camera-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.placeholderText}>
          Conectando a cámara...
        </Text>
        <Text style={styles.placeholderSubtext}>
          La transmisión en vivo aparecerá aquí
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
});