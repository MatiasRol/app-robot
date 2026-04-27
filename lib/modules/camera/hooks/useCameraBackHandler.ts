import { useCallback } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { hapticLight } from '../../../core/utils/haptics';

interface UseCameraBackHandlerParams {
  router: any;
  stopRobotSafely: () => void;
}

export function useCameraBackHandler({
  router,
  stopRobotSafely,
}: UseCameraBackHandlerParams) {
  const handleBack = useCallback(async () => {
    void hapticLight();

    try {
      stopRobotSafely();
    } catch (error) {
      console.error('Error deteniendo robot al volver:', error);
    }

    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT
    ).catch(() => {});

    router.back();
  }, [router, stopRobotSafely]);

  return {
    handleBack,
  };
}