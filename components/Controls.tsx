import React, { useState, useEffect, useRef } from 'react';
import { AtomState, Shell } from '../types';
import { useTranslation } from 'react-i18next';

interface ControlsProps {
  atomState: AtomState;
  shellConfig: Shell[];
  onProtonChange: (value: number) => void;
  onNeutronChange: (value: number) => void;
  onElectronChange?: (shellIndex: number, value: number) => void;
  showShellControls: boolean;
  orbitThickness?: number;
  onOrbitThicknessChange?: (value: number) => void;
  showExcitationButton?: boolean;
  onSimulateExcitation?: () => void;
  showEffects?: boolean;
  onToggleEffects?: () => void;
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

  // Sync with props during render
  if (!isEditing && String(value) !== currentValue) {
    setCurrentValue(String(value));
  }

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
        aria-label="Edit value"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`px-2 py-1 bg-gray-700 rounded text-xs font-mono cursor-pointer hover:bg-gray-600 transition-colors ${className}`}
      role="button"
      aria-label={`Edit value: ${value}`}
      tabIndex={0}
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
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val)) onValueChange(val);
        }}
        className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ${bgClass}`}
        aria-label={`Adjust ${label}`}
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
  showShellControls,
  orbitThickness,
  onOrbitThicknessChange,
  showExcitationButton = false,
  onSimulateExcitation,
  showEffects,
  onToggleEffects
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 p-2 rounded-lg bg-gray-800/70">
      <div className="flex space-x-2">
        {showExcitationButton && (
          <div className="flex-1 p-2">
            <button
              onClick={onSimulateExcitation}
              disabled={!onSimulateExcitation}
              className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              aria-label={t('simulate_excitation')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 001.414 1.414L9 9.414V12a1 1 0 102 0V9.414l.293.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
              </svg>
              <span>{t('simulate_excitation')}</span>
            </button>
          </div>
        )}

        {onToggleEffects && (
          <div className="p-2">
            <button
              onClick={onToggleEffects}
              className={`h-full px-4 rounded-lg font-bold transition-colors duration-200 flex items-center justify-center ${showEffects ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
              title={showEffects ? "Disable Effects" : "Enable Effects"}
              aria-label="Toggle Visual Effects"
            >
              {showEffects ? '✨ ON' : '✨ OFF'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
        <div className="lg:col-span-2 md:col-span-4 col-span-2 grid grid-cols-2 gap-4">
          <Slider
            label={t('protons')}
            value={atomState.protons}
            min={1}
            max={118}
            onValueChange={onProtonChange}
            colorClass="red"
          />
          <Slider
            label={t('neutrons')}
            value={atomState.neutrons}
            min={0}
            max={177}
            onValueChange={onNeutronChange}
            colorClass="green"
          />
        </div>

        {showShellControls && onElectronChange && (
          <div className="lg:col-span-7 md:col-span-4 col-span-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {shellConfig.map((shell, index) => (
              <Slider
                key={shell.name}
                label={t('shell', { shellName: shell.name })}
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

      {orbitThickness !== undefined && onOrbitThicknessChange && (
        <div className="p-2 rounded-lg bg-gray-800/70">
          <div className="flex flex-col space-y-2 p-2">
            <Slider
              label={t('orbit_thickness')}
              value={orbitThickness}
              min={1}
              max={8}
              onValueChange={onOrbitThicknessChange}
              colorClass="indigo"
            />
          </div>
        </div>
      )}
    </div>
  );
};