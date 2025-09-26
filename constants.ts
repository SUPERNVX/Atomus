
import { Shell } from './types';

export const SHELL_CONFIG: Shell[] = [
  { name: 'K', maxElectrons: 2, radius: 4 },
  { name: 'L', maxElectrons: 8, radius: 6 },
  { name: 'M', maxElectrons: 18, radius: 8 },
  { name: 'N', maxElectrons: 32, radius: 10 },
  { name: 'O', maxElectrons: 32, radius: 12 },
  { name: 'P', maxElectrons: 18, radius: 14 },
  { name: 'Q', maxElectrons: 8, radius: 16 },
];

export const COLORS = {
  proton: '#f87171',   // red-400
  neutron: '#86efac',  // green-300
  electron: '#60a5fa', // blue-400
  orbit: '#d1d5db',    // gray-300 (light gray, less intense than white)
  text: '#e5e7eb',     // gray-200
};
