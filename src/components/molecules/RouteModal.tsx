import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
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
  onPressTime: () => void;
  recordRoute: boolean;
  onToggleRecordRoute: () => void;
  onClose: () => void;
}

export function RouteModal({
  visible,
  routeName,
  onChangeRouteName,
  selectedDays,
  onToggleDay,
  executeAt,
  onPressTime,
  recordRoute,
  onToggleRecordRoute,
  onClose,
}: RouteModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
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
                  <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Ejecutar a las:</Text>

            <TouchableOpacity
              style={styles.timePill}
              onPress={onPressTime}
              activeOpacity={0.85}
            >
              <Text style={styles.timeText}>{executeAt}</Text>
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  sheet: {
    backgroundColor: '#F4F4F4',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 36,
    minHeight: 285,
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
  timePill: {
    minWidth: 94,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D8D8D8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#202020',
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
});