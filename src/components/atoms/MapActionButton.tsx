import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

interface MapActionButtonProps {
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;
}

export default function MapActionButton({ label, icon, onPress }: MapActionButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
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