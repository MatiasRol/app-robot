import { useRouter } from 'expo-router';
import React from 'react';
import { useMapDetailController } from '../../lib/modules/maps/hooks/useMapDetailController';
import { MapDetailScene } from '../../src/components/organisms/MapDetailScene';

export default function MapDetailScreen() {
  const router = useRouter();

  const { mapViewerProps, overlayProps } = useMapDetailController(() =>
    router.back()
  );

  return (
    <MapDetailScene
      mapViewerProps={mapViewerProps}
      overlayProps={overlayProps}
    />
  );
}