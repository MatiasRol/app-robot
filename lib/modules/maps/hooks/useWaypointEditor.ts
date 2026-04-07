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

export function useWaypointEditor() {
  const [waypoints, setWaypoints] = useState<WaypointPoint[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Primer toque — agrega un nuevo waypoint giratorio
  const addWaypointFirstTap = (
    pixelX: number,
    pixelY: number,
    worldX: number,
    worldY: number
  ) => {
    // Solo permitir nuevo waypoint si no hay uno girando
    if (activeIndex !== null) return;

    const newWaypoint: WaypointPoint = {
      pixelX,
      pixelY,
      worldX,
      worldY,
      orientationAngle: 0,
      quaternion: angleToQuaternion(0),
      confirmed: false,
    };

    setWaypoints((prev) => {
      setActiveIndex(prev.length);
      return [...prev, newWaypoint];
    });
  };

  // Segundo toque — fija la orientación del waypoint activo
  const confirmWaypointOrientation = (
    tapPixelX: number,
    tapPixelY: number
  ) => {
    if (activeIndex === null) return;

    setWaypoints((prev) => {
      const active = prev[activeIndex];
      if (!active) return prev;

      const angle = Math.atan2(
        tapPixelY - active.pixelY,
        tapPixelX - active.pixelX
      );

      const updated = [...prev];
      updated[activeIndex] = {
        ...active,
        orientationAngle: angle,
        quaternion: angleToQuaternion(angle),
        confirmed: true,
      };
      return updated;
    });

    setActiveIndex(null);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
    if (activeIndex === index) setActiveIndex(null);
  };

  const clearWaypoints = () => {
    setWaypoints([]);
    setActiveIndex(null);
  };

  const hasActiveRotating = activeIndex !== null;

  return {
    waypoints,
    activeIndex,
    hasActiveRotating,
    addWaypointFirstTap,
    confirmWaypointOrientation,
    removeWaypoint,
    clearWaypoints,
  };
}