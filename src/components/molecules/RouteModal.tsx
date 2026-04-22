import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import SunkenPressable from '../atoms/SunkenPressable';

interface RouteModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  initialName?: string;
  initialDate?: Date;
  onConfirm: (name: string, date: Date) => void;
  onCancel: () => void;
}

export function RouteModal({
  visible,
  mode,
  initialName = '',
  initialDate,
  onConfirm,
  onCancel,
}: RouteModalProps) {
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(initialDate ?? new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setDate(initialDate ?? new Date());
    }
  }, [visible, initialName, initialDate]);

  const handleDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) setDate(selected);
  };

  const handleTimeChange = (_: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {
      setDate((prev) => {
        const updated = new Date(prev);
        updated.setHours(selected.getHours());
        updated.setMinutes(selected.getMinutes());
        return updated;
      });
    }
  };

  const title = mode === 'add' ? 'Nueva Ruta' : 'Editar Ruta';
  const confirmLabel = mode === 'add' ? 'Crear' : 'Guardar';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre de la ruta"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Programar inicio:</Text>

            <SunkenPressable
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
              activeScale={0.985}
              activeTranslateY={2}
              activeOpacity={0.94}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.dateBtnText}>
                {date.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </SunkenPressable>

            <SunkenPressable
              style={styles.dateBtn}
              onPress={() => setShowTimePicker(true)}
              activeScale={0.985}
              activeTranslateY={2}
              activeOpacity={0.94}
            >
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.dateBtnText}>
                {date.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </SunkenPressable>
          </View>

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
              onPress={() => onConfirm(name, date)}
              activeScale={0.97}
              activeTranslateY={3}
              activeOpacity={0.92}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </SunkenPressable>
          </View>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '88%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.divider + '40',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.divider + '40',
  },
  dateBlock: { marginBottom: 20 },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.divider + '40',
  },
  dateBtnText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
});