import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { Route } from '../../../lib/core/types';

interface RouteListItemProps {
  route: Route;
  onNamePress: () => void;
  onPlayPress: () => void;
}

export function RouteListItem({ route, onNamePress, onPlayPress }: RouteListItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.nameArea} onPress={onNamePress}>
        <View>
          <Text style={styles.name}>{route.name}</Text>
          {route.schedule && (
            <Text style={styles.schedule}>{route.schedule}</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
        <Ionicons name="play" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  nameArea: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  schedule: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});