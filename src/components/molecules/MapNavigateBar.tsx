import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

interface MapNavigateBarProps {
  visible: boolean;
  isNavigatingNow: boolean;
  navigatingDots: string;
  hasConfirmedPoint: boolean;
  navigateHint: string;
  onCancelIdle: () => void;
  onCancelRunning: () => void;
  onNavigate: () => void;
}

export function MapNavigateBar({
  visible,
  isNavigatingNow,
  navigatingDots,
  hasConfirmedPoint,
  navigateHint,
  onCancelIdle,
  onCancelRunning,
  onNavigate,
}: MapNavigateBarProps) {
  if (!visible) return null;

  return (
    <View style={styles.navigateBar}>
      {isNavigatingNow ? (
        <>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancelRunning}
          >
            <Text style={styles.cancelText}>CANCELAR</Text>
          </TouchableOpacity>

          <Text style={styles.navigatingTitle}>
            {`Navegando${navigatingDots}`}
          </Text>

          <Text style={styles.navigateHint}>
            El robot está ejecutando la navegación.
          </Text>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancelIdle}
          >
            <Text style={styles.cancelText}>CANCELAR</Text>
          </TouchableOpacity>

          {hasConfirmedPoint && (
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={onNavigate}
            >
              <Text style={styles.navigateText}>NAVEGAR</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.navigateHint}>{navigateHint}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navigateBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cancelText: {
    color: Colors.text,
    fontWeight: '700',
  },
  navigateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  navigateText: {
    color: '#FFF',
    fontWeight: '700',
  },
  navigatingTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  navigateHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});