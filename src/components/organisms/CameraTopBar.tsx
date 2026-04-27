import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

type CameraMode = 'view' | 'control';

interface CameraTopBarProps {
  mode: CameraMode;
  onBack: () => void;
  onModeChange: (mode: CameraMode) => void;
}

export default function CameraTopBar({
  mode,
  onBack,
  onModeChange,
}: CameraTopBarProps) {
  return (
    <View style={styles.topBar}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Image
            source={require('../../../assets/images/regresoCamara.png')}
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'view' && styles.tabActive]}
            onPress={() => onModeChange('view')}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={mode === 'view' ? '#FFFFFF' : '#666'}
            />
            <Text style={[styles.tabText, mode === 'view' && styles.tabTextActive]}>
              Ver
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, mode === 'control' && styles.tabActive]}
            onPress={() => onModeChange('control')}
          >
            <Ionicons
              name="game-controller-outline"
              size={20}
              color={mode === 'control' ? '#FFFFFF' : '#666'}
            />
            <Text style={[styles.tabText, mode === 'control' && styles.tabTextActive]}>
              Control
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
});