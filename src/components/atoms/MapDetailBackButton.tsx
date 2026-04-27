import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

interface MapDetailBackButtonProps {
  onPress: () => void;
}

export function MapDetailBackButton({
  onPress,
}: MapDetailBackButtonProps) {
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Image
        source={require('../../../assets/images/regreso.png')}
        style={styles.backIcon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 10,
  },
  backIcon: {
    width: 40,
    height: 40,
  },
});