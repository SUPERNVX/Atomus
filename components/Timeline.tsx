import React from 'react';
import { useTranslation } from 'react-i18next';

type ModelId = 'dalton' | 'thomson' | 'rutherford' | 'sommerfeld' | 'bohr' | 'schrodinger' | 'entanglement';

interface TimelineProps {
  currentModel: ModelId;
  onModelChange: (model: ModelId) => void;
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

export const Timeline: React.FC<TimelineProps> = ({ currentModel, onModelChange }) => {
  const { t } = useTranslation();
  return (
    <div className="inline-flex items-center bg-gray-800/60 backdrop-blur-sm py-2 px-2 rounded-lg border border-gray-700 max-w-full overflow-x-auto">
      <div className="flex flex-nowrap justify-center items-center gap-x-1 sm:gap-x-2 md:gap-x-3">
        {models.map((model, index) => (
          <React.Fragment key={model.id}>
            <button
              onClick={() => onModelChange(model.id)}
              className={`px-1.5 py-1 text-sm sm:text-base md:text-lg rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex flex-col items-center flex-shrink-0 ${currentModel === model.id
                ? 'font-bold text-indigo-300 bg-gray-700'
                : 'text-gray-400 hover:bg-gray-700/50'
                }`}
            >
              <span className="font-semibold whitespace-nowrap">{t(model.name)}</span>
              <span className="text-[0.7rem] sm:text-[0.8rem] text-gray-500 mt-0.5">{model.year}</span>
            </button>
            {index < models.length - 1 && (
              <div className="h-px w-4 sm:w-6 md:w-10 bg-gray-600 my-2 hidden md:block self-center flex-shrink-0"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
