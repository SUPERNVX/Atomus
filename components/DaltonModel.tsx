import React from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const daltonGeometry = new THREE.SphereGeometry(5, 64, 64);
const daltonMaterial = new THREE.MeshStandardMaterial({
  color: "#a1a1aa", // zinc-400
  roughness: 0.8,
  metalness: 0.1,
});

export const DaltonModel: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, -20]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <mesh geometry={daltonGeometry} material={daltonMaterial} />
    </>
  );
};
