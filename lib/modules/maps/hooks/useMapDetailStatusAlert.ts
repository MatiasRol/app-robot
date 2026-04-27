import { useState } from 'react';
import {
  hapticError,
  hapticLight,
  hapticSuccess,
  hapticWarning,
} from '../../../core/utils/haptics';

export type MapDetailStatusVariant = 'success' | 'warning' | 'error' | 'info';

export type MapDetailStatusAlertState = {
  visible: boolean;
  title: string;
  message: string;
  variant: MapDetailStatusVariant;
};

export function useMapDetailStatusAlert() {
  const [statusAlert, setStatusAlert] = useState<MapDetailStatusAlertState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showStatus = (
    title: string,
    message: string,
    variant: MapDetailStatusVariant = 'info'
  ) => {
    if (variant === 'success') {
      void hapticSuccess();
    } else if (variant === 'warning') {
      void hapticWarning();
    } else if (variant === 'error') {
      void hapticError();
    } else {
      void hapticLight();
    }

    setStatusAlert({
      visible: true,
      title,
      message,
      variant,
    });
  };

  const closeStatus = () => {
    setStatusAlert((prev) => ({ ...prev, visible: false }));
  };

  return {
    statusAlert,
    showStatus,
    closeStatus,
  };
}