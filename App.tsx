import React, { useState, Suspense, useMemo, useCallback, useRef, useEffect, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Controls } from './components/Controls';
import { Legend } from './components/Legend';
import { InfoPanel } from './components/InfoPanel';
import { Timeline } from './components/Timeline';
import { AtomState } from './types';
import { SHELL_CONFIG } from './constants';
import { WebGLResourceManager } from './utils/webgl-utils';
import { useTranslation } from 'react-i18next';

import { ELEMENTS } from './data/elements';

import { ContextualInfo } from './components/ContextualInfo';
import { MODEL_DATA } from './data/models';
import { LanguageSwitcher } from './components/LanguageSwitcher';

const AtomModel = lazy(() => import('./components/AtomModel').then(module => ({ default: module.AtomModel })));
const DaltonModel = lazy(() => import('./components/DaltonModel').then(module => ({ default: module.DaltonModel })));
const ThomsonModel = lazy(() => import('./components/ThomsonModel').then(module => ({ default: module.ThomsonModel })));
const RutherfordModel = lazy(() => import('./components/RutherfordModel').then(module => ({ default: module.RutherfordModel })));
const SommerfeldModel = lazy(() => import('./components/SommerfeldModel').then(module => ({ default: module.SommerfeldModel })));
const SchrodingerModel = lazy(() => import('./components/SchrodingerModel').then(module => ({ default: module.SchrodingerModel })));

type ModelId = 'dalton' | 'thomson' | 'rutherford' | 'sommerfeld' | 'bohr' | 'schrodinger';

import { useLocation, useNavigate } from 'react-router-dom';

const VALID_MODELS: ModelId[] = ['dalton', 'thomson', 'rutherford', 'sommerfeld', 'bohr', 'schrodinger'];

const App: React.FC = () => {
  const { t } = useTranslation();
  const [atomState, setAtomState] = useState<AtomState>({
    protons: 6,
    neutrons: 6,
    electrons: [2, 4, 0, 0, 0, 0, 0] as [number, number, number, number, number, number, number],
  });

  const [currentModel, setCurrentModel] = useState<ModelId>('dalton');
  const [thomsonChargeCount, setThomsonChargeCount] = useState(8);
  const [canvasKey, setCanvasKey] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const [orbitThickness, setOrbitThickness] = useState<number>(2);
  const rendererRef = useRef<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const modelId = location.pathname.slice(1).toLowerCase() as ModelId;
    if (VALID_MODELS.includes(modelId)) {
      setCurrentModel(modelId);
    } else {
      // Redirect to a default model if the path is invalid
      navigate('/dalton', { replace: true });
    }
  }, [location, navigate]);

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
  
  const totalElectrons = (currentModel === 'rutherford') 
    ? atomState.protons 
    : atomState.electrons.reduce((acc, curr) => acc + curr, 0);

  // Handler para recuperação de contexto perdido
  const handleContextLoss = useCallback(() => {
    console.warn('WebGL context lost, attempting recovery...');
    setContextLost(true);
    // Força uma nova instância do Canvas
    setCanvasKey(prev => prev + 1);
    
    // Tenta recuperar após um pequeno delay
    setTimeout(() => {
      setContextLost(false);
    }, 100);
  }, []);

  const handleContextRestore = useCallback(() => {
    console.log('WebGL context restored successfully');
    setContextLost(false);
  }, []);

  // Configuração otimizada do Canvas
  const canvasConfig = useMemo(() => ({
    camera: { position: [0, 15, 35] as [number, number, number], fov: 50 },
    gl: {
      antialias: window.devicePixelRatio <= 1,
      alpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance" as const,
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      depth: true,
    },
    onCreated: ({ gl }: any) => {
      rendererRef.current = gl;
      
      // Usa o otimizador do WebGL Resource Manager
      WebGLResourceManager.optimizeRenderer(gl);
      
      // Configura handlers de context loss
      WebGLResourceManager.setupContextLossHandling(
        gl.domElement,
        handleContextLoss,
        handleContextRestore
      );
    }
  }), [handleContextLoss, handleContextRestore]);

  // Cleanup de recursos quando o componente for desmontado
  useEffect(() => {
    return () => {
      const manager = WebGLResourceManager.getInstance();
      manager.dispose();
      
      // Remove listeners se o renderer ainda existir
      if (rendererRef.current?.domElement) {
        const canvas = rendererRef.current.domElement;
        canvas.removeEventListener('webglcontextlost', handleContextLoss);
        canvas.removeEventListener('webglcontextrestored', handleContextRestore);
      }
    };
  }, [handleContextLoss, handleContextRestore]);

  const [schrodingerMode, setSchrodingerMode] = useState<'position' | 'trajectory' | 'none'>('none');
  const [schrodingerActionId, setSchrodingerActionId] = useState(0);

  return (
    <main className="relative h-screen w-screen text-gray-200 flex flex-col overflow-hidden">
      <header className="absolute top-0 left-0 w-full p-4 z-10 flex justify-center items-start">
         <div className="absolute top-20 left-4 flex flex-col space-y-4">
            {(currentModel === 'bohr' || currentModel === 'sommerfeld' || currentModel === 'rutherford') && <Legend onUpdateElectrons={handleUpdateElectrons} />}
            {MODEL_DATA[currentModel] && <ContextualInfo data={MODEL_DATA[currentModel]} />}
         </div>
         <Timeline currentModel={currentModel} onModelChange={handleModelChange} />

         <div className="absolute top-4 right-4">
           {(currentModel === 'bohr' || currentModel === 'sommerfeld' || currentModel === 'rutherford') && (
             <InfoPanel 
                protons={atomState.protons}
                neutrons={atomState.neutrons}
                totalElectrons={totalElectrons}
             />
           )}
         </div>
      </header>
      
      <div className="flex-grow h-full w-full">
        {contextLost && (
          <div className="absolute inset-0 bg-gray-900/80 z-50 flex justify-center items-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Recuperando contexto 3D...</p>
            </div>
          </div>
        )}
        <Suspense fallback={<div className="flex justify-center items-center h-full text-white">Carregando visualização...</div>}>
          <Canvas 
            key={canvasKey}
            {...canvasConfig}
          >
            <color attach="background" args={['#111828']} />
            <group visible={currentModel === 'bohr'}>
              <AtomModel 
                {...atomState} 
              />
            </group>
            <group visible={currentModel === 'schrodinger'}>
              <SchrodingerModel protons={atomState.protons} neutrons={atomState.neutrons} mode={schrodingerMode} actionId={schrodingerActionId} />
            </group>
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
              onStartSimulation={() => {}}
              simulationActive={false}
              showShellControls={true}
            />
          </div>
        </footer>
      )}

      {/* Rutherford Model Controls - Only proton/neutron sliders centered, no excitation button */}
      {currentModel === 'rutherford' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto space-y-4 p-2 rounded-lg bg-gray-800/70">
            {/* Centered Protons and Neutrons Sliders */}
            <div className="flex justify-center items-center space-x-4">
              {/* Protons Slider */}
              <div className="flex flex-col space-y-2 w-48">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-gray-300">Prótons</label>
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{atomState.protons}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="118"
                  value={atomState.protons}
                  onChange={(e) => handleProtonChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-400"
                />
              </div>
              
              {/* Neutrons Slider */}
              <div className="flex flex-col space-y-2 w-48">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-gray-300">Nêutrons</label>
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{atomState.neutrons}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="177"
                  value={atomState.neutrons}
                  onChange={(e) => handleNeutronChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-400"
                />
              </div>
            </div>
            
            {/* Orbit Thickness Slider */}
            <div className="p-2 rounded-lg bg-gray-800/70">
              <div className="flex flex-col space-y-2 p-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-gray-300">Espessura das Órbitas</label>
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{orbitThickness}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={orbitThickness}
                  onChange={(e) => setOrbitThickness(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Sommerfeld Model Controls - Proton/neutron sliders, energy shell sliders, and orbit thickness */}
      {currentModel === 'sommerfeld' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto space-y-4 p-2 rounded-lg bg-gray-800/70">
            {/* Protons, Neutrons, and Energy Shell Sliders */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
              <div className="lg:col-span-2 md:col-span-4 col-span-2 grid grid-cols-2 gap-4">
                {/* Protons Slider */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-medium text-gray-300">Prótons</label>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{atomState.protons}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="118"
                    value={atomState.protons}
                    onChange={(e) => handleProtonChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-400"
                  />
                </div>
                
                {/* Neutrons Slider */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <label className="font-medium text-gray-300">Nêutrons</label>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{atomState.neutrons}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="177"
                    value={atomState.neutrons}
                    onChange={(e) => handleNeutronChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-400"
                  />
                </div>
              </div>
              
              {/* Energy Shell Sliders */}
              <div className="lg:col-span-7 md:col-span-4 col-span-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {SHELL_CONFIG.map((shell, index) => (
                  <div key={shell.name} className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-medium text-gray-300">Camada {shell.name}</label>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{atomState.electrons[index] || 0}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={shell.maxElectrons}
                      value={atomState.electrons[index] || 0}
                      onChange={(e) => handleElectronChange(index, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Orbit Thickness Slider */}
            <div className="p-2 rounded-lg bg-gray-800/70">
              <div className="flex flex-col space-y-2 p-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-gray-300">Espessura das Órbitas</label>
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">{orbitThickness}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={orbitThickness}
                  onChange={(e) => setOrbitThickness(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </div>
          </div>
        </footer>
      )}

      {currentModel === 'schrodinger' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
            <div className="max-w-md mx-auto p-2 rounded-lg bg-gray-800/70 flex space-x-2">
                <button onClick={() => { setSchrodingerMode('position'); setSchrodingerActionId(p => p + 1); }} className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200">Definir Posição</button>
                <button onClick={() => { setSchrodingerMode('trajectory'); setSchrodingerActionId(p => p + 1); }} className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors duration-200">Definir Trajetória</button>
            </div>
        </footer>
        )}

      {currentModel === 'thomson' && (
        <footer className="absolute bottom-0 left-0 w-full p-4 bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="max-w-md mx-auto p-2 rounded-lg bg-gray-800/70">
            <div className="flex flex-col space-y-2 p-2">
                <div className="flex justify-between items-center text-sm">
                    <label className="font-medium text-gray-300">Pares de Carga (+/-)</label>
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