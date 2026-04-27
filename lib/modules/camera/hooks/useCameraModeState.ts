import { useCallback, useState } from 'react';
import {
  hapticLight,
  hapticSelection,
} from '../../../core/utils/haptics';

export type CameraMode = 'view' | 'control';

interface UseCameraModeStateParams {
  onLeaveControl?: () => void;
}

export function useCameraModeState({
  onLeaveControl,
}: UseCameraModeStateParams = {}) {
  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<CameraMode | null>(null);

  const handleModeChange = useCallback(
    (newMode: CameraMode) => {
      if (newMode !== mode) {
        void hapticSelection();
        setPendingMode(newMode);
        setShowModeAlert(true);
      }
    },
    [mode]
  );

  const confirmModeChange = useCallback(() => {
    void hapticLight();

    if (mode === 'control' && pendingMode === 'view') {
      try {
        onLeaveControl?.();
      } catch (error) {
        console.error('Error saliendo del modo control:', error);
      }
    }

    if (pendingMode) {
      setMode(pendingMode);
    }

    setShowModeAlert(false);
    setPendingMode(null);
  }, [mode, onLeaveControl, pendingMode]);

  const cancelModeChange = useCallback(() => {
    void hapticLight();
    setShowModeAlert(false);
    setPendingMode(null);
  }, []);

  const resetModeState = useCallback(() => {
    setMode('view');
    setShowModeAlert(false);
    setPendingMode(null);
  }, []);

  return {
    mode,
    pendingMode,
    showModeAlert,
    handleModeChange,
    confirmModeChange,
    cancelModeChange,
    resetModeState,
  };
}