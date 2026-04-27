import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { MapPointConfirmModal } from '../molecules/MapPointConfirmModal';
import { MapDetailOverlay } from './MapDetailOverlay';
import MapViewer from './MapViewer';

interface MapDetailSceneProps {
  mapViewerProps: any;
  overlayProps: any;
  pointConfirmProps: {
    visible: boolean;
    variant: 'navigate' | 'route';
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export function MapDetailScene({
  mapViewerProps,
  overlayProps,
  pointConfirmProps,
}: MapDetailSceneProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mapCanvas}>
        <MapViewer {...mapViewerProps} />
      </View>

      <MapDetailOverlay {...overlayProps} />

      <MapPointConfirmModal {...pointConfirmProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapCanvas: {
    flex: 1,
  },
});