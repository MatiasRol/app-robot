export interface Robot {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'connecting';
  battery: number;
  lastConnection?: Date;
  currentMapId?: string; // ID del mapa que está usando
}

export interface MapItem {
  id: string;
  name: string;
  robotId: string;
  thumbnail: string;
  size: string;
  createdAt: Date;
  routes: Route[]; // Rutas del mapa
}

export interface Route {
  id: string;
  name: string;
  mapId: string;
  schedule?: string;
  points?: RoutePoint[]; // Puntos de la ruta
}

export interface RoutePoint {
  x: number;
  y: number;
  action?: 'start' | 'end' | 'waypoint';
}

export interface ColorPaletteItem {
  color: string;
  label: string;
}