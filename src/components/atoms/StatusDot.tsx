import React from 'react';
import { StyleSheet, View } from 'react-native';

type DotStatus = 'connected' | 'connecting' | 'disconnected' | 'failed';

interface StatusDotProps {
  status: DotStatus;
  size?: number;
}

const STATUS_COLORS: Record<DotStatus, string> = {
  connected: '#4CAF50',
  connecting: '#FF9800',
  disconnected: '#9E9E9E',
  failed: '#F44336',
};

export default function StatusDot({ status, size = 10 }: StatusDotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: STATUS_COLORS[status],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});