import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../src/constants/Colors';
import { Layout } from '../src/constants/Layout';

export default function ConnectingScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'connecting' | 'success' | 'error'>('connecting');

  useEffect(() => {
    // Simular conexión
    const timer = setTimeout(() => {
      setStatus('success');
      // Auto-cerrar después de 1 segundo si fue exitoso
      setTimeout(() => {
        router.back();
      }, 1500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (status) {
      case 'connecting':
        return <ActivityIndicator size="large" color={Colors.primary} />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={80} color={Colors.success} />;
      case 'error':
        return <Ionicons name="alert-circle" size={80} color={Colors.error} />;
    }
  };

  const getMessage = () => {
    switch (status) {
      case 'connecting':
        return 'Conectando a Robot 1...';
      case 'success':
        return '¡Conexión exitosa!';
      case 'error':
        return 'Error al conectar';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={28} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.robotIcon}>
          <Ionicons name="hardware-chip" size={64} color={Colors.primary} />
        </View>

        <Text style={styles.robotName}>Robot 1</Text>

        <View style={styles.statusContainer}>
          {getIcon()}
        </View>

        <Text style={styles.statusText}>{getMessage()}</Text>

        {status === 'connecting' && (
          <Text style={styles.subText}>
            Por favor espera mientras establecemos la conexión...
          </Text>
        )}

        {status === 'error' && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setStatus('connecting')}
          >
            <Ionicons name="refresh" size={24} color={Colors.text} />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: Layout.spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  robotIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  robotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xl,
  },
  statusContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  subText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.xl,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});