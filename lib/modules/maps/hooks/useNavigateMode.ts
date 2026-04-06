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
      confirmed: false, // girando
    });
  };

  const handleSecondTap = (
    tapPixelX: number,
    tapPixelY: number
  ) => {
    if (!navPoint) return;

    // Calcular ángulo entre el punto seleccionado y el segundo toque
    const angle = Math.atan2(
      tapPixelY - navPoint.pixelY,
      tapPixelX - navPoint.pixelX
    );

    setNavPoint((prev) =>
      prev
        ? {
            ...prev,
            orientationAngle: angle,
            quaternion: angleToQuaternion(angle),
            confirmed: true, // fijo
          }
        : null
    );
  };

  const reset = () => setNavPoint(null);

  return { navPoint, handleFirstTap, handleSecondTap, reset };
}