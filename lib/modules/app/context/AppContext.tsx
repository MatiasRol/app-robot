import React, { createContext, ReactNode, useContext, useState } from 'react';
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
  const [mapsLoading] = useState(false);
  const [selectedMapId, setSelectedMapIdState] = useState<string | null>(null);

  const selectedMap = maps.find((m) => m.id === selectedMapId) || null;

  const setSelectedMapId = (mapId: string | null) => {
    setSelectedMapIdState(mapId);
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