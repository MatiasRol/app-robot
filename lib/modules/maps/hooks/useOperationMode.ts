import { useState } from 'react';

export type OperationMode = 'vigilancia' | 'servicio';

export function useOperationMode() {
  const [operationMode, setOperationMode] = useState<OperationMode>('vigilancia');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<OperationMode | null>(null);

  const handleModeChange = (newMode: OperationMode) => {
    if (newMode !== operationMode) {
      setPendingMode(newMode);
      setShowModeAlert(true);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) setOperationMode(pendingMode);
    setShowModeAlert(false);
    setPendingMode(null);
  };

  const cancelModeChange = () => {
    setShowModeAlert(false);
    setPendingMode(null);
  };

  return {
    mode: operationMode,
    handleModeChange,
    alertProps: {
      visible: showModeAlert,
      pendingMode,
      onConfirm: confirmModeChange,
      onCancel: cancelModeChange,
    },
  };
}