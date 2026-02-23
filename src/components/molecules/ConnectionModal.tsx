import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../atoms/Button';

interface ConnectionModalProps {
  visible: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onCancel: () => void;
}

export default function ConnectionModal({
  visible,
  errorMessage,
  onRetry,
  onCancel,
}: ConnectionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.box}>
            <Ionicons name="warning-outline" size={48} color="#FF9800" />
            <Text style={styles.title}>Error de conexión</Text>
            <Text style={styles.message}>
              {errorMessage || 'No se pudo conectar al robot'}{'\n\n'}
              Verifica que las Raspberry Pi estén encendidas.
            </Text>
            <View style={styles.buttons}>
              <Button label="Cancelar" onPress={onCancel} variant="secondary" />
              <Button label="Reintentar" onPress={onRetry} variant="primary" />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: 340, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginTop: 12, marginBottom: 8 },
  message: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  buttons: { flexDirection: 'row', gap: 10, width: '100%' },
});