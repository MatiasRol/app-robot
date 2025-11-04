import { ColorPaletteItem, MapItem, Robot } from '../types';

export const mockRobot: Robot = {
  id: '1',
  name: 'Robot 1',
  model: 'Modelo del robot',
  status: 'online',
  battery: 85,
  lastConnection: new Date(),
};

export const mockMaps: MapItem[] = [
  {
    id: '1',
    name: 'Mapa 1',
    robotId: '1',
    thumbnail: 'map1.png',
    size: '25 m²',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Mapa 2',
    robotId: '1',
    thumbnail: 'map2.png',
    size: '18 m²',
    createdAt: new Date('2024-01-10'),
  },
];

export const colorPalette: ColorPaletteItem[] = [
  { color: '#6F7075', label: 'Gray' },
  { color: '#252932', label: 'Dark' },
  { color: '#3A3E47', label: 'Medium' },
  { color: '#ADE2E0', label: 'Light' },
  { color: '#6DA6B8', label: 'Blue' },
  { color: '#326B7E', label: 'Dark Blue' },
  { color: '#EDEDED', label: 'White' },
];