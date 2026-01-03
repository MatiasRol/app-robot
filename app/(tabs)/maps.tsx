import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapCard from '../../src/components/MapCard';
import { Colors } from '../../src/constants/Colors';
import { mockMaps } from '../../src/data/mockData';

export default function MapsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      {/* Header con foto de perfil, título y botón + */}
      <View style={styles.header}>
        
        {/* Foto de perfil - Arriba derecha */}
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Título centrado */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>¡TUS</Text>
          <Text style={styles.title}>MAPAS!</Text>
        </View>

        {/* Botón + (más) - Más grande y mejor posicionado */}
        <TouchableOpacity style={styles.addButton}>
          <Image
            source={require('../../assets/images/botonMas.png')}
            style={styles.addIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
      </View>

      {/* Lista de mapas */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {mockMaps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
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
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },
  profileButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textLight,
    letterSpacing: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: -20,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: Colors.surface,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  addIcon: {
    width: 40,
    height: 40,
    tintColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
});