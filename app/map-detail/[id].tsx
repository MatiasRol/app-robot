import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';
import { mockMaps } from '../../src/data/mockData';

export default function MapDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const map = mockMaps.find(m => m.id === id);

  if (!map) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Mapa no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Preview */}
      <View style={styles.mapPreview}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={80} color={Colors.primary} />
          <Text style={styles.mapPlaceholderText}>Vista del mapa</Text>
        </View>
      </View>

      {/* Map Info */}
      <ScrollView style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="home" size={24} color={Colors.primary} />
            <Text style={styles.mapName}>{map.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="resize-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Tamaño:</Text>
            <Text style={styles.infoValue}>{map.size}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Creado:</Text>
            <Text style={styles.infoValue}>
              {map.createdAt.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={Colors.text} />
            <Text style={styles.actionButtonText}>Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color={Colors.text} />
            <Text style={styles.actionButtonText}>Descargar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPreview: {
    height: 300,
    backgroundColor: Colors.surface,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
  },
  infoSection: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  mapName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  actionButtons: {
    gap: Layout.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.error,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
  },
});