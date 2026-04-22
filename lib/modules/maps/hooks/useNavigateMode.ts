import { useState } from 'react';
import { WaypointPoint } from '../../../core/types';

function angleToQuaternion(angle: number) {
  return {
    x: 0,
    y: 0,
    z: Math.sin(angle / 2),
    w: Math.cos(angle / 2),
  };
}

export function useNavigateMode() {
  const [navPoint, setNavPoint] = useState<WaypointPoint | null>(null);

  const handleFirstTap = (
    pixelX: number,
    pixelY: number,
    worldX: number,
    worldY: number
  ) => {
    setNavPoint({
      pixelX,
      pixelY,
      worldX,
      worldY,
      orientationAngle: 0,
      quaternion: angleToQuaternion(0),
      confirmed: false,
    });
  };

  const updateOrientation = (
    dragPixelX: number,
    dragPixelY: number
  ) => {
    setNavPoint((prev) => {
      if (!prev) return null;

      const angle = Math.atan2(
        dragPixelY - prev.pixelY,
        dragPixelX - prev.pixelX
      );

      return {
        ...prev,
        orientationAngle: angle,
        quaternion: angleToQuaternion(angle),
        confirmed: false,
      };
    });
  };

  const confirmOrientation = () => {
    setNavPoint((prev) =>
      prev
        ? {
            ...prev,
            confirmed: true,
          }
        : null
    );
  };

  const reset = () => setNavPoint(null);

  return {
    navPoint,
    handleFirstTap,
    updateOrientation,
    confirmOrientation,
    reset,
  };
}