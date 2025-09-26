
export interface Shell {
  name: string;
  maxElectrons: number;
  radius: number;
}

export interface AtomState {
  protons: number;
  neutrons: number;
  electrons: [number, number, number, number, number, number, number];
}

export interface RutherfordModelProps {
  protons: number;
  neutrons: number;
}
