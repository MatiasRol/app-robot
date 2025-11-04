export interface Robot {
    id: string;
    name: string;
    model: string;
    status: 'online' | 'offline' | 'connecting';
    battery: number;
    lastConnection?: Date;
  }
  
  export interface MapItem {
    id: string;
    name: string;
    robotId: string;
    thumbnail: string;
    size: string;
    createdAt: Date;
  }
  
  export interface ColorPaletteItem {
    color: string;
    label: string;
  }