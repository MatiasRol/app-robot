import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { useApp } from '../../lib/modules/app/context/AppContext';
import RobotCard from '../../src/components/organisms/RobotCard';

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