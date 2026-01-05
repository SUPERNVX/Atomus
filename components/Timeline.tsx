import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MODEL_DATA } from '../data/models';

type ModelId = 'dalton' | 'thomson' | 'rutherford' | 'sommerfeld' | 'bohr' | 'schrodinger' | 'entanglement';

interface TimelineProps {
  currentModel: ModelId;
  onModelChange: (model: ModelId) => void;
  onUpdateElectrons?: () => void;
}

const models: { id: ModelId; name: string; year: number }[] = [
  { id: 'dalton', name: 'dalton', year: 1803 },
  { id: 'thomson', name: 'thomson', year: 1897 },
  { id: 'rutherford', name: 'rutherford', year: 1911 },
  { id: 'bohr', name: 'bohr', year: 1913 },
  { id: 'sommerfeld', name: 'sommerfeld', year: 1916 },
  { id: 'schrodinger', name: 'schrodinger', year: 1926 },
  { id: 'entanglement', name: 'entanglement', year: 1935 },
];

export const Timeline: React.FC<TimelineProps> = ({ currentModel, onModelChange, onUpdateElectrons }) => {
  const { t } = useTranslation();
  const [activeModel, setActiveModel] = useState<ModelId>(currentModel);

  useEffect(() => {
    setActiveModel(currentModel);
  }, [currentModel]);

  return (
    <div className="fixed left-0 top-0 h-full flex flex-col z-50 pointer-events-none">
      {/* Vertical Line */}
      <div className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-gray-700/50 -z-10" />

      <div className="flex flex-col space-y-12 pointer-events-auto h-full overflow-y-auto no-scrollbar pt-20 pb-40 pl-[28px] pr-8">
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {models.map((model) => {
          const isActive = activeModel === model.id;
          const modelData = MODEL_DATA[model.id];

          return (
            <div key={model.id} className="relative group flex items-start flex-shrink-0">
              {/* Dot Indicator */}
              <button
                onClick={() => onModelChange(model.id)}
                className={`
                  relative z-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive ? 'w-6 h-6 bg-indigo-500 ring-4 ring-indigo-500/30' : 'w-6 h-6 bg-gray-600 hover:bg-gray-500 hover:scale-110'}
                `}
              >
                {isActive && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
              </button>

              {/* Content Container */}
              <div
                className={`
                  ml-6 flex flex-col transition-all duration-500 ease-out origin-left
                  ${isActive ? 'opacity-100 translate-x-0' : 'opacity-40 hover:opacity-100 scale-95'}
                `}
              >
                {/* Header (Always Visible) */}
                <button
                  onClick={() => onModelChange(model.id)}
                  className="text-left focus:outline-none"
                >
                  <span className={`block text-lg font-bold leading-none mb-1 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {t(model.name)}
                  </span>
                  <span className="block text-sm text-gray-500 font-mono">
                    {model.year}
                  </span>
                </button>

                {/* Expanded Card (Only Active) */}
                {isActive && modelData && (
                  <div className="mt-4 p-5 rounded-xl bg-gray-800/80 backdrop-blur-md border border-indigo-500/30 shadow-2xl w-[320px] animate-in fade-in slide-in-from-left-4 duration-500 mb-8">
                    <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                      {t(modelData.description)}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1">{t('key_experiment')}</h4>
                        <p className="text-xs text-gray-400">{t(modelData.experiment)}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1">{t('limitations')}</h4>
                        <p className="text-xs text-gray-400">{t(modelData.limitations)}</p>
                      </div>
                    </div>

                    {/* Action Button (e.g., Update Electrons for Bohr) */}
                    {(model.id === 'bohr' || model.id === 'sommerfeld') && onUpdateElectrons && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElectrons();
                        }}
                        className="w-full mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                      >
                        {t('update_electrons')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {/* Spacer for bottom scrolling */}
        <div className="h-32 flex-shrink-0" />
      </div>
    </div>
  );
};
