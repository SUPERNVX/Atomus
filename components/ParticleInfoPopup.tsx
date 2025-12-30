import React from 'react';
import { useTranslation } from 'react-i18next';

interface ParticleInfoPopupProps {
    type: 'proton' | 'neutron' | 'electron';
    onClose: () => void;
}

export const ParticleInfoPopup: React.FC<ParticleInfoPopupProps> = ({ type, onClose }) => {
    const { t } = useTranslation();

    const info = {
        proton: {
            title: t('proton', 'Proton'),
            charge: '+1',
            mass: '~1.672 × 10⁻²⁷ kg',
            desc: t('protonDesc', 'Positively charged particle in the nucleus. Determines the element identity.')
        },
        neutron: {
            title: t('neutron', 'Neutron'),
            charge: '0',
            mass: '~1.674 × 10⁻²⁷ kg',
            desc: t('neutronDesc', 'Neutral particle in the nucleus. Stabilizes the atom via the strong nuclear force.')
        },
        electron: {
            title: t('electron', 'Electron'),
            charge: '-1',
            mass: '~9.109 × 10⁻³¹ kg',
            desc: t('electronDesc', 'Negatively charged particle orbiting the nucleus. Determines chemical bonding.')
        }
    }[type];

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 
                    shadow-[0_0_30px_rgba(0,255,255,0.2)] text-white max-w-sm w-full z-50
                    animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    {info.title}
                </h2>
                <button
                    onClick={onClose}
                    className="text-white/50 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/60">{t('charge', 'Charge')}</span>
                    <span className="font-mono text-cyan-300">{info.charge}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/60">{t('mass', 'Mass')}</span>
                    <span className="font-mono text-cyan-300">{info.mass}</span>
                </div>
                <p className="text-white/80 leading-relaxed pt-2">
                    {info.desc}
                </p>
            </div>
        </div>
    );
};
