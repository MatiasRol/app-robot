export interface Robot {
  id: string;
  name: string;
  model: string;
  status: 'online' | 'offline' | 'connecting';
  battery: number;
  lastConnection?: Date;
  currentMapId?: string; 
}

export interface MapItem {
  id: string;
  name: string;
  robotId: string;
  thumbnail: string;
  size: string;
  createdAt: Date;
  routes: Route[]; 
}

export interface Route {
  id: string;
  name: string;
  mapId: string;
  schedule?: string;
  points?: RoutePoint[]; 
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


export interface MapLayer {
  color: string;
  polygons: MapPolygon[];
}

export interface MapPolygon {
  exterior: [number, number][];   
  holes: [number, number][][];
  area: number;
}

export interface MapVectorData {
  id: string;
  metadata: {
    width_px: number;
    height_px: number;
    resolution: number;             
    origin: [number, number, number]; 
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
  json_url?: string;              
  resolution?: number;
  origin?: number[];
  width_px?: number;
  height_px?: number;
  is_active?: boolean;
}