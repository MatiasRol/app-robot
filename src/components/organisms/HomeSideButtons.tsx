import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import SunkenPressable from '../atoms/SunkenPressable';

interface HomeSideButtonsProps {
  isMediaMode: boolean;
  isRecordingActive?: boolean;
  onToggleMode: () => void;
  onRecordingPress: () => void;
}

export default function HomeSideButtons({
  isMediaMode,
  isRecordingActive = false,
  onToggleMode,
  onRecordingPress,
}: HomeSideButtonsProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <SunkenPressable
          style={[
            styles.iconButton,
            isMediaMode && styles.iconButtonActive,
          ]}
          onPress={onToggleMode}
          activeScale={0.96}
          activeTranslateY={2}
          activeOpacity={0.92}
        >
          <Ionicons
            name="game-controller-outline"
            size={22}
            color={isMediaMode ? '#124BAF' : '#0E2A57'}
          />
        </SunkenPressable>

        <SunkenPressable
          style={[
            styles.iconButton,
            isRecordingActive && styles.iconButtonRecording,
          ]}
          onPress={onRecordingPress}
          activeScale={0.96}
          activeTranslateY={2}
          activeOpacity={0.92}
        >
          <Ionicons
            name="videocam-outline"
            size={22}
            color={isRecordingActive ? '#D92D20' : '#2E6BFF'}
          />
        </SunkenPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    top: '40%',
    zIndex: 20,
  },
  container: {
    width: 46,
    borderRadius: 23,
    backgroundColor: '#F4F4F4',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    gap: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconButtonActive: {
    backgroundColor: '#EAF2FF',
  },
  iconButtonRecording: {
    backgroundColor: '#FFE9E7',
  },
});