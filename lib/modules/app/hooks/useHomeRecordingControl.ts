import React from 'react';
import {
  hapticLight,
  hapticSelection,
  hapticWarning,
} from '../../../core/utils/haptics';

interface UseHomeRecordingControlParams {
  commandsConnected: boolean;
  isRobotRecording: boolean;
  robotRecordingState: 'idle' | 'starting' | 'recording' | 'stopping';
  sendRecordingCommand: (value: 'on' | 'off') => void;
}

const ALLOW_LOCAL_PREVIEW_WITHOUT_ROBOT = true;

export function useHomeRecordingControl({
  commandsConnected,
  isRobotRecording,
  robotRecordingState,
  sendRecordingCommand,
}: UseHomeRecordingControlParams) {
  const [showRecordingConfirm, setShowRecordingConfirm] = React.useState(false);
  const [localPreviewRecording, setLocalPreviewRecording] = React.useState(false);

  const isBusy =
    robotRecordingState === 'starting' || robotRecordingState === 'stopping';

  const isRecordingActive = commandsConnected
    ? isRobotRecording
    : localPreviewRecording;

  const handleRecordingPress = () => {
    if (commandsConnected && isBusy) {
      void hapticWarning();
      return;
    }

    void hapticSelection();
    setShowRecordingConfirm(true);
  };

  const cancelRecordingAction = () => {
    void hapticLight();
    setShowRecordingConfirm(false);
  };

  const confirmRecordingAction = () => {
    const nextValue: 'on' | 'off' = isRecordingActive ? 'off' : 'on';

    if (commandsConnected) {
      sendRecordingCommand(nextValue);
      setShowRecordingConfirm(false);
      void hapticLight();
      return;
    }

    if (!ALLOW_LOCAL_PREVIEW_WITHOUT_ROBOT) {
      void hapticWarning();
      setShowRecordingConfirm(false);
      return;
    }

    setLocalPreviewRecording(nextValue === 'on');
    setShowRecordingConfirm(false);
    void hapticLight();
  };

  React.useEffect(() => {
    if (!commandsConnected) return;
    setLocalPreviewRecording(false);
  }, [commandsConnected]);

  return {
    showRecordingConfirm,
    isRecordingActive,
    isBusyRecordingTransition: isBusy,
    handleRecordingPress,
    cancelRecordingAction,
    confirmRecordingAction,
  };
}