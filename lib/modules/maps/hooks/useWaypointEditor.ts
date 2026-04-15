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

  const addWaypointFirstTap = (
    pixelX: number,
    pixelY: number,
    worldX: number,
    worldY: number
  ) => {
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

  const updateActiveWaypointOrientation = (
    dragPixelX: number,
    dragPixelY: number
  ) => {
    if (activeIndex === null) return;

    setWaypoints((prev) => {
      const active = prev[activeIndex];
      if (!active) return prev;

      const angle = Math.atan2(
        dragPixelY - active.pixelY,
        dragPixelX - active.pixelX
      );

      const updated = [...prev];
      updated[activeIndex] = {
        ...active,
        orientationAngle: angle,
        quaternion: angleToQuaternion(angle),
        confirmed: false,
      };

      return updated;
    });
  };

  const confirmWaypointOrientation = () => {
    if (activeIndex === null) return;

    setWaypoints((prev) => {
      const active = prev[activeIndex];
      if (!active) return prev;

      const updated = [...prev];
      updated[activeIndex] = {
        ...active,
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

  const loadWaypoints = (items: WaypointPoint[]) => {
    setWaypoints(items);
    setActiveIndex(null);
  };

  const hasActiveRotating = activeIndex !== null;

  return {
    waypoints,
    activeIndex,
    hasActiveRotating,
    addWaypointFirstTap,
    updateActiveWaypointOrientation,
    confirmWaypointOrientation,
    removeWaypoint,
    clearWaypoints,
    loadWaypoints,
  };
}