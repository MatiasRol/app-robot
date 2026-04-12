import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../core/services/supabaseClient';
import { MapItem, Robot } from '../../../core/types';

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
  const [selectedMapId, setSelectedMapIdState] = useState<string | null>(null);

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
          .update({ is_active: true })
          .eq('id', mapId);

        if (error) throw error;

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