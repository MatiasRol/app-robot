import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        
        {/* Área del mapa con imagen de fondo - ocupa toda la pantalla */}
        <ImageBackground
          source={require('../../assets/images/map-background.png')}
          style={styles.mapCanvas}
          imageStyle={styles.mapImage}
          resizeMode="cover"
        >
          
          {/* Campo de texto para nombre del mapa - DENTRO del mapa */}
          <View style={styles.nameInputContainer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.nameInput}>
              <Text style={styles.nameInputText}>Nombre del Mapa</Text>
            </View>
          </View>

          {/* Área central del mapa (contenido flexible) */}
          <View style={styles.mapContent}>
            <Text style={styles.mapPlaceholder}>Mapa {id}</Text>
          </View>

          {/* Botones inferiores - DENTRO del mapa */}
          <View style={styles.bottomButtons}>
            {/* Botón de ayuda separado */}
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="help-circle-outline" size={32} color={Colors.text} />
            </TouchableOpacity>
            
            {/* Contenedor blanco con los 3 iconos - funciona como UN SOLO botón */}
            <TouchableOpacity style={styles.multiIconButton}>
              <Ionicons name="add-circle-outline" size={28} color={Colors.text} />
              
              <View style={styles.iconDivider} />
              
              <Ionicons name="ellipsis-horizontal" size={28} color={Colors.text} />
              
              <View style={styles.iconDivider} />
              
              <Ionicons name="checkmark" size={28} color={Colors.text} />
            </TouchableOpacity>
            
            {/* Sin botón adicional aquí */}
          </View>

        </ImageBackground>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapCanvas: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  mapImage: {
    borderRadius: 0,
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  nameInputText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiIconButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  iconDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
});