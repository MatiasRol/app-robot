import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface RouteExecutionConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RouteExecutionConfirmModal({
  visible,
  onConfirm,
  onCancel,
}: RouteExecutionConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmBox}>
          <Text style={styles.confirmTitle}>¿DESEA EJECUTAR{'\n'}LA RUTA?</Text>

          <TouchableOpacity
            style={styles.confirmPrimaryBtn}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmPrimaryText}>CONFIRMAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmSecondaryBtn}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmSecondaryText}>CANCELAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    width: 185,
    backgroundColor: '#F3F3F3',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#202020',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  confirmPrimaryBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#124BAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  confirmPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmSecondaryBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A9A9A9',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmSecondaryText: {
    color: '#9C9C9C',
    fontSize: 16,
    fontWeight: '500',
  },
});