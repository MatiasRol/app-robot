import { useState } from 'react';

export type CameraMode = 'view' | 'control';

interface UseModeControlReturn {
  mode: CameraMode;
  showModeAlert: boolean;
  pendingMode: CameraMode | null;
  handleModeChange: (newMode: CameraMode) => void;
  confirmModeChange: () => void;
  cancelModeChange: () => void;
}

export const useModeControl = (): UseModeControlReturn => {
  const [mode, setMode] = useState<CameraMode>('view');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<CameraMode | null>(null);

  const handleModeChange = (newMode: CameraMode) => {
    if (newMode !== mode) {
      setPendingMode(newMode);
      setShowModeAlert(true);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      setMode(pendingMode);
    }
    setShowModeAlert(false);
    setPendingMode(null);
  };

  const cancelModeChange = () => {
    setShowModeAlert(false);
    setPendingMode(null);
  };

  return {
    mode,
    showModeAlert,
    pendingMode,
    handleModeChange,
    confirmModeChange,
    cancelModeChange,
  };
};