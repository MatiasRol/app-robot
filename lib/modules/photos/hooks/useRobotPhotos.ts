import React from 'react';
import { supabase } from '../../../core/services/supabaseClient';

export interface RobotPhoto {
  id: string;
  file_name: string;
  storage_path: string;
  url: string;
  captured_at: string;
  local_path?: string | null;
  created_at?: string;
}

export function useRobotPhotos() {
  const [photos, setPhotos] = React.useState<RobotPhoto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadPhotos = React.useCallback(async () => {
    if (!supabase) {
      setPhotos([]);
      setError('Supabase no está configurado en la app.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('robot_photos')
      .select('id, file_name, storage_path, url, captured_at, local_path, created_at')
      .order('captured_at', { ascending: false });

    if (error) {
      setPhotos([]);
      setError(error.message || 'No se pudieron cargar las fotos.');
      setLoading(false);
      return;
    }

    setPhotos((data as RobotPhoto[]) ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    loading,
    error,
    reloadPhotos: loadPhotos,
  };
}