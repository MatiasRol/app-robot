import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface CameraLoadingSplashProps {
  robotName?: string;
}

export default function CameraLoadingSplash({
  robotName = 'Robot 1',
}: CameraLoadingSplashProps) {
  return (
    <View style={styles.loadingContainer}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.loadingLogo}
        resizeMode="contain"
      />
      <Text style={styles.loadingSubtext}>Conectando a ...</Text>
      <Text style={styles.loadingRobotText}>{robotName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingLogo: {
    width: 90,
    height: 90,
    marginBottom: 18,
  },
  loadingSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3A3A3A',
    marginBottom: 4,
  },
  loadingRobotText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});