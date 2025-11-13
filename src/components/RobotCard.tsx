import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { Robot } from '../types';

interface RobotCardProps {
  robot: Robot;
}

export default function RobotCard({ robot }: RobotCardProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
        </View>
      </View>

      {/* Robot Display */}
      <View style={styles.robotDisplay}>
        {/* Robot Icon - estilo Figma */}
        <View style={styles.robotIcon}>
          <View style={styles.robotHead}>
            <View style={styles.robotEye} />
            <View style={styles.robotEye} />
          </View>
          <View style={styles.robotBody}>
            <View style={styles.robotDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>
        
        {/* Robot Info */}
        <Text style={styles.robotName}>{robot.name}</Text>
        <Text style={styles.robotModel}>{robot.model}</Text>
      </View>

      {/* Status and Battery */}
      <View style={styles.statusRow}>
        <View style={styles.batteryContainer}>
          <Text style={styles.batteryLabel}>60%</Text>
          <View style={styles.batteryBar}>
            <View style={[styles.batteryFill, { width: '60%' }]} />
          </View>
        </View>
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
        </View>
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
          style={styles.mapButton}
          onPress={() => router.push('/maps')}
        >
          <Ionicons name="map-outline" size={24} color={Colors.text} />
          <Text style={styles.actionButtonText}>Mapa interactivo</Text>
          <Text style={styles.mapSubtext}>Mapa 1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    margin: Layout.spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Layout.spacing.md,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotDisplay: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  robotIcon: {
    width: 120,
    height: 120,
    marginBottom: Layout.spacing.md,
  },
  robotHead: {
    width: 120,
    height: 60,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingTop: 15,
  },
  robotEye: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.text,
  },
  robotBody: {
    width: 120,
    height: 60,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  robotDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text,
  },
  robotName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  robotModel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  batteryContainer: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  batteryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  batteryBar: {
    height: 12,
    backgroundColor: Colors.card,
    borderRadius: 6,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 6,
  },
  checkmark: {
    marginLeft: Layout.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    padding: Layout.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: Layout.spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    minHeight: 80,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: Layout.spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.md,
    minHeight: 80,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  mapSubtext: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.8,
  },
});