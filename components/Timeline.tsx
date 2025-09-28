import React from 'react';
import { useTranslation } from 'react-i18next';

type ModelId = 'dalton' | 'thomson' | 'rutherford' | 'sommerfeld' | 'bohr' | 'schrodinger';

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
];

export const Timeline: React.FC<TimelineProps> = ({ currentModel, onModelChange }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-8 bg-gray-800/60 backdrop-blur-sm p-2 rounded-lg border border-gray-700">
      {models.map((model, index) => (
        <React.Fragment key={model.id}>
          <button
            onClick={() => onModelChange(model.id)}
            className={`px-3 py-1 text-sm md:px-4 md:py-2 md:text-base rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
              currentModel === model.id
                ? 'font-bold text-indigo-300 bg-gray-700'
                : 'text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <span className="font-semibold">{t(model.name)}</span>
            <span className="ml-2 text-xs text-gray-500">{model.year}</span>
          </button>
          {index < models.length - 1 && (
             <div className="h-px w-8 md:w-16 bg-gray-600"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
