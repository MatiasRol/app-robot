import { MapMode } from '../../../core/types';
import { hapticLight } from '../../../core/utils/haptics';

interface UseMapDetailOverlayActionsParams {
  setMapMode: (mode: MapMode) => void;
  expandBottomSheet: () => void;
  resetNavigationExecution: () => void;
  resetNavigate: () => void;
  handleCancelNavigation: () => void;
}

export function useMapDetailOverlayActions({
  setMapMode,
  expandBottomSheet,
  resetNavigationExecution,
  resetNavigate,
  handleCancelNavigation,
}: UseMapDetailOverlayActionsParams) {
  const handleRoutesPress = () => {
    void hapticLight();
    setMapMode('route_list');
    expandBottomSheet();
  };

  const handleNavigatePress = () => {
    void hapticLight();
    resetNavigationExecution();
    resetNavigate();
    setMapMode('navigate');
  };

  const handleCancelIdleNavigate = () => {
    void hapticLight();
    resetNavigate();
    setMapMode('idle');
  };

  return {
    handleRoutesPress,
    handleNavigatePress,
    handleCancelIdleNavigate,
    handleCancelRunningNavigate: handleCancelNavigation,
  };
}