import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { Layout } from '../src/constants/Layout';

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
    }, 3000); // 3 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Tarjeta de conexión */}
      <View style={styles.card}>
        {/* Ícono del robot */}
        <View style={styles.robotIconContainer}>
          <View style={styles.robotIcon}>
            <View style={styles.robotHead}>
              <View style={styles.robotEye} />
              <View style={styles.robotEye} />
            </View>
            <View style={styles.robotAntenna} />
          </View>
        </View>

        {/* Texto */}
        <Text style={styles.connectingText}>Conectando a {dots}</Text>
        <Text style={styles.robotName}>{robotName}</Text>

        {/* Indicador de carga */}
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.xl * 2,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  robotIconContainer: {
    marginBottom: Layout.spacing.xl,
  },
  robotIcon: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  robotHead: {
    width: 120,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    paddingTop: 10,
  },
  robotEye: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  robotAntenna: {
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 20,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  connectingText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
    fontWeight: '500',
  },
  robotName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },
  loader: {
    marginTop: Layout.spacing.md,
  },
});