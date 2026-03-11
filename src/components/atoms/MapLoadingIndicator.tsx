import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';

interface Props {
  message?: string;
}

export default function MapLoadingIndicator({ message = 'Cargando mapa...' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 16,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});