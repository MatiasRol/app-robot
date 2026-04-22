import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/core/constants/Colors';
import { hapticLight } from '../../lib/core/utils/haptics';
import { useApp } from '../../lib/modules/app/context/AppContext';
import MapCard from '../../src/components/molecules/MapCard';

export default function MapsScreen() {
  const { maps, mapsLoading, mapsError, reloadMaps, selectedMapId } = useApp();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>TUS{'\n'}MAPAS!</Text>
          <Text style={styles.subtitle}>
            Inicia el mapeo desde el robot para agregar nuevos mapas.
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {mapsLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.helperText}>Cargando mapas...</Text>
            </View>
          ) : mapsError ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyTitle}>No se pudieron cargar</Text>
              <Text style={styles.helperText}>{mapsError}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={() => {
                  void hapticLight();
                  void reloadMaps();
                }}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : maps.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyTitle}>No hay mapas todavía</Text>
              <Text style={styles.helperText}>
                Inicia el mapeo desde el robot para agregar nuevos mapas.
              </Text>
            </View>
          ) : (
            maps.map((map) => (
              <MapCard
                key={map.id}
                map={map}
                isActive={map.id === selectedMapId}
              />
            ))
          )}
        </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 20,
  },
  centerContent: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});