import React from 'react';
import { ELEMENTS } from '../data/elements';

interface InfoPanelProps {
  protons: number;
  neutrons: number;
  totalElectrons: number;
}

const InfoItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm py-1 border-b border-gray-700/50 last:border-b-0">
    <span className="text-gray-400">{label}</span>
    <span className="font-mono font-bold text-white">{value}</span>
  </div>
);

export const InfoPanel: React.FC<InfoPanelProps> = ({ protons, neutrons, totalElectrons }) => {
  const element = ELEMENTS.find(el => el.atomicNumber === protons);
  const symbol = element ? element.symbol : '?';
  const name = element ? element.name : 'Elemento Desconhecido';
  const atomicNumber = protons;
  const atomicMass = protons + neutrons;
  
  const charge = protons - totalElectrons;
  let chargeText: string;
  if (charge === 0) {
    chargeText = 'Neutro';
  } else if (charge > 0) {
    chargeText = `+${charge}`;
  } else {
    chargeText = `${charge}`;
  }

  return (
    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-lg space-y-1 border border-gray-700 w-52">
      <div className="text-center mb-2 pb-2 border-b border-gray-700">
        <h2 className="text-5xl font-bold tracking-tighter" style={{ lineHeight: 1 }}>{symbol}</h2>
        <p className="text-sm text-gray-300 mt-1">{name}</p>
      </div>
      <InfoItem label="Nº Atômico" value={atomicNumber} />
      <InfoItem label="Massa Atômica" value={atomicMass} />
      <InfoItem label="Carga" value={chargeText} />
    </div>
  );
};
