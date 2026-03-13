import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../core/services/supabaseClient';
import { MapItem, Robot, Route } from '../../../core/types';

interface AppContextType {
  // Robots
  robots: Robot[];
  updateRobotName: (robotId: string, newName: string) => void;

  // Mapas
  maps: MapItem[];
  mapsLoading: boolean;
  deleteMap: (mapId: string) => void;

  // Mapa seleccionado
  selectedMapId: string | null;
  setSelectedMapId: (mapId: string | null) => void;
  selectedMap: MapItem | null;

  // Rutas
  addRoute: (mapId: string, routeName: string, schedule?: string) => void;
  updateRoute: (routeId: string, updates: Partial<Route>) => void;
  deleteRoute: (routeId: string) => void;
  getMapRoutes: (mapId: string) => Route[];
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
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const selectedMap = maps.find((m) => m.id === selectedMapId) || null;

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setMapsLoading(true);
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
      } catch (err) {
        console.error('Error cargando mapas desde Supabase:', err);
      } finally {
        setMapsLoading(false);
      }
    };

    fetchMaps();
  }, []);

  const updateRobotName = (robotId: string, newName: string) => {
    setRobots((prev) =>
      prev.map((robot) =>
        robot.id === robotId ? { ...robot, name: newName } : robot
      )
    );
  };

  const deleteMap = (mapId: string) => {
    setMaps((prev) => prev.filter((map) => map.id !== mapId));
    if (selectedMapId === mapId) setSelectedMapId(null);
  };

  const addRoute = (mapId: string, routeName: string, schedule?: string) => {
    const newRoute: Route = {
      id: Date.now().toString(),
      name: routeName,
      mapId: mapId,
      schedule: schedule,
    };
    setMaps((prev) =>
      prev.map((map) =>
        map.id === mapId
          ? { ...map, routes: [...map.routes, newRoute] }
          : map
      )
    );
  };

  const updateRoute = (routeId: string, updates: Partial<Route>) => {
    setMaps((prev) =>
      prev.map((map) => ({
        ...map,
        routes: map.routes.map((route) =>
          route.id === routeId ? { ...route, ...updates } : route
        ),
      }))
    );
  };

  const deleteRoute = (routeId: string) => {
    setMaps((prev) =>
      prev.map((map) => ({
        ...map,
        routes: map.routes.filter((route) => route.id !== routeId),
      }))
    );
  };

  const getMapRoutes = (mapId: string): Route[] => {
    const map = maps.find((m) => m.id === mapId);
    return map?.routes || [];
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
        addRoute,
        updateRoute,
        deleteRoute,
        getMapRoutes,
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