import { useState } from 'react';
import { hapticLight } from '../../../core/utils/haptics';
import { Route } from '../../../core/types';

interface UseMapRouteExecutionParams {
  routes: Route[];
  commandsConnected: boolean;
  sendRecordingCommand: (value: 'on' | 'off') => void;
  sendFollowWaypoints: (
    waypoints: Array<{
      worldX: number;
      worldY: number;
      quaternion: { x: number; y: number; z: number; w: number };
    }>
  ) => void;
  showStatus: (
    title: string,
    message: string,
    variant?: 'success' | 'warning' | 'error' | 'info'
  ) => void;
}

export function useMapRouteExecution({
  routes,
  commandsConnected,
  sendRecordingCommand,
  sendFollowWaypoints,
  showStatus,
}: UseMapRouteExecutionParams) {
  const [pendingPlayRouteId, setPendingPlayRouteId] = useState<string | null>(null);

  const handlePlayRoute = (routeId: string) => {
    void hapticLight();
    setPendingPlayRouteId(routeId);
  };

  const cancelPlayRoute = () => {
    void hapticLight();
    setPendingPlayRouteId(null);
  };

  const confirmPlayRoute = () => {
    if (!pendingPlayRouteId) return;

    const route = routes.find((r) => r.id === pendingPlayRouteId) as
      | (Route & {
          scheduleMeta?: {
            days?: string[];
            time?: string;
            recordRoute?: boolean;
            label?: string;
          } | null;
        })
      | undefined;

    if (!route?.waypoints?.length) {
      setPendingPlayRouteId(null);
      showStatus(
        'Ruta vacía',
        'La ruta no tiene waypoints para ejecutarse.',
        'warning'
      );
      return;
    }

    if (!commandsConnected) {
      setPendingPlayRouteId(null);
      showStatus(
        'Sin conexión',
        'No hay conexión de comandos con el robot.',
        'warning'
      );
      return;
    }

    const waypointsForRos = (route.waypoints as any[])
      .map((wp) => {
        if (wp?.position && wp?.orientation) {
          return {
            worldX: Number(wp.position.x ?? 0),
            worldY: Number(wp.position.y ?? 0),
            quaternion: {
              x: Number(wp.orientation.x ?? 0),
              y: Number(wp.orientation.y ?? 0),
              z: Number(wp.orientation.z ?? 0),
              w: Number(wp.orientation.w ?? 1),
            },
          };
        }

        if (
          typeof wp?.worldX === 'number' &&
          typeof wp?.worldY === 'number' &&
          wp?.quaternion
        ) {
          return {
            worldX: wp.worldX,
            worldY: wp.worldY,
            quaternion: {
              x: Number(wp.quaternion.x ?? 0),
              y: Number(wp.quaternion.y ?? 0),
              z: Number(wp.quaternion.z ?? 0),
              w: Number(wp.quaternion.w ?? 1),
            },
          };
        }

        return null;
      })
      .filter(Boolean) as Array<{
      worldX: number;
      worldY: number;
      quaternion: { x: number; y: number; z: number; w: number };
    }>;

    if (waypointsForRos.length === 0) {
      setPendingPlayRouteId(null);
      showStatus(
        'Ruta inválida',
        'No se pudieron preparar los waypoints de la ruta.',
        'error'
      );
      return;
    }

    // AQUÍ está la corrección real:
    const shouldRecord = Boolean(route.scheduleMeta?.recordRoute);

    // Manda exactamente la misma función de grabación
    // que usa la principal
    if (shouldRecord) {
      sendRecordingCommand('on');
    }

    sendFollowWaypoints(waypointsForRos);
    setPendingPlayRouteId(null);

    showStatus(
      'Ruta enviada',
      shouldRecord
        ? `La ruta "${route.name}" se envió para ejecutarse y se activó la grabación.`
        : `La ruta "${route.name}" se envió para ejecutarse.`,
      'success'
    );
  };

  return {
    pendingPlayRouteId,
    handlePlayRoute,
    cancelPlayRoute,
    confirmPlayRoute,
  };
}