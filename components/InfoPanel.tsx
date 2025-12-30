import React from 'react';
import { ELEMENTS } from '../data/elements';
import { useTranslation } from 'react-i18next';

interface InfoPanelProps {
  protons: number;
  neutrons: number;
  totalElectrons: number;
}

const InfoItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center text-sm py-1 border-b border-gray-700/50 last:border-b-0">
    <span className="text-gray-400">{label}</span>
    <span className={`font-mono font-bold ${color || 'text-white'}`}>{value}</span>
  </div>
);

export const InfoPanel: React.FC<InfoPanelProps> = ({ protons, neutrons, totalElectrons }) => {
  const { t } = useTranslation();
  const element = ELEMENTS.find(el => el.atomicNumber === protons);
  const symbol = element ? element.symbol : '?';
  const name = element ? t(element.name) : t('unknown_element');
  const atomicNumber = protons;
  const atomicMass = protons + neutrons;

  const charge = protons - totalElectrons;
  let chargeText: string;
  if (charge === 0) {
    chargeText = t('neutral');
  } else if (charge > 0) {
    chargeText = `+${charge}`;
  } else {
    chargeText = `${charge}`;
  }

  // Simple stability check (approximation)
  // Light elements (Z < 20): N/Z ≈ 1
  // Heavy elements (Z > 20): N/Z increases to ≈ 1.5
  const ratio = neutrons / protons;
  let stability = t('unstable');
  let stabilityColor = 'text-red-400';

  if (protons < 20) {
    if (ratio >= 0.9 && ratio <= 1.2) {
      stability = t('stable');
      stabilityColor = 'text-green-400';
    }
  } else {
    if (ratio >= 1.0 && ratio <= 1.6) {
      stability = t('stable');
      stabilityColor = 'text-green-400';
    }
  }

  // Special cases
  if (protons === 1 && neutrons === 0) { stability = t('stable'); stabilityColor = 'text-green-400'; } // Hydrogen-1
  if (protons === 43 || protons === 61) { stability = t('unstable'); stabilityColor = 'text-red-400'; } // Technetium, Promethium

  return (
    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-lg space-y-1 border border-gray-700 w-52">
      <div className="text-center mb-2 pb-2 border-b border-gray-700">
        <h2 className="text-5xl font-bold tracking-tighter" style={{ lineHeight: 1 }}>{symbol}</h2>
        <p className="text-sm text-gray-300 mt-1">{name}</p>
      </div>
      <InfoItem label={t('atomic_number')} value={atomicNumber} />
      <InfoItem label={t('atomic_mass')} value={atomicMass} />
      <InfoItem label={t('charge')} value={chargeText} />
      <InfoItem label={t('isotope')} value={stability} color={stabilityColor} />
    </div>
  );
};
