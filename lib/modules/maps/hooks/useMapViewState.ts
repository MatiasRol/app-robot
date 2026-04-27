import { MapMode, WaypointPoint } from '../../../core/types';

interface NavigateLike {
  navPoint: WaypointPoint | null;
}

interface WaypointEditorLike {
  waypoints: WaypointPoint[];
  hasActiveRotating: boolean;
}

interface UseMapViewStateParams {
  mapMode: MapMode;
  isNavigatingNow: boolean;
  navigate: NavigateLike;
  waypointEditor: WaypointEditorLike;
}

export function useMapViewState({
  mapMode,
  isNavigatingNow,
  navigate,
  waypointEditor,
}: UseMapViewStateParams) {
  const navigateHint = !navigate.navPoint
    ? 'Selecciona un punto de navegación'
    : !navigate.navPoint.confirmed
    ? 'Arrastra para orientar y toca para confirmar'
    : 'Listo para navegar';

  const isAdjustingWaypointDirection =
    !isNavigatingNow &&
    ((mapMode === 'navigate' &&
      !!navigate.navPoint &&
      !navigate.navPoint.confirmed) ||
      (mapMode === 'route_edit' && waypointEditor.hasActiveRotating));

  const visibleWaypoints =
    mapMode === 'navigate' && navigate.navPoint
      ? [navigate.navPoint]
      : mapMode === 'route_edit'
      ? waypointEditor.waypoints
      : [];

  return {
    navigateHint,
    isAdjustingWaypointDirection,
    visibleWaypoints,
  };
}