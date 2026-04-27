import React from 'react';

export type MapPointConfirmVariant = 'navigate' | 'route';

type PendingMapPoint = {
  worldX: number;
  worldY: number;
  pixelX: number;
  pixelY: number;
};

interface UseMapPointConfirmationParams {
  onConfirmNavigatePoint: (point: PendingMapPoint) => void;
  onConfirmRouteWaypoint: (point: PendingMapPoint) => void;
}

export function useMapPointConfirmation({
  onConfirmNavigatePoint,
  onConfirmRouteWaypoint,
}: UseMapPointConfirmationParams) {
  const [visible, setVisible] = React.useState(false);
  const [variant, setVariant] = React.useState<MapPointConfirmVariant>('navigate');
  const [pendingPoint, setPendingPoint] = React.useState<PendingMapPoint | null>(null);

  const requestNavigatePointConfirmation = (point: PendingMapPoint) => {
    setPendingPoint(point);
    setVariant('navigate');
    setVisible(true);
  };

  const requestRouteWaypointConfirmation = (point: PendingMapPoint) => {
    setPendingPoint(point);
    setVariant('route');
    setVisible(true);
  };

  const cancelPointConfirmation = () => {
    setVisible(false);
    setPendingPoint(null);
  };

  const confirmPointConfirmation = () => {
    if (!pendingPoint) {
      setVisible(false);
      return;
    }

    if (variant === 'navigate') {
      onConfirmNavigatePoint(pendingPoint);
    } else {
      onConfirmRouteWaypoint(pendingPoint);
    }

    setVisible(false);
    setPendingPoint(null);
  };

  return {
    pointConfirmModalVisible: visible,
    pointConfirmVariant: variant,
    pendingPoint,
    requestNavigatePointConfirmation,
    requestRouteWaypointConfirmation,
    cancelPointConfirmation,
    confirmPointConfirmation,
  };
}