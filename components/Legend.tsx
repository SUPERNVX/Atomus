
import React from 'react';
import { COLORS } from '../constants';
import { useTranslation } from 'react-i18next';

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-sm">{label}</span>
  </div>
);

export const Legend: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 space-y-3">
      <div className="space-y-2">
        <LegendItem color={COLORS.proton} label={t('proton')} />
        <LegendItem color={COLORS.neutron} label={t('neutron')} />
        <LegendItem color={COLORS.electron} label={t('electron')} />
      </div>
    </div>
  );
};
