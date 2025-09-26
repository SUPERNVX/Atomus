import React, { useState, useEffect, useRef } from 'react';
import { AtomState, Shell } from '../types';

interface ControlsProps {
  atomState: AtomState;
  shellConfig: Shell[];
  onProtonChange: (value: number) => void;
  onNeutronChange: (value: number) => void;
  onElectronChange: (shellIndex: number, value: number) => void;
  showShellControls: boolean;
}

const EditableValue: React.FC<{
  value: number;
  min: number;
  max: number;
  onSave: (newValue: number) => void;
  className?: string;
}> = ({ value, min, max, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(String(value));
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    let numericValue = parseInt(currentValue, 10);
    if (isNaN(numericValue)) {
      numericValue = value; // Reverte se não for um número
    }
    
    // Garante que o valor esteja dentro do intervalo min/max
    const clampedValue = Math.max(min, Math.min(max, numericValue));
    
    onSave(clampedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(String(value));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-12 text-center bg-gray-900 text-white rounded text-xs font-mono p-1 border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${className}`}
        min={min}
        max={max}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`px-2 py-1 bg-gray-700 rounded text-xs font-mono cursor-pointer hover:bg-gray-600 transition-colors ${className}`}
    >
      {value}
    </span>
  );
};

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  colorClass: string;
}> = ({ label, value, min, max, onValueChange, colorClass }) => {
  const bgClass = `accent-${colorClass}-400`;
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center text-sm">
        <label className="font-medium text-gray-300">{label}</label>
        <EditableValue 
            value={value}
            min={min}
            max={max}
            onSave={onValueChange}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onValueChange(parseInt(e.target.value))}
        className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ${bgClass}`}
      />
    </div>
  );
};


export const Controls: React.FC<ControlsProps> = ({
    atomState, 
    shellConfig, 
    onProtonChange, 
    onNeutronChange, 
    onElectronChange,
    showShellControls
}) => {
  return (
    <div className="space-y-4 p-2 rounded-lg bg-gray-800/70">
        <div className="p-2">
            <button 
                disabled={true}
                className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 9.414V12a1 1 0 102 0V9.414l.293.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
                </svg>
                <span>Simular Excitação</span>
            </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
          <div className="lg:col-span-2 md:col-span-4 col-span-2 grid grid-cols-2 gap-4">
              <Slider 
                  label="Prótons"
                  value={atomState.protons}
                  min={1}
                  max={118}
                  onValueChange={onProtonChange}
                  colorClass="red"
              />
              <Slider 
                  label="Nêutrons"
                  value={atomState.neutrons}
                  min={0}
                  max={177}
                  onValueChange={onNeutronChange}
                  colorClass="green"
              />
          </div>
          
          {showShellControls && (
            <div className="lg:col-span-7 md:col-span-4 col-span-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {shellConfig.map((shell, index) => (
                <Slider
                  key={shell.name}
                  label={`Camada ${shell.name}`}
                  value={atomState.electrons[index]}
                  min={0}
                  max={shell.maxElectrons}
                  onValueChange={(value) => onElectronChange(index, value)}
                  colorClass="blue"
                />
              ))}
            </div>
          )}
        </div>
    </div>
  );
};