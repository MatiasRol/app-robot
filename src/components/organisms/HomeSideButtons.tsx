import React from 'react';
import { StyleSheet, View } from 'react-native';
import ControlIcon from '../../../assets/images/control.svg';
import GaleriaIcon from '../../../assets/images/galeria.svg';
import GrabarIcon from '../../../assets/images/grabar.svg';
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
          {isMediaMode ? (
            <ControlIcon width={22} height={22} />
          ) : (
            <GaleriaIcon width={22} height={22} />
          )}
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
          <GrabarIcon
            width={22}
            height={22}
            color={isRecordingActive ? '#D92D20' : '#3074E9'}
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