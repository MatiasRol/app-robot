import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../../../core/services/supabaseClient';
import { MapItem, Robot } from '../../../core/types';
import { useCameraConnectionContext } from '../../camera/context/CameraConnectionContext';

interface AppContextType {
  robots: Robot[];
  updateRobotName: (robotId: string, newName: string) => void;

  maps: MapItem[];
  mapsLoading: boolean;
  deleteMap: (mapId: string) => void;

  selectedMapId: string | null;
  setSelectedMapId: (mapId: string | null) => void;
  selectedMap: MapItem | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function basenameWithoutExtension(value?: string | null) {
  if (!value) return null;
  const clean = value.split('/').pop() || value;
  return clean.replace(/\.[^/.]+$/, '');
}

function resolveMapIdFromRobotKey(robotMapKey: string, maps: MapItem[]): string | null {
  const normalized = robotMapKey.trim().toLowerCase();

  const byId = maps.find((m) => String(m.id).trim().toLowerCase() === normalized);
  if (byId) return byId.id;

  const byName = maps.find((m) => String(m.name).trim().toLowerCase() === normalized);
  if (byName) return byName.id;

  const byJsonBase = maps.find(
    (m) => basenameWithoutExtension(m.json_url)?.trim().toLowerCase() === normalized
  );
  if (byJsonBase) return byJsonBase.id;

  const byPngBase = maps.find(
    (m) => basenameWithoutExtension(m.png_url)?.trim().toLowerCase() === normalized
  );
  if (byPngBase) return byPngBase.id;

  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentMapId: robotCurrentMapKey } = useCameraConnectionContext();

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
  const [selectedMapId, setSelectedMapIdState] = useState<string | null>(null);

  const lastSyncedRobotMapId = useRef<string | null>(null);

  const selectedMap = maps.find((m) => m.id === selectedMapId) || null;

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setMapsLoading(true);

        if (!supabase) {
          console.warn('⚠️ Supabase no está disponible. No se cargarán mapas.');
          setMaps([]);
          setSelectedMapIdState(null);
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
      } finally {
        setMapsLoading(false);
      }
    };

    fetchMaps();
  }, []);

  useEffect(() => {
    if (!robotCurrentMapKey || maps.length === 0) return;

    const resolvedMapId = resolveMapIdFromRobotKey(robotCurrentMapKey, maps);
    if (!resolvedMapId) {
      console.warn('⚠️ No se encontró un mapa para:', robotCurrentMapKey);
      return;
    }

    if (selectedMapId !== resolvedMapId) {
      setSelectedMapIdState(resolvedMapId);
    }

    setMaps((prev) => {
      const alreadyCorrect = prev.every(
        (m) => Boolean(m.is_active) === (m.id === resolvedMapId)
      );

      if (alreadyCorrect) return prev;

      return prev.map((m) => ({
        ...m,
        is_active: m.id === resolvedMapId,
      }));
    });

    setRobots((prev) =>
      prev.map((robot) =>
        robot.id === '1'
          ? { ...robot, currentMapId: resolvedMapId }
          : robot
      )
    );

    if (lastSyncedRobotMapId.current === resolvedMapId) return;
    lastSyncedRobotMapId.current = resolvedMapId;

    const syncToDb = async () => {
      if (!supabase) return;

      try {
        await supabase
          .from('maps')
          .update({ is_active: false })
          .neq('id', '');

        await supabase
          .from('maps')
          .update({ is_active: true })
          .eq('id', resolvedMapId);
      } catch (err) {
        console.error('Error sincronizando mapa activo del robot a Supabase:', err);
      }
    };

    syncToDb();
  }, [robotCurrentMapKey, maps, selectedMapId]);

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

      await supabase
        .from('maps')
        .update({ is_active: false })
        .neq('id', '');

      if (mapId) {
        const { error } = await supabase
          .from('maps')
          .update({ is_active: true })
          .eq('id', mapId);

        if (error) throw error;

        setMaps((prev) =>
          prev.map((m) => ({ ...m, is_active: m.id === mapId }))
        );
      } else {
        setMaps((prev) => prev.map((m) => ({ ...m, is_active: false })));
      }

      setSelectedMapIdState(mapId);
    } catch (err) {
      console.error('Error actualizando mapa activo:', err);
    }
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
        deleteMap,
        selectedMapId,
        setSelectedMapId,
        selectedMap,
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