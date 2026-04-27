import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapActionButton from '../atoms/MapActionButton';

interface MapFloatingActionsProps {
  visible: boolean;
  onRoutesPress: () => void;
  onNavigatePress: () => void;
}

export function MapFloatingActions({
  visible,
  onRoutesPress,
  onNavigatePress,
}: MapFloatingActionsProps) {
  if (!visible) return null;

  return (
    <View style={styles.floatingButtons}>
      <MapActionButton
        label="RUTAS"
        icon={require('../../../assets/images/ruta.png')}
        onPress={onRoutesPress}
      />
      <MapActionButton
        label="NAVEGAR"
        icon={require('../../../assets/images/mapMark.png')}
        onPress={onNavigatePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButtons: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
  },
});