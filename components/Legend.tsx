
import React from 'react';
import { COLORS } from '../constants';

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-sm">{label}</span>
  </div>
);

interface LegendProps {
  onUpdateElectrons: () => void;
}

export const Legend: React.FC<LegendProps> = ({ onUpdateElectrons }) => {
  return (
    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 space-y-3">
      <div className="space-y-2">
        <LegendItem color={COLORS.proton} label="Próton" />
        <LegendItem color={COLORS.neutron} label="Nêutron" />
        <LegendItem color={COLORS.electron} label="Elétron" />
      </div>
      <button 
        onClick={onUpdateElectrons}
        className="w-full text-xs bg-indigo-500 text-white font-semibold py-2 px-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        Atualizar Elétrons
      </button>
    </div>
  );
};
