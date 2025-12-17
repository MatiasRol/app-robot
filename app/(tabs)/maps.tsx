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
      
      {/* Header con foto de perfil y título */}
      <View style={styles.header}>
        
        {/* ICONO DE CASA - ARRIBA IZQUIERDA */}
        <TouchableOpacity style={styles.homeButton}>
          <Image
            source={require('../../assets/images/casa.png')}
            style={styles.homeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>¡TUS</Text>
          <Text style={styles.title}>MAPAS!</Text>
        </View>
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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  homeButton: {
    position: 'absolute',
    top: 16,
    left: 24,
    padding: 8,
  },
  homeIcon: {
    width: 40,
    height: 40,
  },
  profileButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    borderRadius: 30,
    overflow: 'hidden',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.textLight,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textLight,
    textAlign: 'center',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
});