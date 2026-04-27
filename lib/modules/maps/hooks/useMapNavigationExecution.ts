import { useEffect, useState } from 'react';
import { MapMode } from '../../../core/types';
import { hapticLight } from '../../../core/utils/haptics';

interface NavigatePointLike {
  worldX: number;
  worldY: number;
  quaternion: { x: number; y: number; z: number; w: number };
}

interface UseMapNavigationExecutionParams {
  commandsConnected: boolean;
  navPoint: NavigatePointLike | null;
  resetNavigate: () => void;
  setMapMode: (mode: MapMode) => void;
  stopRobot: () => void;
  sendNavigateToPose: (
    x: number,
    y: number,
    quaternion: { x: number; y: number; z: number; w: number }
  ) => void;
  showStatus: (
    title: string,
    message: string,
    variant?: 'success' | 'warning' | 'error' | 'info'
  ) => void;
}

export function useMapNavigationExecution({
  commandsConnected,
  navPoint,
  resetNavigate,
  setMapMode,
  stopRobot,
  sendNavigateToPose,
  showStatus,
}: UseMapNavigationExecutionParams) {
  const [isNavigatingNow, setIsNavigatingNow] = useState(false);
  const [navigatingDots, setNavigatingDots] = useState('');

  useEffect(() => {
    if (!isNavigatingNow) {
      setNavigatingDots('');
      return;
    }

    const frames = ['', '.', '..', '...'];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % frames.length;
      setNavigatingDots(frames[index]);
    }, 450);

    return () => clearInterval(interval);
  }, [isNavigatingNow]);

  const handleNavigateNow = () => {
    if (!navPoint) return;

    if (!commandsConnected) {
      showStatus(
        'Sin conexión',
        'No hay conexión de comandos con el robot.',
        'warning'
      );
      return;
    }

    sendNavigateToPose(
      navPoint.worldX,
      navPoint.worldY,
      navPoint.quaternion
    );

    resetNavigate();
    setIsNavigatingNow(true);

    showStatus(
      'Navegación enviada',
      'El punto de navegación fue enviado al robot.',
      'success'
    );
  };

  const handleCancelNavigation = () => {
    void hapticLight();
    stopRobot();
    setIsNavigatingNow(false);
    resetNavigate();
    setMapMode('idle');

    showStatus(
      'Navegación cancelada',
      'Se envió la orden para detener el movimiento del robot.',
      'info'
    );
  };

  const resetNavigationExecution = () => {
    setIsNavigatingNow(false);
    setNavigatingDots('');
  };

  return {
    isNavigatingNow,
    navigatingDots,
    handleNavigateNow,
    handleCancelNavigation,
    resetNavigationExecution,
  };
}