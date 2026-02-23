import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import Button from '../atoms/Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  icon = 'information-circle-outline',
  iconColor = Colors.primary,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.box}>
            <Ionicons name={icon} size={48} color={iconColor} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttons}>
              <Button label={cancelLabel} onPress={onCancel} variant="secondary" />
              <Button label={confirmLabel} onPress={onConfirm} variant="primary" />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: 320, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 10, width: '100%' },
});