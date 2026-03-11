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
// Agregar a los tipos existentes:

export interface MapLayer {
  color: string;
  polygons: MapPolygon[];
}

export interface MapPolygon {
  exterior: [number, number][];   // coordenadas [x, y] en píxeles del mapa
  holes: [number, number][][];
  area: number;
}

export interface MapVectorData {
  id: string;
  metadata: {
    width_px: number;
    height_px: number;
    resolution: number;             // metros por pixel
    origin: [number, number, number]; // [x, y, theta]
    occupied_thresh: number;
    free_thresh: number;
  };
  layers: {
    obstacles: MapLayer;
    free_space: MapLayer;
    unknown: MapLayer;
  };
}

// MapItem actualizado
export interface MapItem {
  id: string;
  name: string;
  robotId: string;
  thumbnail: string;
  size: string;
  createdAt: Date;
  routes: Route[];
  png_url?: string;
  json_url?: string;              // ← nuevo
  resolution?: number;
  origin?: number[];
  width_px?: number;
  height_px?: number;
}