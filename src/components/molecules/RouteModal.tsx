import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
  Platform,
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
  routeName: string;
  onChangeRouteName: (value: string) => void;
  selectedDays: string[];
  onToggleDay: (day: string) => void;
  executeAt: string;
  onChangeExecuteAt: (value: string) => void;
  recordRoute: boolean;
  onToggleRecordRoute: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

function buildPickerDateFromTime(value: string) {
  const now = new Date();

  if (!/^\d{2}:\d{2}$/.test(value)) {
    return now;
  }

  const [hours, minutes] = value.split(':').map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return now;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function RouteModal({
  visible,
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
  const [showTimePicker, setShowTimePicker] = useState(false);

  const pickerDate = useMemo(
    () => buildPickerDateFromTime(executeAt),
    [executeAt]
  );

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#202020" />
          </TouchableOpacity>

          <TextInput
            value={routeName}
            onChangeText={onChangeRouteName}
            placeholder="Nom. Ruta"
            placeholderTextColor="#202020"
            style={styles.titleInput}
          />

          <View style={styles.rightSpacer} />
        </View>

        <Text style={styles.sectionTitle}>Horario</Text>

        <View style={styles.daysContainer}>
          {DAYS.map((day) => {
            const selected = selectedDays.includes(day.key);

            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayChip, selected && styles.dayChipActive]}
                onPress={() => onToggleDay(day.key)}
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

          <TouchableOpacity
            style={styles.timeInput}
            activeOpacity={0.85}
            onPress={() => setShowTimePicker(true)}
          >
            <Text
              style={[
                styles.timeInputText,
                !executeAt && styles.timeInputPlaceholder,
              ]}
            >
              {executeAt || '00:00'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Grabar la ruta:</Text>

          <TouchableOpacity
            style={[
              styles.toggleTrack,
              recordRoute && styles.toggleTrackActive,
            ]}
            onPress={onToggleRecordRoute}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.toggleThumb,
                recordRoute ? styles.toggleThumbRight : styles.toggleThumbLeft,
              ]}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmButtonText}>CONFIRMAR</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={pickerDate}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
              if (Platform.OS !== 'ios') {
                setShowTimePicker(false);
              }

              if (selectedDate) {
                onChangeExecuteAt(formatTime(selectedDate));
              }
            }}
          />
        )}

        {showTimePicker && Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.iosDoneButton}
            onPress={() => setShowTimePicker(false)}
            activeOpacity={0.85}
          >
            <Text style={styles.iosDoneButtonText}>Listo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 30,
  },
  sheet: {
    backgroundColor: '#F4F4F4',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 36,
    minHeight: 320,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  timeInputText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#202020',
  },
  timeInputPlaceholder: {
    color: '#707070',
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
  iosDoneButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#D8D8D8',
  },
  iosDoneButtonText: {
    color: '#202020',
    fontSize: 14,
    fontWeight: '700',
  },
});