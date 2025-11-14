import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import RobotCard from '../../src/components/RobotCard';
import { mockRobots } from '../../src/data/mockData'; // Cambiar mockRobot a mockRobots
import { Colors } from '../../src/constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <View style={styles.container}>
      <RobotCard robots={mockRobots} onProfilePress={handleProfilePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
