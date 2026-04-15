import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Route } from '../../../lib/core/types';

interface RouteListItemProps {
  route: Route;
  onNamePress: () => void;
  onPlayPress: () => void;
}

export function RouteListItem({
  route,
  onNamePress,
  onPlayPress,
}: RouteListItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.nameArea}
        onPress={onNamePress}
        activeOpacity={0.85}
      >
        <View style={styles.leftIconWrap}>
          <Image
            source={require('../../../assets/images/ruta.png')}
            style={styles.routeIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textArea}>
          <Text style={styles.name}>{route.name}</Text>
          <Text style={styles.schedule}>
            {route.schedule || 'Sin horario configurado'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.playButton}
        onPress={onPlayPress}
        activeOpacity={0.85}
      >
        <Ionicons name="play" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D111C',
    borderRadius: 28,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 10,
  },
  nameArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  routeIcon: {
    width: 28,
    height: 28,
  },
  textArea: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  schedule: {
    fontSize: 11,
    color: '#8C8C8C',
    fontWeight: '500',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#19335D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});