import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Controls } from './components/Controls';
import { Legend } from './components/Legend';
import { InfoPanel } from './components/InfoPanel';
import { Timeline } from './components/Timeline';
import { AtomState } from './types';
import { SHELL_CONFIG } from './constants';
import { useTranslation } from 'react-i18next';
import { ELEMENTS } from './data/elements';
import { ContextualInfo } from './components/ContextualInfo';
import { MODEL_DATA } from './data/models';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';
import { ParticleInfoPopup } from './components/ParticleInfoPopup';
import { CameraRig } from './components/CameraRig';

const AtomModel = lazy(() => import('./components/AtomModel').then(module => ({ default: module.AtomModel })));
const DaltonModel = lazy(() => import('./components/DaltonModel').then(module => ({ default: module.DaltonModel })));
const ThomsonModel = lazy(() => import('./components/ThomsonModel').then(module => ({ default: module.ThomsonModel })));
const RutherfordModel = lazy(() => import('./components/RutherfordModel').then(module => ({ default: module.RutherfordModel })));
const SommerfeldModel = lazy(() => import('./components/SommerfeldModel').then(module => ({ default: module.SommerfeldModel })));
const SchrodingerModel = lazy(() => import('./components/SchrodingerModel').then(module => ({ default: module.SchrodingerModel })));
const QuantumEntanglementModel = lazy(() => import('./components/QuantumEntanglementModel').then(module => ({ default: module.QuantumEntanglementModel })));

type ModelId = 'dalton' | 'thomson' | 'rutherford' | 'sommerfeld' | 'bohr' | 'schrodinger' | 'entanglement';

const VALID_MODELS: ModelId[] = ['dalton', 'thomson', 'rutherford', 'sommerfeld', 'bohr', 'schrodinger', 'entanglement'];

const App: React.FC = () => {
  const { t } = useTranslation();
  const [atomState, setAtomState] = useState<AtomState>({
    protons: 6,
    neutrons: 6,
    electrons: [2, 4, 0, 0, 0, 0, 0] as [number, number, number, number, number, number, number],
  });

  const [thomsonChargeCount, setThomsonChargeCount] = useState(8);
  const [orbitThickness, setOrbitThickness] = useState<number>(2);
  const [showEffects, setShowEffects] = useState(true);
  const [selectedParticle, setSelectedParticle] = useState<'proton' | 'neutron' | 'electron' | null>(null);
  const [tourActive, setTourActive] = useState(false);

  // Excitation State
  const [excitationState, setExcitationState] = useState<{
    active: boolean;
    shellIndex: number;
    targetShellIndex: number;
    electronIndex: number;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const rawModelId = location.pathname.slice(1).toLowerCase();
  const currentModel = VALID_MODELS.includes(rawModelId as ModelId) ? (rawModelId as ModelId) : 'dalton';

  useEffect(() => {
    if (!VALID_MODELS.includes(rawModelId as ModelId) && rawModelId !== '') {
      navigate('/dalton', { replace: true });
    }
  }, [rawModelId, navigate]);

  const handleModelChange = (modelId: ModelId) => {
    navigate(`/${modelId}`);
  };

  const handleThomsonChargeChange = (value: number) => {
    setThomsonChargeCount(value);
  };

  const handleElectronChange = (shellIndex: number, value: number) => {
    setAtomState(prevState => {
      const newElectrons = [...prevState.electrons] as [number, number, number, number, number, number, number];
      newElectrons[shellIndex] = value;
      return { ...prevState, electrons: newElectrons };
    });
  };

  const handleProtonChange = (value: number) => {
    const maxNeutrons = 177;
    const newNeutrons = Math.min(value, maxNeutrons);
    setAtomState(prevState => ({
      ...prevState,
      protons: value,
      neutrons: newNeutrons,
    }));
  };

  const handleNeutronChange = (value: number) => {
    setAtomState(prevState => ({ ...prevState, neutrons: value }));
  };

  const handleUpdateElectrons = () => {
    const element = ELEMENTS.find(el => el.atomicNumber === atomState.protons);
    if (element) {
      setAtomState(prevState => ({ ...prevState, electrons: element.electronShells as [number, number, number, number, number, number, number] }));
    }
  };

  const handleSimulateExcitation = () => {
    if (excitationState?.active) return; // Already running

    // Find occupied shells
    const occupiedShells = atomState.electrons
      .map((count, index) => ({ index, count }))
      .filter(s => s.count > 0);

    if (occupiedShells.length === 0) return;

    // Pick a random occupied shell
    const sourceShell = occupiedShells[Math.floor(Math.random() * occupiedShells.length)];

    // Pick a random electron in that shell
    const electronIndex = Math.floor(Math.random() * sourceShell.count);

    // Find a target shell (must be higher energy/index)
    let targetShellIndex = sourceShell.index + 1;
    if (targetShellIndex >= SHELL_CONFIG.length) {
      targetShellIndex = Math.min(targetShellIndex, SHELL_CONFIG.length - 1);
    }

    if (sourceShell.index === targetShellIndex) {
      return;
    }

    setExcitationState({
      active: true,
      shellIndex: sourceShell.index,
      targetShellIndex: targetShellIndex,
      electronIndex: electronIndex
    });
  };

  const handleExcitationComplete = () => {
    setExcitationState(null);
  };

  const totalElectrons = (currentModel === 'rutherford')
    ? atomState.protons
    : atomState.electrons.reduce((acc, curr) => acc + curr, 0);

  const [schrodingerMode, setSchrodingerMode] = useState<'position' | 'trajectory' | 'none'>('none');
  const [schrodingerActionId, setSchrodingerActionId] = useState(0);

  return (
    <main className="relative h-screen w-screen text-gray-200 flex flex-col overflow-hidden">
      <header className="absolute top-0 left-0 w-full p-4 z-10 flex justify-center items-start pointer-events-none">
        <div className="absolute top-20 left-4 flex flex-col space-y-4 pointer-events-auto">
          {(currentModel === 'bohr' || currentModel === 'sommerfeld' || currentModel === 'rutherford') && <Legend onUpdateElectrons={handleUpdateElectrons} />}
          {MODEL_DATA[currentModel] && <ContextualInfo data={MODEL_DATA[currentModel]} />}
        </div>
        <div className="pointer-events-auto">
          <Timeline currentModel={currentModel} onModelChange={handleModelChange} />
        </div>

        <div className="absolute top-4 right-4 pointer-events-auto flex flex-col items-end space-y-2">
          {(currentModel === 'bohr' || currentModel === 'sommerfeld' || currentModel === 'rutherford') && (
            <InfoPanel
              protons={atomState.protons}
              neutrons={atomState.neutrons}
              totalElectrons={totalElectrons}
            />
          )}

          {/* Camera Tour Button */}
          <button
            onClick={() => setTourActive(!tourActive)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${tourActive ? 'bg-amber-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {tourActive ? t('stop_tour') : t('start_tour')}
          </button>
        </div>
      </header>

      {/* Particle Info Popup */}
      {selectedParticle && (
        <ParticleInfoPopup
          type={selectedParticle}
          onClose={() => setSelectedParticle(null)}
        />
      )}

      <div className="flex-grow h-full w-full">
        <Suspense fallback={<div className="flex justify-center items-center h-full text-white">Carregando visualização...</div>}>
          <Canvas
            camera={{ position: [0, 15, 35], fov: 50 }}
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              failIfMajorPerformanceCaveat: true
            }}
          >
            <color attach="background" args={['#111828']} />

            <CameraRig active={tourActive} />

            <group visible={currentModel === 'bohr'}>
              <AtomModel
                {...atomState}
                excitation={excitationState ? { ...excitationState, onComplete: handleExcitationComplete } : undefined}
                showEffects={showEffects}
                onParticleClick={setSelectedParticle}
              />
            </group>
            <group visible={currentModel === 'schrodinger'}>
              <SchrodingerModel protons={atomState.protons} neutrons={atomState.neutrons} mode={schrodingerMode} actionId={schrodingerActionId} />
            </group>
            {currentModel === 'entanglement' && <QuantumEntanglementModel />}
            <group visible={currentModel === 'sommerfeld'}>
              <SommerfeldModel protons={atomState.protons} neutrons={atomState.neutrons} electrons={atomState.electrons} orbitThickness={orbitThickness} />
            </group>
            <group visible={currentModel === 'rutherford'}>
              <RutherfordModel protons={atomState.protons} neutrons={atomState.neutrons} orbitThickness={orbitThickness} />
            </group>
            <group visible={currentModel === 'thomson'}>
              <ThomsonModel numCharges={thomsonChargeCount} />
            </group>
            <group visible={currentModel === 'dalton'}>
              <DaltonModel />
            </group>

            {showEffects && (
              <EffectComposer>
                <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
              </EffectComposer>
            )}
          </Canvas>
        </Suspense>
      </div>

      <LanguageSwitcher />

      {/* Bohr Model Controls */}
      {currentModel === 'bohr' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto">
            <Controls
              atomState={atomState}
              shellConfig={SHELL_CONFIG}
              onProtonChange={handleProtonChange}
              onNeutronChange={handleNeutronChange}
              onElectronChange={handleElectronChange}
              showShellControls={true}
              showExcitationButton={true}
              onSimulateExcitation={handleSimulateExcitation}
              showEffects={showEffects}
              onToggleEffects={() => setShowEffects(!showEffects)}
            />
          </div>
        </footer>
      )}

      {/* Rutherford Model Controls */}
      {currentModel === 'rutherford' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto">
            <Controls
              atomState={atomState}
              shellConfig={SHELL_CONFIG}
              onProtonChange={handleProtonChange}
              onNeutronChange={handleNeutronChange}
              showShellControls={false}
              orbitThickness={orbitThickness}
              onOrbitThicknessChange={setOrbitThickness}
            />
          </div>
        </footer>
      )}

      {/* Sommerfeld Model Controls */}
      {currentModel === 'sommerfeld' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto">
            <Controls
              atomState={atomState}
              shellConfig={SHELL_CONFIG}
              onProtonChange={handleProtonChange}
              onNeutronChange={handleNeutronChange}
              onElectronChange={handleElectronChange}
              showShellControls={true}
              orbitThickness={orbitThickness}
              onOrbitThicknessChange={setOrbitThickness}
            />
          </div>
        </footer>
      )}

      {currentModel === 'schrodinger' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-md mx-auto p-2 rounded-lg bg-gray-800/70 flex space-x-2">
            <button onClick={() => { setSchrodingerMode('position'); setSchrodingerActionId(p => p + 1); }} className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200">{t('define_position')}</button>
            <button onClick={() => { setSchrodingerMode('trajectory'); setSchrodingerActionId(p => p + 1); }} className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors duration-200">{t('define_trajectory')}</button>
          </div>
        </footer>
      )}

      {currentModel === 'thomson' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-md mx-auto p-2 rounded-lg bg-gray-800/70">
            <div className="flex flex-col space-y-2 p-2">
              <div className="flex justify-between items-center text-sm">
                <label className="font-medium text-gray-300">{t('charge_pairs')}</label>
                <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{thomsonChargeCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={thomsonChargeCount}
                onChange={(e) => handleThomsonChargeChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>
          </div>
        </footer>
      )}
    </main>
  );
};

export default App;