import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { OperationMode } from 'lib/modules/maps/hooks/useOperationMode';
import SunkenPressable from '../atoms/SunkenPressable';

interface ModeChangeAlertProps {
  visible: boolean;
  pendingMode: OperationMode | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ModeChangeAlert({
  visible,
  pendingMode,
  onConfirm,
  onCancel,
}: ModeChangeAlertProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>Cambiar modo de operación</Text>
        <Text style={styles.message}>
          ¿Estás seguro de que deseas cambiar al modo{' '}
          <Text style={styles.highlight}>
            {pendingMode === 'servicio' ? 'Servicio' : 'Vigilancia'}
          </Text>
          ?
        </Text>

        <View style={styles.buttons}>
          <SunkenPressable
            style={styles.cancelBtn}
            onPress={onCancel}
            activeScale={0.97}
            activeTranslateY={3}
            activeOpacity={0.92}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </SunkenPressable>

          <SunkenPressable
            style={styles.confirmBtn}
            onPress={onConfirm}
            activeScale={0.97}
            activeTranslateY={3}
            activeOpacity={0.92}
          >
            <Text style={styles.confirmText}>Confirmar</Text>
          </SunkenPressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  box: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    width: '80%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.divider + '40',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  highlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: Colors.button,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
});