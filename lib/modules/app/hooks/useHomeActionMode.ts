import { useState } from 'react';
import { hapticLight } from '../../../core/utils/haptics';

export type HomeActionMode = 'default' | 'media';

export function useHomeActionMode() {
  const [actionMode, setActionMode] = useState<HomeActionMode>('default');

  const toggleActionMode = () => {
    void hapticLight();

    setActionMode((prev) => (prev === 'default' ? 'media' : 'default'));
  };

  const setDefaultMode = () => {
    setActionMode('default');
  };

  const setMediaMode = () => {
    setActionMode('media');
  };

  return {
    actionMode,
    isDefaultMode: actionMode === 'default',
    isMediaMode: actionMode === 'media',
    toggleActionMode,
    setDefaultMode,
    setMediaMode,
  };
}