import React from 'react';
import { ModelInfo } from '../data/models';

interface ContextualInfoProps {
  data: ModelInfo;
}

export const ContextualInfo: React.FC<ContextualInfoProps> = ({ data }) => {
  return (
    <div className="p-3 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 max-w-sm space-y-3 text-sm">
      <h3 className="font-bold text-base text-indigo-300">{data.title}</h3>
      <p className="text-gray-300">{data.description}</p>
      <div>
        <h4 className="font-semibold text-gray-200">Experimento Chave:</h4>
        <p className="text-gray-400 italic">{data.experiment}</p>
      </div>
      <div>
        <h4 className="font-semibold text-gray-200">Limitações:</h4>
        <p className="text-gray-400 italic">{data.limitations}</p>
      </div>
    </div>
  );
};