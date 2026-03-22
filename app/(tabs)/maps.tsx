import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { useApp } from '../../lib/modules/app/context/AppContext';
import MapCard from '../../src/components/molecules/MapCard';

export default function MapsScreen() {
  const { maps, mapsLoading, selectedMapId } = useApp();

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileButton}>
          <Image
            source={require('../../assets/images/avatar-placeholder.png')}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>¡TUS</Text>
          <Text style={styles.title}>MAPAS!</Text>
        </View>
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {mapsLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.emptyText}>Cargando mapas...</Text>
          </View>
        ) : maps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>Sin mapas disponibles</Text>
            <Text style={styles.emptyText}>
              Sube un mapa desde el script Python para verlo aquí
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252932',
  },
  header: {
    backgroundColor: '#252932',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileButton: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.primary,
    width: 60,
    height: 60,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  titleContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textLight,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});