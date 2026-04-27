import { MapMode } from '../../../core/types';
import { hapticSelection } from '../../../core/utils/haptics';

interface NavigateLike {
  navPoint: {
    confirmed: boolean;
  } | null;
  handleFirstTap: (
    pixelX: number,
    pixelY: number,
    worldX: number,
    worldY: number
  ) => void;
  confirmOrientation: () => void;
  updateOrientation: (pixelX: number, pixelY: number) => void;
}

interface WaypointEditorLike {
  hasActiveRotating: boolean;
  addWaypointFirstTap: (
    pixelX: number,
    pixelY: number,
    worldX: number,
    worldY: number
  ) => void;
  confirmWaypointOrientation: () => void;
  updateActiveWaypointOrientation: (
    pixelX: number,
    pixelY: number
  ) => void;
}

interface UseMapInteractionParams {
  mapMode: MapMode;
  isNavigatingNow: boolean;
  navigate: NavigateLike;
  waypointEditor: WaypointEditorLike;
  requestNavigatePointConfirmation: (point: {
    worldX: number;
    worldY: number;
    pixelX: number;
    pixelY: number;
  }) => void;
  requestRouteWaypointConfirmation: (point: {
    worldX: number;
    worldY: number;
    pixelX: number;
    pixelY: number;
  }) => void;
}

export function useMapInteraction({
  mapMode,
  isNavigatingNow,
  navigate,
  waypointEditor,
  requestNavigatePointConfirmation,
  requestRouteWaypointConfirmation,
}: UseMapInteractionParams) {
  const handleMapTap = (
    worldX: number,
    worldY: number,
    pixelX: number,
    pixelY: number
  ) => {
    if (isNavigatingNow) return;

    if (mapMode === 'navigate') {
      if (!navigate.navPoint) {
        void hapticSelection();
        requestNavigatePointConfirmation({
          worldX,
          worldY,
          pixelX,
          pixelY,
        });
      } else if (!navigate.navPoint.confirmed) {
        void hapticSelection();
        navigate.confirmOrientation();
      }
      return;
    }

    if (mapMode === 'route_edit') {
      if (!waypointEditor.hasActiveRotating) {
        void hapticSelection();
        requestRouteWaypointConfirmation({
          worldX,
          worldY,
          pixelX,
          pixelY,
        });
      } else {
        void hapticSelection();
        waypointEditor.confirmWaypointOrientation();
      }
    }
  };

  const handleDirectionDrag = (
    _worldX: number,
    _worldY: number,
    pixelX: number,
    pixelY: number
  ) => {
    if (isNavigatingNow) return;

    if (mapMode === 'navigate') {
      if (!navigate.navPoint || navigate.navPoint.confirmed) return;
      navigate.updateOrientation(pixelX, pixelY);
      return;
    }

    if (mapMode !== 'route_edit') return;
    if (!waypointEditor.hasActiveRotating) return;

    waypointEditor.updateActiveWaypointOrientation(pixelX, pixelY);
  };

  return {
    handleMapTap,
    handleDirectionDrag,
  };
}