import { Alert } from 'react-native';
import { WaypointPoint } from '../../../core/types';
import { hapticWarning } from '../../../core/utils/haptics';

interface UseMapRouteSubmitParams {
  editingRouteId: string | null;
  routeNameDraft: string;
  selectedDays: string[];
  executeAt: string;
  recordRoute: boolean;
  waypoints: WaypointPoint[];
  createRoute: (params: {
    name: string;
    selectedDays: string[];
    executeAt: string;
    recordRoute: boolean;
    waypoints: WaypointPoint[];
  }) => Promise<{ name: string } | null>;
  updateRoute: (params: {
    routeId: string;
    name: string;
    selectedDays: string[];
    executeAt: string;
    recordRoute: boolean;
    waypoints: WaypointPoint[];
  }) => Promise<boolean>;
  closeCreateRoute: () => void;
  showStatus: (
    title: string,
    message: string,
    variant?: 'success' | 'warning' | 'error' | 'info'
  ) => void;
}

export function useMapRouteSubmit({
  editingRouteId,
  routeNameDraft,
  selectedDays,
  executeAt,
  recordRoute,
  waypoints,
  createRoute,
  updateRoute,
  closeCreateRoute,
  showStatus,
}: UseMapRouteSubmitParams) {
  const handleConfirmCreateRoute = async () => {
    if (!routeNameDraft.trim()) {
      void hapticWarning();
      Alert.alert('Ruta', 'Escribe un nombre para la ruta.');
      return;
    }

    if (waypoints.length === 0) {
      void hapticWarning();
      Alert.alert('Ruta', 'Agrega al menos un waypoint en el mapa.');
      return;
    }

    try {
      if (editingRouteId) {
        const updated = await updateRoute({
          routeId: editingRouteId,
          name: routeNameDraft,
          selectedDays,
          executeAt,
          recordRoute,
          waypoints,
        });

        if (!updated) {
          showStatus(
            'No se pudo guardar',
            'La ruta no se pudo actualizar correctamente.',
            'error'
          );
          return;
        }

        closeCreateRoute();

        showStatus(
          'Ruta actualizada',
          'La ruta se actualizó correctamente.',
          'success'
        );
        return;
      }

      const created = await createRoute({
        name: routeNameDraft,
        selectedDays,
        executeAt,
        recordRoute,
        waypoints,
      });

      if (!created) {
        showStatus(
          'No se pudo guardar',
          'La ruta no se pudo guardar correctamente.',
          'error'
        );
        return;
      }

      closeCreateRoute();

      showStatus(
        'Ruta guardada',
        `La ruta "${created.name}" se guardó correctamente.`,
        'success'
      );
    } catch (error) {
      console.error(error);
      showStatus(
        editingRouteId ? 'No se pudo actualizar' : 'No se pudo guardar',
        editingRouteId
          ? 'Ocurrió un error al actualizar la ruta.'
          : 'Ocurrió un error al guardar la ruta.',
        'error'
      );
    }
  };

  return {
    handleConfirmCreateRoute,
  };
}