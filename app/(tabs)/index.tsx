import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import RobotCard from '../../src/components/RobotCard';
import { Layout } from '../../src/constants/Layout';
import { mockRobot } from '../../src/data/mockData';

export default function HomeScreen() {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <RobotCard robot={mockRobot} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: Layout.spacing.md,
  },
});