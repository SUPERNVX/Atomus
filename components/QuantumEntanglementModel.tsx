import React, { useState, useRef } from 'react';
import { Text, Sphere, Line, Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { BlochSphere } from './BlochSphere';

const STEP_INTRO = 0;
const STEP_CLASSICAL = 1;
const STEP_INDEPENDENT = 2;
const STEP_CREATION = 3;
const STEP_MEASUREMENT = 4;
const STEP_DISTANCE = 5;

/* eslint-disable react/no-unknown-property */

// Helper to render the side card
const SideCard = ({ children }: { children: React.ReactNode }) => (
  <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 pointer-events-auto">
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        className="flex flex-col items-center space-y-4 bg-gray-900/80 p-6 rounded-xl backdrop-blur-md border border-gray-700 shadow-2xl"
      >
        {children}
      </div>
    </div>
  </Html>
);

export const QuantumEntanglementModel: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(STEP_INTRO);
  
  // State for Classical Mode
  const [rotationA, setRotationA] = useState(0);
  // State for Quantum Mode
  const [thetaA, setThetaA] = useState(0);
  const [thetaB, setThetaB] = useState(0);

  // State for Creation/Measurement
  const [hadamardApplied, setHadamardApplied] = useState(false);
  const [cnotApplied, setCnotApplied] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<string | null>(null);

  // State for Distance
  const [distance, setDistance] = useState(6);

  const sphereARef = useRef<Mesh>(null);
  const sphereBRef = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (step === STEP_INTRO) {
       // Gentle float animation for intro
       if (sphereARef.current) sphereARef.current.position.y = Math.sin(time) * 0.5;
       if (sphereBRef.current) sphereBRef.current.position.y = Math.cos(time) * 0.5;
    } else if (step === STEP_CLASSICAL) {
       // Apply manual rotation to A
       if (sphereARef.current) {
          sphereARef.current.rotation.y = rotationA;
          sphereARef.current.rotation.x = rotationA * 0.5;
       }
       // B just floats idly
       if (sphereBRef.current) {
           sphereBRef.current.rotation.y = time * 0.2;
       }
    } else if (step === STEP_CREATION) {
       // Animate transition to superposition if H applied
       if (hadamardApplied && thetaA < Math.PI / 2) {
           setThetaA(prev => Math.min(prev + 0.05, Math.PI / 2));
       }
       // Animate B to match A if CNOT applied (rotating to -90 degrees to face A)
       if (cnotApplied && thetaB > -Math.PI / 2) {
           setThetaB(prev => Math.max(prev - 0.05, -Math.PI / 2));
       }
    }
  });

  const handleMeasure = (basis: 'Z' | 'X') => {
      // Simulate collapse
      const result = Math.random() > 0.5 ? 0 : 1; // 50/50 probability
      
      if (basis === 'Z') {
          const finalTheta = result === 0 ? 0 : Math.PI;
          setThetaA(finalTheta);
          setThetaB(finalTheta);
          setMeasurementResult(result === 0 ? '|00⟩' : '|11⟩');
      } else {
           setMeasurementResult(result === 0 ? '|+ +⟩' : '|- -⟩');
           // In X basis collapse, they point in the same direction or opposite 
           // For visual consistency with the "facing each other" state:
           setThetaA(Math.PI/2); 
           setThetaB(-Math.PI/2);
      }
  };

  const resetSimulation = () => {
      setStep(STEP_INTRO);
      setRotationA(0);
      setThetaA(0);
      setThetaB(0);
      setHadamardApplied(false);
      setCnotApplied(false);
      setMeasurementResult(null);
      setDistance(6);
  };

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* --- STEP 0: INTRODUCTION --- */}
      {step === STEP_INTRO && (
        <group>
             <Text
              position={[0, 4.5, 0]}
              fontSize={0.8}
              color="#bfdbfe"
              anchorX="center"
              anchorY="middle"
              maxWidth={10}
              textAlign="center"
            >
              {t('entanglement_intro_text')}
            </Text>

            <group position={[-4, 0, 0]}>
                <Sphere ref={sphereARef} args={[2.5, 32, 32]}>
                    <meshStandardMaterial color="#6366f1" emissive="#4338ca" emissiveIntensity={0.2} roughness={0.2} metalness={0.8} />
                </Sphere>
            </group>
            <group position={[4, 0, 0]}>
                <Sphere ref={sphereBRef} args={[2.5, 32, 32]}>
                    <meshStandardMaterial color="#ec4899" emissive="#be185d" emissiveIntensity={0.2} roughness={0.2} metalness={0.8} />
                </Sphere>
            </group>

            <SideCard>
                <button
                    onClick={() => setStep(STEP_CLASSICAL)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 whitespace-nowrap text-lg"
                >
                    {t('start_simulation')}
                </button>
            </SideCard>
        </group>
      )}

      {/* --- STEP 1: CLASSICAL CORRELATION --- */}
      {step === STEP_CLASSICAL && (
        <group>
            <Text
              position={[0, 4, 0]}
              fontSize={0.6}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {t('classical_correlation_title')}
            </Text>
            
            {/* Connection Line (Gray/Dull for classical) */}
             <Line
                points={[[-4, 0, 0], [4, 0, 0]]}
                color="#6b7280" // Gray-500
                lineWidth={2}
                dashed
                dashScale={10}
                dashSize={0.5}
                gapSize={0.5}
            />

            <group position={[-4, 0, 0]}>
                <Sphere ref={sphereARef} args={[2.5, 32, 32]}>
                     {/* Added a texture pattern or wireframe hint to make rotation visible */}
                    <meshStandardMaterial color="#94a3b8" wireframe={true} /> 
                </Sphere>
                 <Sphere args={[2.45, 32, 32]}>
                    <meshStandardMaterial color="#64748b" roughness={0.5} />
                </Sphere>
                <Text position={[0, -3.5, 0]} fontSize={0.4} color="#cbd5e1">
                    Particle A (Classical)
                </Text>
            </group>

            <group position={[4, 0, 0]}>
                <Sphere ref={sphereBRef} args={[2.5, 32, 32]}>
                    <meshStandardMaterial color="#94a3b8" wireframe={true} />
                </Sphere>
                 <Sphere args={[2.45, 32, 32]}>
                    <meshStandardMaterial color="#64748b" roughness={0.5} />
                </Sphere>
                <Text position={[0, -3.5, 0]} fontSize={0.4} color="#cbd5e1">
                    Particle B (Classical)
                </Text>
            </group>

            <SideCard>
                 <p className="text-gray-200 text-center text-sm">
                    {t('classical_correlation_desc')}
                </p>
                
                <div className="w-full">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        {t('rotate_particle_a')}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="6.28"
                        step="0.01"
                        value={rotationA}
                        onChange={(e) => setRotationA(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                <button
                    onClick={() => setStep(STEP_INDEPENDENT)}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded transition-colors border border-gray-600 w-full"
                >
                    {t('next_step')}
                </button>
            </SideCard>
        </group>
      )}

      {/* --- STEP 2: INDEPENDENT QUANTUM STATES --- */}
      {step === STEP_INDEPENDENT && (
        <group>
             <Text
              position={[0, 4, 0]}
              fontSize={0.6}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {t('independent_quantum_title')}
            </Text>

            <BlochSphere 
                position={[-4, 0, 0]} 
                rotationState={{ theta: thetaA, phi: 0 }} 
                label="Qubit A" 
                color="#6366f1"
            />

            <BlochSphere 
                position={[4, 0, 0]} 
                rotationState={{ theta: thetaB, phi: 0 }} 
                label="Qubit B" 
                color="#ec4899"
            />

            <SideCard>
                <p className="text-gray-200 text-center text-sm">
                    {t('independent_quantum_desc')}
                </p>
                
                <div className="w-full">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        {t('rotate_vector_a')}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="3.14"
                        step="0.01"
                        value={thetaA}
                        onChange={(e) => setThetaA(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                <button
                    onClick={() => {
                            setStep(STEP_CREATION);
                            setThetaA(0); // Reset for creation
                            setThetaB(0);
                    }} 
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded transition-colors border border-gray-600 w-full"
                >
                    {t('next_step')}
                </button>
            </SideCard>
        </group>
      )}

      {/* --- STEP 3: CREATING ENTANGLEMENT --- */}
      {step === STEP_CREATION && (
        <group>
             <Text
              position={[0, 4, 0]}
              fontSize={0.6}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {t('creating_entanglement_title')}
            </Text>

            <BlochSphere 
                position={[-4, 0, 0]} 
                rotationState={{ theta: thetaA, phi: 0 }} 
                label="Qubit A" 
                color="#6366f1"
            />

            <BlochSphere 
                position={[4, 0, 0]} 
                rotationState={{ theta: thetaB, phi: 0 }} 
                label="Qubit B" 
                color="#ec4899"
            />
            
            {/* Connection Link (Appears after CNOT) */}
            {cnotApplied && (
                 <Line
                    points={[[-4, 0, 0], [4, 0, 0]]}
                    color="#fbbf24" // Amber/Gold for entanglement
                    lineWidth={3}
                    dashed={false}
                />
            )}

            <SideCard>
                <p className="text-gray-200 text-center text-sm">
                    {t('creating_entanglement_desc')}
                </p>
                
                <div className="flex flex-col space-y-2 w-full">
                    {!hadamardApplied && (
                        <button
                            onClick={() => setHadamardApplied(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 px-4 rounded w-full"
                        >
                            {t('apply_hadamard')}
                        </button>
                    )}
                    {hadamardApplied && !cnotApplied && (
                            <button
                            onClick={() => setCnotApplied(true)}
                            className="bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold py-2 px-4 rounded w-full"
                        >
                            {t('apply_cnot')}
                        </button>
                    )}
                    {cnotApplied && (
                        <button
                            onClick={() => {
                                setStep(STEP_MEASUREMENT);
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2 px-4 rounded animate-pulse w-full"
                        >
                            {t('next_step')}
                        </button>
                    )}
                </div>
            </SideCard>
        </group>
      )}

      {/* --- STEP 4: MEASUREMENT --- */}
      {step === STEP_MEASUREMENT && (
        <group>
             <Text
              position={[0, 4, 0]}
              fontSize={0.6}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {measurementResult ? t('collapsed_state', { state: measurementResult }) : t('measurement_title')}
            </Text>

            <BlochSphere 
                position={[-4, 0, 0]} 
                rotationState={{ theta: thetaA, phi: 0 }} 
                label="Qubit A" 
                color={measurementResult ? "#fbbf24" : "#6366f1"}
            />

            <BlochSphere 
                position={[4, 0, 0]} 
                rotationState={{ theta: thetaB, phi: 0 }} 
                label="Qubit B" 
                color={measurementResult ? "#fbbf24" : "#ec4899"}
            />

             <Line
                points={[[-4, 0, 0], [4, 0, 0]]}
                color={measurementResult ? "#ef4444" : "#fbbf24"} // Red if broken/measured, Gold if entangled
                lineWidth={measurementResult ? 1 : 3}
                dashed={!!measurementResult}
                dashScale={5}
            />

            <SideCard>
                <p className="text-gray-200 text-center text-sm">
                    {t('measurement_desc')}
                </p>
                
                {!measurementResult ? (
                    <div className="flex space-x-2 w-full">
                        <button
                            onClick={() => handleMeasure('Z')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded w-full"
                        >
                            {t('measure_z')}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2 w-full">
                            <button
                            onClick={() => {
                                setStep(STEP_DISTANCE);
                                setMeasurementResult(null); // Reset measurement but keep entanglement concept implied (re-prepare state)
                                setThetaA(Math.PI/2); // Re-superpose for the new experiment
                                setThetaB(-Math.PI/2);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 px-4 rounded w-full"
                        >
                            {t('next_step')}
                        </button>
                            <button
                            onClick={resetSimulation}
                            className="bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold py-2 px-4 rounded w-full"
                        >
                            {t('reset')}
                        </button>
                    </div>
                )}
            </SideCard>
        </group>
      )}

      {/* --- STEP 5: DISTANCE EXPERIMENT --- */}
      {step === STEP_DISTANCE && (
        <group>
             <Text
              position={[0, 4, 0]}
              fontSize={0.6}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {measurementResult ? t('collapsed_state', { state: measurementResult }) : t('distance_experiment_title')}
            </Text>

            <BlochSphere 
                position={[-distance, 0, 0]} 
                rotationState={{ theta: thetaA, phi: 0 }} 
                label="Qubit A" 
                color={measurementResult ? "#fbbf24" : "#6366f1"}
            />

            <BlochSphere 
                position={[distance, 0, 0]} 
                rotationState={{ theta: thetaB, phi: 0 }} 
                label="Qubit B" 
                color={measurementResult ? "#fbbf24" : "#ec4899"}
            />

             <Line
                points={[[-distance, 0, 0], [distance, 0, 0]]}
                color={measurementResult ? "#ef4444" : "#fbbf24"}
                lineWidth={measurementResult ? 1 : 3}
                dashed={!!measurementResult}
                dashScale={5}
            />

            <SideCard>
                <p className="text-gray-200 text-center text-sm">
                    {t('distance_experiment_desc')}
                </p>
                
                    <div className="w-full">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        {t('increase_distance')}
                    </label>
                    <input
                        type="range"
                        min="6"
                        max="12" 
                        step="0.01"
                        value={distance}
                        onChange={(e) => setDistance(parseFloat(e.target.value))}
                        disabled={!!measurementResult}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
                    />
                </div>

                {!measurementResult ? (
                    <div className="flex space-x-2 w-full">
                        <button
                            onClick={() => handleMeasure('Z')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded w-full"
                        >
                            {t('measure_at_distance')}
                        </button>
                    </div>
                ) : (
                        <button
                        onClick={resetSimulation}
                        className="bg-gray-600 hover:bg-gray-500 text-white text-sm font-bold py-2 px-4 rounded w-full"
                    >
                        {t('reset')}
                    </button>
                )}
            </SideCard>
        </group>
      )}

    </group>
  );
};