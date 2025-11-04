import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import ColorPalette from '../src/components/ColorPalette';
import { Colors } from '../src/constants/Colors';
import { Layout } from '../src/constants/Layout';

export default function RobotConfigScreen() {
  const router = useRouter();
  const [autoConnect, setAutoConnect] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Robot Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Robot</Text>
        <View style={styles.card}>
          <View style={styles.robotHeader}>
            <View style={styles.robotAvatar}>
              <Ionicons name="hardware-chip" size={40} color={Colors.primary} />
            </View>
            <View style={styles.robotInfo}>
              <Text style={styles.robotName}>Robot 1</Text>
              <Text style={styles.robotModel}>Modelo XR-2000</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID del dispositivo</Text>
            <Text style={styles.infoValue}>ROBOT-001</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versión de firmware</Text>
            <Text style={styles.infoValue}>v2.4.1</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última conexión</Text>
            <Text style={styles.infoValue}>Hace 5 minutos</Text>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Conexión automática</Text>
              <Text style={styles.settingDescription}>
                Conectar al robot al abrir la app
              </Text>
            </View>
            <Switch
              value={autoConnect}
              onValueChange={setAutoConnect}
              trackColor={{ false: Colors.surface, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notificaciones</Text>
              <Text style={styles.settingDescription}>
                Recibir alertas del robot
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.surface, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Modo oscuro</Text>
              <Text style={styles.settingDescription}>
                Tema de la aplicación
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.surface, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>
      </View>

      {/* Color Palette */}
      <ColorPalette />

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="refresh-outline" size={24} color={Colors.text} />
          <Text style={styles.actionButtonText}>Reiniciar Robot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
          <Ionicons name="trash-outline" size={24} color={Colors.error} />
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
            Desvincular Robot
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
  },
  robotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  robotAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotInfo: {
    flex: 1,
  },
  robotName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  robotModel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surface,
    marginVertical: Layout.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  dangerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  dangerButtonText: {
    color: Colors.error,
  },
});