import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { COLORS } from '../constants';
import { Nucleus } from './AtomModel';
import { AnimatedOrbit } from './animated/AnimatedOrbit';

const orbits = [
  // 3 Horizontal
  { tilt: new THREE.Euler(0, 0, 0), radiusX: 5, radiusZ: 5 },
  { tilt: new THREE.Euler(0, 0, 0), radiusX: 7, radiusZ: 7 },
  { tilt: new THREE.Euler(0, 0, 0), radiusX: 9, radiusZ: 9 },
  // 3 Vertical
  { tilt: new THREE.Euler(Math.PI / 2, 0, 0), radiusX: 5, radiusZ: 5 },
  { tilt: new THREE.Euler(Math.PI / 2, 0, 0), radiusX: 7, radiusZ: 7 },
  { tilt: new THREE.Euler(Math.PI / 2, 0, 0), radiusX: 9, radiusZ: 9 },
  // 2 Diagonal
  { tilt: new THREE.Euler(0, 0, Math.PI / 4), radiusX: 10, radiusZ: 6 },
  { tilt: new THREE.Euler(0, 0, -Math.PI / 4), radiusX: 10, radiusZ: 6 },
];

interface RutherfordModelProps {
  protons: number;
  neutrons: number;
  orbitThickness?: number; // Optional orbit thickness parameter
}

export const RutherfordModel: React.FC<RutherfordModelProps> = ({ protons, neutrons, orbitThickness = 2 }) => {
    const electrons = useMemo(() => {
        const arr = [];
        for (let i = 0; i < protons; i++) {
            const orbit = orbits[i % orbits.length];
            const speed = 0.5 + Math.random() * 0.5;
            arr.push({ ...orbit, speed });
        }
        return arr;
    }, [protons]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, -20]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <group>
        <Nucleus protons={protons} neutrons={neutrons} />
        {electrons.map((e, i) => (
            <AnimatedOrbit key={i} tilt={e.tilt} radiusX={e.radiusX} radiusZ={e.radiusZ} speed={e.speed} thickness={orbitThickness} />
        ))}
      </group>
    </>
  );
};