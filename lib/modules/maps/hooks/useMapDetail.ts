import { useEffect, useState } from 'react';
import { MapVectorData } from '../../../core/types';
import { MapVectorService } from '../services/MapVectorService';
import { supabase } from '../../../core/services/supabaseClient';

interface UseMapDetailReturn {
  mapData: MapVectorData | null;
  mapName: string;
  loading: boolean;
  error: string | null;
}

export function useMapDetail(mapId: string): UseMapDetailReturn {
  const [mapData, setMapData] = useState<MapVectorData | null>(null);
  const [mapName, setMapName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener metadata y json_url desde la tabla
        const { data, error: sbError } = await supabase
          .from('maps')
          .select('name, json_url')
          .eq('id', mapId)
          .single();

        if (sbError) throw sbError;
        if (!data?.json_url) throw new Error('El mapa no tiene datos vectoriales');

        setMapName(data.name);

        // 2. Descargar y parsear el JSON de polígonos
        const vectorData = await MapVectorService.fetch(data.json_url);
        setMapData(vectorData);

      } catch (err: any) {
        setError(err.message || 'Error al cargar el mapa');
      } finally {
        setLoading(false);
      }
    }

    if (mapId) load();
  }, [mapId]);

  return { mapData, mapName, loading, error };
}