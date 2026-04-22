import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
} from 'react-native';
import SunkenPressable from './SunkenPressable';

interface MapActionButtonProps {
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;
}

export default function MapActionButton({
  label,
  icon,
  onPress,
}: MapActionButtonProps) {
  return (
    <SunkenPressable
      style={styles.button}
      onPress={onPress}
      activeScale={0.96}
      activeTranslateY={3}
      activeOpacity={0.9}
    >
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.label}>{label}</Text>
    </SunkenPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  icon: {
    width: 28,
    height: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D111C',
    letterSpacing: 0.5,
  },
});