import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import RobotCard from '../../src/components/RobotCard';
import { Colors } from '../../src/constants/Colors';
import { useApp } from '../../src/context/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { robots } = useApp();

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <View style={styles.container}>
      <RobotCard robots={robots} onProfilePress={handleProfilePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});