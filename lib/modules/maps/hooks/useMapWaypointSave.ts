import { Alert } from 'react-native';
import { MapMode, WaypointPoint } from '../../../core/types';
import { hapticWarning } from '../../../core/utils/haptics';

interface UseMapWaypointSaveParams {
  editingRouteId: string | null;
  waypoints: WaypointPoint[];
  clearWaypoints: () => void;
  setMapMode: (mode: MapMode) => void;
  saveWaypoints: (routeId: string, waypoints: WaypointPoint[]) => Promise<boolean>;
  showStatus: (
    title: string,
    message: string,
    variant?: 'success' | 'warning' | 'error' | 'info'
  ) => void;
}

export function useMapWaypointSave({
  editingRouteId,
  waypoints,
  clearWaypoints,
  setMapMode,
  saveWaypoints,
  showStatus,
}: UseMapWaypointSaveParams) {
  const handleAcceptWaypoints = async () => {
    if (!editingRouteId) {
      clearWaypoints();
      setMapMode('route_list');
      return;
    }

    if (waypoints.length === 0) {
      void hapticWarning();
      Alert.alert('Ruta', 'Agrega al menos un waypoint antes de guardar.');
      return;
    }

    const ok = await saveWaypoints(editingRouteId, waypoints);

    if (ok) {
      showStatus(
        'Ruta guardada',
        'Los waypoints de la ruta se guardaron correctamente.',
        'success'
      );
    } else {
      showStatus(
        'No se pudo guardar',
        'Ocurrió un error al guardar los waypoints.',
        'error'
      );
    }

    clearWaypoints();
    setMapMode('route_list');
  };

  return {
    handleAcceptWaypoints,
  };
}