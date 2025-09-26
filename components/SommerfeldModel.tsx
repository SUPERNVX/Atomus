import React, { useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Nucleus } from './AtomModel';
import { AnimatedOrbit } from './animated/AnimatedOrbit';

const orbits = [
  { n: 1, k: 1, tilt: new THREE.Euler(0, 0, 0) },
  { n: 2, k: 1, tilt: new THREE.Euler(Math.PI / 2, 0, 0) },
  { n: 2, k: 2, tilt: new THREE.Euler(0, Math.PI / 4, 0) },
  { n: 3, k: 1, tilt: new THREE.Euler(-Math.PI / 4, 0, 0) },
  { n: 3, k: 2, tilt: new THREE.Euler(Math.PI / 4, Math.PI / 4, 0) },
  { n: 3, k: 3, tilt: new THREE.Euler(-Math.PI / 4, -Math.PI / 4, 0) },
  { n: 4, k: 1, tilt: new THREE.Euler(0, -Math.PI / 4, 0) },
  { n: 4, k: 2, tilt: new THREE.Euler(Math.PI / 3, -Math.PI / 3, 0) },
  { n: 4, k: 3, tilt: new THREE.Euler(-Math.PI / 3, Math.PI / 3, 0) },
  { n: 4, k: 4, tilt: new THREE.Euler(0, 0, Math.PI / 2) },
];

interface SommerfeldModelProps {
    protons: number;
    neutrons: number;
    electrons: number[];
}

interface SommerfeldModelProps {
    protons: number;
    neutrons: number;
    electrons: number[];
    orbitThickness?: number; // Optional orbit thickness parameter
}

export const SommerfeldModel: React.FC<SommerfeldModelProps> = ({ protons, neutrons, electrons: electronShells, orbitThickness = 2 }) => {
    const electrons = useMemo(() => {
        const totalElectrons = electronShells.reduce((acc, curr) => acc + curr, 0);
        const arr = [];
        const baseRadius = 2;
        for (let i = 0; i < totalElectrons; i++) {
            const orbitData = orbits[i % orbits.length];
            const speed = 0.2 + Math.random() * 0.3;
            const radiusX = baseRadius * orbitData.n;
            const radiusZ = baseRadius * orbitData.k;
            const focus = Math.sqrt(radiusX*radiusX - radiusZ*radiusZ);
            arr.push({ ...orbitData, speed, radiusX, radiusZ, focus });
        }
        return arr;
    }, [electronShells]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, -20]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <group>
        <Nucleus protons={protons} neutrons={neutrons} />
        {electrons.map((e, i) => (
            <AnimatedOrbit key={i} tilt={e.tilt} radiusX={e.radiusX} radiusZ={e.radiusZ} speed={e.speed} thickness={orbitThickness} focus={e.focus} />
        ))}
      </group>
    </>
  );
};