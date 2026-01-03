import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Robot, MapItem, Route } from '../types';

interface AppContextType {
  // Robots
  robots: Robot[];
  updateRobotName: (robotId: string, newName: string) => void;
  
  // Mapas
  maps: MapItem[];
  addMap: (name: string) => void;
  deleteMap: (mapId: string) => void;
  
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
      currentMapId: '1',
    },
  ]);

  const [maps, setMaps] = useState<MapItem[]>([
    {
      id: '1',
      name: 'Mapa 1',
      robotId: '1',
      thumbnail: 'https://via.placeholder.com/300x200',
      size: 'Robot 1',
      createdAt: new Date(),
      routes: [
        {
          id: '1',
          name: 'Ruta 1',
          mapId: '1',
          schedule: 'Vie 27 Dic 2024 a las 18:30',
        },
        {
          id: '2',
          name: 'Ruta 2',
          mapId: '1',
          schedule: 'Se inicia al finalizar el anterior',
        },
        {
          id: '3',
          name: 'Ruta 3',
          mapId: '1',
        },
      ],
    },
    {
      id: '2',
      name: 'Mapa 2',
      robotId: '1',
      thumbnail: 'https://via.placeholder.com/300x200',
      size: 'Robot 1',
      createdAt: new Date(),
      routes: [],
    },
  ]);

  // Función para actualizar nombre del robot
  const updateRobotName = (robotId: string, newName: string) => {
    setRobots((prev) =>
      prev.map((robot) =>
        robot.id === robotId ? { ...robot, name: newName } : robot
      )
    );
  };

  // Función para agregar mapa
  const addMap = (name: string) => {
    const newMap: MapItem = {
      id: Date.now().toString(),
      name: name || 'Nuevo Mapa',
      robotId: robots[0]?.id || '1',
      thumbnail: 'https://via.placeholder.com/300x200',
      size: robots[0]?.name || 'Robot 1',
      createdAt: new Date(),
      routes: [],
    };
    setMaps((prev) => [...prev, newMap]);
  };

  // Función para eliminar mapa
  const deleteMap = (mapId: string) => {
    setMaps((prev) => prev.filter((map) => map.id !== mapId));
  };

  // Función para agregar ruta
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

  // Función para actualizar ruta
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

  // Función para eliminar ruta
  const deleteRoute = (routeId: string) => {
    setMaps((prev) =>
      prev.map((map) => ({
        ...map,
        routes: map.routes.filter((route) => route.id !== routeId),
      }))
    );
  };

  // Función para obtener rutas de un mapa
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
        addMap,
        deleteMap,
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