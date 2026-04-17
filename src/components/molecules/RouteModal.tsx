import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DAYS = [
  { key: 'mon', label: 'L' },
  { key: 'tue', label: 'M' },
  { key: 'wed', label: 'M' },
  { key: 'thu', label: 'J' },
  { key: 'fri', label: 'V' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'D' },
];

interface RouteModalProps {
  visible: boolean;

  // flujo nuevo
  mode?: 'add' | 'edit';
  initialName?: string;
  initialDate?: Date;
  onCancel?: () => void;

  // flujo viejo/controlado
  routeName?: string;
  onChangeRouteName?: (value: string) => void;
  selectedDays?: string[];
  onToggleDay?: (day: string) => void;
  executeAt?: string;
  onChangeExecuteAt?: (value: string) => void;
  recordRoute?: boolean;
  onToggleRecordRoute?: () => void;
  onClose?: () => void;

  // compatible con ambos
  onConfirm: ((name: string, date: Date) => void) | (() => void);
}

export function RouteModal({
  visible,
  mode,
  initialName = '',
  initialDate,
  onCancel,

  routeName,
  onChangeRouteName,
  selectedDays,
  onToggleDay,
  executeAt,
  onChangeExecuteAt,
  recordRoute,
  onToggleRecordRoute,
  onClose,

  onConfirm,
}: RouteModalProps) {
  const isLegacyControlled =
    routeName !== undefined ||
    onChangeRouteName !== undefined ||
    selectedDays !== undefined ||
    onToggleDay !== undefined ||
    executeAt !== undefined ||
    onChangeExecuteAt !== undefined ||
    recordRoute !== undefined ||
    onToggleRecordRoute !== undefined ||
    onClose !== undefined;

  const [localRouteName, setLocalRouteName] = useState(initialName);
  const [localSelectedDays, setLocalSelectedDays] = useState<string[]>([]);
  const [localExecuteAt, setLocalExecuteAt] = useState('');
  const [localRecordRoute, setLocalRecordRoute] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setLocalRouteName(routeName ?? initialName ?? '');

    if (initialDate) {
      const hours = String(initialDate.getHours()).padStart(2, '0');
      const minutes = String(initialDate.getMinutes()).padStart(2, '0');
      setLocalExecuteAt(`${hours}:${minutes}`);
    } else {
      setLocalExecuteAt(executeAt ?? '');
    }

    setLocalSelectedDays(selectedDays ?? []);
    setLocalRecordRoute(recordRoute ?? false);
  }, [
    visible,
    routeName,
    initialName,
    initialDate,
    executeAt,
    selectedDays,
    recordRoute,
  ]);

  const safeSelectedDays = selectedDays ?? localSelectedDays ?? [];
  const safeRouteName = routeName ?? localRouteName ?? '';
  const safeExecuteAt = executeAt ?? localExecuteAt ?? '';
  const safeRecordRoute = recordRoute ?? localRecordRoute ?? false;

  const handleChangeRouteName = (value: string) => {
    if (onChangeRouteName) {
      onChangeRouteName(value);
      return;
    }
    setLocalRouteName(value);
  };

  const handleToggleDay = (day: string) => {
    if (onToggleDay) {
      onToggleDay(day);
      return;
    }

    setLocalSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day]
    );
  };

  const handleChangeExecuteAt = (value: string) => {
    if (onChangeExecuteAt) {
      onChangeExecuteAt(value);
      return;
    }
    setLocalExecuteAt(value);
  };

  const handleToggleRecordRoute = () => {
    if (onToggleRecordRoute) {
      onToggleRecordRoute();
      return;
    }
    setLocalRecordRoute((prev) => !prev);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (isLegacyControlled) {
      (onConfirm as () => void)();
      return;
    }

    const finalDate = initialDate ? new Date(initialDate) : new Date();

    const match = safeExecuteAt.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = Number(match[1]);
      const minutes = Number(match[2]);

      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        finalDate.setHours(hours);
        finalDate.setMinutes(minutes);
        finalDate.setSeconds(0);
        finalDate.setMilliseconds(0);
      }
    }

    (onConfirm as (name: string, date: Date) => void)(
      safeRouteName,
      finalDate
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#202020" />
        </TouchableOpacity>

        <TextInput
          value={safeRouteName}
          onChangeText={handleChangeRouteName}
          placeholder="Nom. Ruta"
          placeholderTextColor="#202020"
          style={styles.titleInput}
        />

        <View style={styles.rightSpacer} />
      </View>

      <Text style={styles.sectionTitle}>Horario</Text>

      <View style={styles.daysContainer}>
        {DAYS.map((day) => {
          const selected = safeSelectedDays.includes(day.key);

          return (
            <TouchableOpacity
              key={day.key}
              style={[styles.dayChip, selected && styles.dayChipActive]}
              onPress={() => handleToggleDay(day.key)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.dayChipText,
                  selected && styles.dayChipTextActive,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Ejecutar a las:</Text>

        <TextInput
          value={safeExecuteAt}
          onChangeText={handleChangeExecuteAt}
          placeholder="00:00"
          placeholderTextColor="#707070"
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          style={styles.timeInput}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Grabar la ruta:</Text>

        <TouchableOpacity
          style={[
            styles.toggleTrack,
            safeRecordRoute && styles.toggleTrackActive,
          ]}
          onPress={handleToggleRecordRoute}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.toggleThumb,
              safeRecordRoute
                ? styles.toggleThumbRight
                : styles.toggleThumbLeft,
            ]}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirm}
        activeOpacity={0.85}
      >
        <Text style={styles.confirmButtonText}>
          {mode === 'edit' ? 'GUARDAR' : 'CONFIRMAR'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F4F4F4',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 36,
    minHeight: 320,
    zIndex: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#202020',
    paddingVertical: 0,
  },
  rightSpacer: {
    width: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#202020',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A9A9A9',
    borderRadius: 22,
    paddingVertical: 5,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: '#124BAF',
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#124BAF',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#303030',
  },
  timeInput: {
    minWidth: 94,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D8D8D8',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#202020',
    paddingHorizontal: 14,
  },
  toggleTrack: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D8D8D8',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleTrackActive: {
    backgroundColor: '#3074E9',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDEDED',
  },
  toggleThumbLeft: {
    alignSelf: 'flex-start',
  },
  toggleThumbRight: {
    alignSelf: 'flex-end',
  },
  confirmButton: {
    marginTop: 10,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#124BAF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});