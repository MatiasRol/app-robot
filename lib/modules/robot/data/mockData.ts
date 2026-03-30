import { ColorPaletteItem, Robot } from '../../../core/types';

export const mockRobots: Robot[] = [
  {
    id: '1',
    name: 'Robot 1',
    model: 'Nombre del modelo',
    status: 'online',
    battery: 60,
    lastConnection: new Date(),
  },
  {
    id: '2',
    name: 'Robot 2',
    model: 'Nombre del modelo',
    status: 'online',
    battery: 85,
    lastConnection: new Date(),
  },
];

export const colorPalette: ColorPaletteItem[] = [
  { color: '#6F7075', label: 'Gray' },
  { color: '#252932', label: 'Dark' },
  { color: '#3A3E47', label: 'Medium' },
  { color: '#ADE2E0', label: 'Light' },
  { color: '#6DA6B9', label: 'Blue' },
  { color: '#326B7E', label: 'Dark Blue' },
  { color: '#EDEDED', label: 'White' },
];