import React from 'react';
import { supabase } from '../../../core/services/supabaseClient';
import {
  buildRobotVideoDownloadUrl,
  buildRobotVideoStreamUrl,
} from '../utils/robotVideoUrl';

export interface RobotVideo {
  id: string;
  title?: string | null;
  cover_file_name: string;
  cover_storage_path: string;
  cover_url: string;
  captured_at: string;
  local_cover_path?: string | null;
  duration_seconds?: number | null;
  created_at?: string;
  video_file_name?: string | null;
  video_storage_path?: string | null;
  video_url?: string | null;
  local_video_path?: string | null;

  stream_url?: string | null;
  download_url?: string | null;
}

export function useRobotVideos() {
  const [videos, setVideos] = React.useState<RobotVideo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadVideos = React.useCallback(async () => {
    if (!supabase) {
      setVideos([]);
      setError('Supabase no está configurado en la app.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('robot_videos')
      .select(
        'id, title, cover_file_name, cover_storage_path, cover_url, captured_at, local_cover_path, duration_seconds, created_at, video_file_name, video_storage_path, video_url, local_video_path'
      )
      .order('captured_at', { ascending: false });

    if (error) {
      setVideos([]);
      setError(error.message || 'No se pudieron cargar los videos.');
      setLoading(false);
      return;
    }

    const mapped = ((data as RobotVideo[]) ?? []).map((item) => ({
      ...item,
      stream_url: buildRobotVideoStreamUrl(item.video_file_name),
      download_url: buildRobotVideoDownloadUrl(item.video_file_name),
    }));

    setVideos(mapped);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  return {
    videos,
    loading,
    error,
    reloadVideos: loadVideos,
  };
}