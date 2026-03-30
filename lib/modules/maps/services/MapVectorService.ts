import { MapVectorData } from '../../../core/types';

export class MapVectorService {
  static async fetch(jsonUrl: string): Promise<MapVectorData> {
    const response = await fetch(jsonUrl);
    
    if (!response.ok) {
      throw new Error(`Error al descargar mapa vectorial: ${response.status}`);
    }
    
    const data: MapVectorData = await response.json();
    return data;
  }
}