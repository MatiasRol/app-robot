import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../src/constants/Colors';

export default function ConnectingScreen() {
  const router = useRouter();
  const { robotName = 'Robot 1' } = useLocalSearchParams();
  const [dots, setDots] = useState('');

  // Animación de puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Simular conexión y navegar a cámara
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/camera');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Tarjeta de conexión */}
      <View style={styles.card}>
        
        {/* ICONO DEL ROBOT PNG */}
        <View style={styles.robotIconContainer}>
          <Image
            source={require('../assets/images/robotNavSelecc.png')}
            style={styles.robotIcon}
            resizeMode="contain"
          />
        </View>

        {/* Texto de conexión */}
        <Text style={styles.connectingText}>Conectando a {dots}</Text>
        <Text style={styles.robotName}>{robotName}</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(58, 62, 71, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 48,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  robotIconContainer: {
    marginBottom: 32,
  },
  robotIcon: {
    width: 140,
    height: 140,
  },
  connectingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  robotName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
});