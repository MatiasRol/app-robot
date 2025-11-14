import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Robot } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

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
        snapToInterval={CARD_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {robots.map((robot, index) => (
          <View key={robot.id} style={styles.cardContainer}>
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

              {/* Nombre del Robot */}
              <Text style={styles.robotName}>{robot.name}</Text>
              <Text style={styles.robotModel}>{robot.model}</Text>

              {/* Robot Imagen y Estado */}
              <View style={styles.robotContainer}>
                <View style={styles.robotImageContainer}>
                  <Image
                    source={require('../../assets/images/robot.png')}
                    style={styles.robotImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Barra de batería lateral */}
                <View style={styles.batteryColumn}>
                  <Text style={styles.batteryPercentage}>{robot.battery}%</Text>
                  <View style={styles.batteryVertical}>
                    <View style={[styles.batteryFill, { height: `${robot.battery}%` }]} />
                  </View>
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={40} color={Colors.success} />
                  </View>
                </View>
              </View>

              {/* Botones de acción */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => router.push('/camera')}
                >
                  <Ionicons name="camera-outline" size={48} color="#000" />
                  <Text style={styles.buttonText}>Ver cámara</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => router.push('/maps')}
                >
                  <Image
                    source={require('../../assets/images/map-icon.png')}
                    style={styles.mapIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.mapButtonText}>Mapa relacionado</Text>
                  <Text style={styles.mapButtonSubtext}>Mapa 1</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Indicadores de página (dots) */}
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
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 30,
    padding: 20,
    marginVertical: 10,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  profileButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  robotName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  robotModel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  robotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 280,
  },
  robotImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotImage: {
    width: 220,
    height: 280,
  },
  batteryColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 20,
    height: 280,
    paddingVertical: 10,
  },
  batteryPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  batteryVertical: {
    width: 30,
    flex: 1,
    backgroundColor: '#D0D0D0',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
  batteryFill: {
    width: '100%',
    backgroundColor: Colors.success,
    borderRadius: 15,
  },
  checkmarkContainer: {
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  mapButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  mapIcon: {
    width: 48,
    height: 48,
    tintColor: '#FFFFFF',
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  mapButtonSubtext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 0.5,
  },
});