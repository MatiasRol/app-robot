import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../../../core/services/supabaseClient';
import { MapItem, Robot } from '../../../core/types';

interface AppContextType {
  robots: Robot[];
  updateRobotName: (robotId: string, newName: string) => void;

  maps: MapItem[];
  mapsLoading: boolean;
  mapsError: string | null;
  reloadMaps: () => Promise<void>;
  deleteMap: (mapId: string) => void;

  selectedMapId: string | null;
  setSelectedMapId: (mapId: string | null) => void;
  selectedMap: MapItem | null;

  syncActiveMapFromRobot: (mapKey: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function normalizeMapKey(value?: string | null) {
  if (!value) return '';
  return value
    .toLowerCase()
    .trim()
    .replace(/\.(json|png)$/i, '');
}

function extractFileBase(value?: string | null) {
  if (!value) return '';
  const clean = value.split('?')[0];
  const lastPart = clean.split('/').pop() || '';
  return normalizeMapKey(lastPart);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [robots, setRobots] = useState<Robot[]>([
    {
      id: '1',
      name: 'Robot 1',
      model: 'Nombre del modelo',
      status: 'online',
      battery: 86,
      currentMapId: undefined,
    },
  ]);

  const [maps, setMaps] = useState<MapItem[]>([]);
  const [mapsLoading, setMapsLoading] = useState(true);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [selectedMapId, setSelectedMapIdState] = useState<string | null>(null);

  const selectedMap = useMemo(
    () => maps.find((m) => m.id === selectedMapId) || null,
    [maps, selectedMapId]
  );

  const reloadMaps = useCallback(async () => {
    try {
      setMapsLoading(true);
      setMapsError(null);

      if (!supabase) {
        console.warn('⚠️ Supabase no está disponible. No se cargarán mapas.');
        setMaps([]);
        setSelectedMapIdState(null);
        setMapsError('No se pudo conectar con la base de datos.');
        return;
      }

      const { data, error } = await supabase
        .from('maps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const adapted: MapItem[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        robotId: '1',
        thumbnail: item.png_url,
        size: 'Robot 1',
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        png_url: item.png_url,
        json_url: item.json_url,
        resolution: item.resolution,
        origin: item.origin,
        width_px: item.width_px,
        height_px: item.height_px,
        is_active: item.is_active,
      }));

      setMaps(adapted);

      const activeMap = adapted.find((m) => m.is_active === true);
      if (activeMap) {
        setSelectedMapIdState(activeMap.id);
      } else {
        setSelectedMapIdState(null);
      }
    } catch (err) {
      console.error('Error cargando mapas desde Supabase:', err);
      setMaps([]);
      setSelectedMapIdState(null);
      setMapsError('No se pudieron cargar los mapas.');
    } finally {
      setMapsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadMaps();
  }, [reloadMaps]);

  const setSelectedMapId = async (mapId: string | null) => {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase no está disponible. No se puede actualizar el mapa activo.');
        setSelectedMapIdState(mapId);
        setMaps((prev) =>
          prev.map((m) => ({ ...m, is_active: m.id === mapId }))
        );
        return;
      }

      if (mapId) {
        const { error } = await supabase
          .from('maps')
          .update({ is_active: false })
          .neq('id', '');

        if (error) throw error;

        const { error: error2 } = await supabase
          .from('maps')
          .update({ is_active: true })
          .eq('id', mapId);

        if (error2) throw error2;

        setMaps((prev) =>
          prev.map((m) => ({ ...m, is_active: m.id === mapId }))
        );
      } else {
        const { error } = await supabase
          .from('maps')
          .update({ is_active: false })
          .neq('id', '');

        if (error) throw error;

        setMaps((prev) => prev.map((m) => ({ ...m, is_active: false })));
      }

      setSelectedMapIdState(mapId);
    } catch (err) {
      console.error('Error actualizando mapa activo:', err);
    }
  };

  const syncActiveMapFromRobot = (mapKey: string | null) => {
    if (!mapKey || maps.length === 0) return;

    const normalizedIncoming = normalizeMapKey(mapKey);

    const matchedMap = maps.find((map) => {
      const byId = normalizeMapKey(map.id) === normalizedIncoming;
      const byName = normalizeMapKey(map.name) === normalizedIncoming;
      const byJson = extractFileBase(map.json_url) === normalizedIncoming;
      const byPng = extractFileBase(map.png_url) === normalizedIncoming;
      return byId || byName || byJson || byPng;
    });

    if (!matchedMap) {
      console.warn('⚠️ No se encontró mapa local para active_map:', mapKey);
      return;
    }

    if (matchedMap.id === selectedMapId) return;

    setSelectedMapIdState(matchedMap.id);
    setMaps((prev) =>
      prev.map((m) => ({
        ...m,
        is_active: m.id === matchedMap.id,
      }))
    );
  };

  const updateRobotName = (robotId: string, newName: string) => {
    setRobots((prev) =>
      prev.map((robot) =>
        robot.id === robotId ? { ...robot, name: newName } : robot
      )
    );
  };

  const deleteMap = (mapId: string) => {
    setMaps((prev) => prev.filter((map) => map.id !== mapId));
    if (selectedMapId === mapId) setSelectedMapIdState(null);
  };

  return (
    <AppContext.Provider
      value={{
        robots,
        updateRobotName,
        maps,
        mapsLoading,
        mapsError,
        reloadMaps,
        deleteMap,
        selectedMapId,
        setSelectedMapId,
        selectedMap,
        syncActiveMapFromRobot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
}