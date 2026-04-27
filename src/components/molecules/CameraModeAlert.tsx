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

type CameraMode = 'view' | 'control';

interface CameraModeAlertProps {
  visible: boolean;
  pendingMode: CameraMode | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CameraModeAlert({
  visible,
  pendingMode,
  onCancel,
  onConfirm,
}: CameraModeAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.alertOverlay}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.alertBox}>
            <Ionicons
              name="information-circle-outline"
              size={48}
              color={Colors.primary}
            />
            <Text style={styles.alertTitle}>Cambiar modo</Text>
            <Text style={styles.alertMessage}>
              ¿Deseas cambiar al modo{' '}
              {pendingMode === 'control' ? 'Control' : 'Visualización'}?
            </Text>

            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertButtonCancel}
                onPress={onCancel}
              >
                <Text style={styles.alertButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alertButtonConfirm}
                onPress={onConfirm}
              >
                <Text style={styles.alertButtonConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '75%',
    maxWidth: 350,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  alertButtonCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  alertButtonCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  alertButtonConfirm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  alertButtonConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});