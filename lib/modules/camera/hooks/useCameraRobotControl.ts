import { useCallback } from 'react';

interface UseCameraRobotControlParams {
  sendVelocityCommand: (linear: number, angular: number) => void;
  stopRobot: () => void;
}

export function useCameraRobotControl({
  sendVelocityCommand,
  stopRobot,
}: UseCameraRobotControlParams) {
  const handleJoystickMove = useCallback(
    (velocity: { linear: number; angular: number }) => {
      try {
        sendVelocityCommand(velocity.linear, velocity.angular);
      } catch (error) {
        console.error('Error enviando comando de velocidad:', error);
      }
    },
    [sendVelocityCommand]
  );

  const handleJoystickStop = useCallback(() => {
    try {
      stopRobot();
    } catch (error) {
      console.error('Error deteniendo robot:', error);
    }
  }, [stopRobot]);

  const stopRobotSafely = useCallback(() => {
    try {
      stopRobot();
    } catch (error) {
      console.error('Error deteniendo robot:', error);
    }
  }, [stopRobot]);

  return {
    handleJoystickMove,
    handleJoystickStop,
    stopRobotSafely,
  };
}