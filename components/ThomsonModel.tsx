import React, { useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
import { COLORS } from '../constants';

const PARTICLE_RADIUS = 0.5;
const POSITIVE_SPHERE_RADIUS = 5;

// --- Memoized Geometries and Materials ---
const positiveSphereGeometry = new THREE.SphereGeometry(POSITIVE_SPHERE_RADIUS, 128, 128);
const positiveSphereMaterial = new THREE.MeshPhysicalMaterial({
    color: COLORS.orbit,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.95,
    ior: 1.5,
    thickness: 0.5,
    transparent: true,
    opacity: 0.3,
});
const chargeGeometry = new THREE.CircleGeometry(PARTICLE_RADIUS, 32);
const negativeMaterial = new THREE.MeshBasicMaterial({ color: COLORS.electron, side: THREE.DoubleSide });
const positiveMaterial = new THREE.MeshBasicMaterial({ color: COLORS.proton, side: THREE.DoubleSide });

interface ThomsonModelProps {
  numCharges: number;
}

export const ThomsonModel: React.FC<ThomsonModelProps> = ({ numCharges }) => {
  const particles = useMemo(() => {
    const arr: { type: 'positive' | 'negative'; pos: THREE.Vector3 }[] = [];
    const samples = numCharges * 2;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2; // y from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;
        
        const surfacePoint = new THREE.Vector3(x, y, z).multiplyScalar(POSITIVE_SPHERE_RADIUS);
        const normal = surfacePoint.clone().normalize();
        const finalPosition = surfacePoint.add(normal.multiplyScalar(PARTICLE_RADIUS));
        
        const type = i % 2 === 0 ? 'negative' : 'positive';
        arr.push({ type: type, pos: finalPosition });
    }
    return arr;
  }, [numCharges]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} intensity={1} />
      <directionalLight position={[10, 15, 10]} intensity={2.5} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <group>
        {/* "Pudim" Positivo - Efeito de Vidro */}
        <mesh geometry={positiveSphereGeometry} material={positiveSphereMaterial} />
        
        {/* Cargas */}
        {particles.map((p, i) => (
            <Billboard key={i} position={p.pos}>
                <mesh geometry={chargeGeometry} material={p.type === 'positive' ? positiveMaterial : negativeMaterial} />
                <Text fontSize={p.type === 'positive' ? 0.8 : 0.6} color={COLORS.text} anchorX="center" anchorY="middle" position-z={0.01}>
                    {p.type === 'positive' ? '+' : '-'}
                </Text>
            </Billboard>
        ))}
      </group>
    </>
  );
};