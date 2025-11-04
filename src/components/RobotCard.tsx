import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Robot } from '../types';
import StatusIndicator from './StatusIndicator';

interface RobotCardProps {
  robot: Robot;
}

export default function RobotCard({ robot }: RobotCardProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="hardware-chip" size={48} color={Colors.primary} />
        </View>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/robot-config')}
        >
          <Ionicons name="settings-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Robot Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.robotName}>{robot.name}</Text>
        <Text style={styles.robotModel}>{robot.model}</Text>
        <View style={styles.statusContainer}>
          <StatusIndicator status={robot.status} />
        </View>
      </View>

      {/* Battery */}
      <View style={styles.batteryContainer}>
        <Ionicons name="battery-charging" size={24} color={Colors.success} />
        <Text style={styles.batteryText}>{robot.battery}%</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/camera')}
        >
          <Ionicons name="camera-outline" size={24} color={Colors.text} />
          <Text style={styles.actionButtonText}>Ver cámara</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => router.push('/maps')}
        >
          <Ionicons name="map-outline" size={24} color={Colors.text} />
          <Text style={styles.actionButtonText}>Mapa interactivo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    margin: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    padding: Layout.spacing.sm,
  },
  infoContainer: {
    marginBottom: Layout.spacing.md,
  },
  robotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  robotModel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  statusContainer: {
    marginTop: Layout.spacing.sm,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Layout.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.md,
  },
  batteryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  actionButtons: {
    gap: Layout.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: Layout.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});