import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapCard from '../../src/components/MapCard';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';
import { mockMaps } from '../../src/data/mockData';

export default function MapsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with empty state message */}
      <View style={styles.header}>
        <Text style={styles.emptyTitle}>¡TUS MAPAS!</Text>
        <Text style={styles.emptySubtitle}>
          No tienes ningún mapa guardado
        </Text>
      </View>

      {/* Maps List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todos los mapas</Text>
          {mockMaps.map((map) => (
            <MapCard key={map.id} map={map} />
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="person-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="location-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/connecting')}
        >
          <Ionicons name="checkmark-circle" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Layout.spacing.xl,
  },
  section: {
    marginTop: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Layout.spacing.md,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    padding: Layout.spacing.sm,
  },
});