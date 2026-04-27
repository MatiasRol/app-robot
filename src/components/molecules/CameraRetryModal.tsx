import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

interface CameraRetryModalProps {
  visible: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onRetry: () => void;
}

export default function CameraRetryModal({
  visible,
  errorMessage,
  onCancel,
  onRetry,
}: CameraRetryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.errorOverlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={48} color="#FF9800" />
            <Text style={styles.errorTitle}>No se pudo conectar</Text>
            <Text style={styles.errorMessage}>
              {errorMessage || 'No se pudo conectar a la cámara del robot.'}
            </Text>

            <View style={styles.errorButtons}>
              <TouchableOpacity
                style={styles.errorButtonCancel}
                onPress={onCancel}
              >
                <Text style={styles.errorButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.errorButtonRetry}
                onPress={onRetry}
              >
                <Text style={styles.errorButtonRetryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 380,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  errorButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  errorButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  errorButtonRetry: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  errorButtonRetryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});