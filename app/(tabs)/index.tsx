import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import RobotCard from '../../src/components/RobotCard';
import { Colors } from '../../src/constants/Colors';
import { Layout } from '../../src/constants/Layout';
import { mockRobot } from '../../src/data/mockData';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <RobotCard robot={mockRobot} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: Layout.spacing.md,
  },
});