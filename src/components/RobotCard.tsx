import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Robot } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface RobotCardProps {
  robots: Robot[];
  onProfilePress: () => void;
}

export default function RobotCard({ robots, onProfilePress }: RobotCardProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 20}
        contentContainerStyle={styles.scrollContent}
      >
        {robots.map((robot) => (
          <View key={robot.id} style={styles.cardContainer}>
            
            {/* TARJETA BLANCA - SOLO ROBOT */}
            <View style={styles.card}>
              
              {/* Header con foto de perfil */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
                  <Image
                    source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
              </View>

              {/* Nombre del robot con botón editar */}
              <View style={styles.nameContainer}>
                <Text style={styles.robotName}>{robot.name}</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Image
                    source={require('../../assets/images/lapiz.png')}
                    style={styles.editIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.robotModel}>{robot.model}</Text>

              {/* Robot + batería */}
              <View style={styles.robotContainer}>
                <View style={styles.robotImageContainer}>
                  <Image
                    source={require('../../assets/images/robot-prueba.png')}
                    style={styles.robotImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.batteryColumn}>
                  <Text style={styles.batteryPercentage}>{robot.battery}%</Text>
                  <View style={styles.batteryVertical}>
                    <View style={[styles.batteryFill, { height: `${robot.battery}%` }]} />
                  </View>
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
                  </View>
                </View>
              </View>
            </View>

            {/* BOTONES FUERA DE LA TARJETA BLANCA */}
            <View style={styles.actionButtons}>

              {/* Botón Ver Cámara */}
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={() =>
                  router.push({
                    pathname: '/connecting',
                    params: { robotName: robot.name }
                  })
                }
              >
                <Image
                  source={require('../../assets/images/camara.png')}
                  style={styles.cameraIcon}
                  resizeMode="contain"
                />
                <Text style={styles.cameraButtonText}>Ver cámara</Text>
              </TouchableOpacity>

              {/* Botón Mapa - NAVEGA AL MAPA ESPECÍFICO */}
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => router.push('/map-detail/1')}
              >
                <Image
                  source={require('../../assets/images/mapaBoton.png')}
                  style={styles.mapIcon}
                  resizeMode="contain"
                />
                <Text style={styles.mapButtonText}>Mapa relacionado</Text>
                <Text style={styles.mapButtonSubtext}>Mapa 1</Text>
              </TouchableOpacity>

            </View>

          </View>
        ))}
      </ScrollView>

      {/* Indicadores de paginación */}
      {robots.length > 1 && (
        <View style={styles.pagination}>
          {robots.map((_, index) => (
            <View key={index} style={styles.paginationDot} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  profileButton: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  robotName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  editButton: {
    padding: 4,
  },
  editIcon: {
    width: 28,
    height: 28,
  },
  robotModel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  robotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  robotImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotImage: {
    width: 240,
    height: 300,
  },
  batteryColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 16,
    height: 300,
    paddingVertical: 12,
  },
  batteryPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  batteryVertical: {
    width: 35,
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginVertical: 12,
  },
  batteryFill: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 18,
  },
  checkmarkContainer: {
    marginTop: 8,
  },
  
  // BOTONES FUERA DE LA TARJETA
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },

  cameraButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },

  cameraIcon: {
    width: 56,
    height: 56,
  },

  cameraButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    textAlign: 'center',
  },

  mapButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },

  mapIcon: {
    width: 56,
    height: 56,
    tintColor: '#FFFFFF',
  },

  mapButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
  },
  mapButtonSubtext: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
});