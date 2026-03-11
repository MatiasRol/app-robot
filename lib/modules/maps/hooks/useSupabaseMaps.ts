import { useEffect, useState } from 'react';
import { supabase } from '../../../core/services/supabaseClient';
import { MapItem } from '../../../core/types';

interface UseSupabaseMapsReturn {
  maps: MapItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSupabaseMaps(): UseSupabaseMapsReturn {
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) throw sbError;

      const adapted: MapItem[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        robotId: '1',
        thumbnail: item.png_url,
        size: 'Robot 1',
        createdAt: new Date(item.created_at),
        routes: [],
        png_url: item.png_url,
        json_url: item.json_url,
        resolution: item.resolution,
        origin: item.origin,
        width_px: item.width_px,
        height_px: item.height_px,
      }));

      setMaps(adapted);
    } catch (err: any) {
      setError(err.message || 'Error al cargar mapas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return { maps, loading, error, refetch: fetchMaps };
}