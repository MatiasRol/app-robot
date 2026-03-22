import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../core/services/supabaseClient';
import { MapItem, Robot, Route } from '../../../core/types';

const CACHE_KEY_MAPS = 'cached_maps';
const CACHE_KEY_SELECTED_MAP = 'selected_map_id';

interface AppContextType {
  // Robots
  robots: Robot[];
  updateRobotName: (robotId: string, newName: string) => void;

  // Mapas
  maps: MapItem[];
  mapsLoading: boolean;
  isOffline: boolean;
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
  const [isOffline, setIsOffline] = useState(false);
  const [selectedMapId, setSelectedMapIdState] = useState<string | null>(null);

  const selectedMap = maps.find((m) => m.id === selectedMapId) || null;

  // Persistir el mapa seleccionado cuando cambia
  const setSelectedMapId = async (mapId: string | null) => {
    setSelectedMapIdState(mapId);
    try {
      if (mapId) {
        await AsyncStorage.setItem(CACHE_KEY_SELECTED_MAP, mapId);
      } else {
        await AsyncStorage.removeItem(CACHE_KEY_SELECTED_MAP);
      }
    } catch (err) {
      console.error('Error guardando mapa seleccionado:', err);
    }
  };

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setMapsLoading(true);

        // 1. Cargar caché local primero (para mostrar algo inmediatamente)
        const cached = await AsyncStorage.getItem(CACHE_KEY_MAPS);
        if (cached) {
          const parsedCache: MapItem[] = JSON.parse(cached).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
          }));
          setMaps(parsedCache);
        }

        // 2. Cargar el mapa seleccionado guardado
        const savedSelectedMapId = await AsyncStorage.getItem(CACHE_KEY_SELECTED_MAP);
        if (savedSelectedMapId) {
          setSelectedMapIdState(savedSelectedMapId);
        }

        // 3. Intentar cargar desde Supabase
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
        setIsOffline(false);

        // 4. Guardar en caché local
        await AsyncStorage.setItem(CACHE_KEY_MAPS, JSON.stringify(adapted));

      } catch (err) {
        console.warn('Sin conexión, usando caché local:', err);
        setIsOffline(true);
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
        isOffline,
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