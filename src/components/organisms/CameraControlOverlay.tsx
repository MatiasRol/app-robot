import React from 'react';
import { StyleSheet, View } from 'react-native';
import JoystickControl from '../organisms/JoystickControl';

interface CameraControlOverlayProps {
  visible: boolean;
  onMove: (velocity: { linear: number; angular: number }) => void;
  onStop: () => void;
}

export default function CameraControlOverlay({
  visible,
  onMove,
  onStop,
}: CameraControlOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.joystickContainer}>
      <JoystickControl
        size={220}
        onMove={onMove}
        onStop={onStop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  joystickContainer: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    zIndex: 5,
  },
});