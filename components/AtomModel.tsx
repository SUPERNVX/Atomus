import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Text } from '@react-three/drei';
import { SHELL_CONFIG, COLORS } from '../constants';

interface AtomModelProps {
  protons: number;
  neutrons: number;
  electrons: number[];
}

// --- Optimized Particle (for use in other components like Schrodinger) ---
const genericParticleGeometry = new THREE.SphereGeometry(1, 16, 16); // Unit geometry

export const Particle: React.FC<{
  position: [number, number, number];
  color: string;
  size: number;
  material?: THREE.Material;
}> = ({ position, color, size, material }) => (
  <mesh position={position} geometry={genericParticleGeometry} scale={size}>
    {material ? (
      <primitive object={material} attach="material" />
    ) : (
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    )}
  </mesh>
);

// --- Optimized Nucleus ---
const nucleusParticleGeometry = new THREE.SphereGeometry(0.4, 16, 16);
const protonMaterial = new THREE.MeshStandardMaterial({ color: COLORS.proton, roughness: 0.5, metalness: 0.1 });
const neutronMaterial = new THREE.MeshStandardMaterial({ color: COLORS.neutron, roughness: 0.5, metalness: 0.1 });

export const Nucleus: React.FC<{ protons: number; neutrons: number }> = ({ protons, neutrons }) => {
  const protonRef = useRef<THREE.InstancedMesh>(null);
  const neutronRef = useRef<THREE.InstancedMesh>(null);

  const { protonPositions, neutronPositions } = useMemo(() => {
    const protonPos = [];
    const neutronPos = [];
    const radius = 1.5;
    for (let i = 0; i < protons; i++) {
        protonPos.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * radius));
    }
    for (let i = 0; i < neutrons; i++) {
        neutronPos.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * radius));
    }
    return { protonPositions: protonPos, neutronPositions: neutronPos };
  }, [protons, neutrons]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    if (protonRef.current) {
      protonPositions.forEach((pos, i) => {
        dummy.position.copy(pos);
        dummy.updateMatrix();
        protonRef.current!.setMatrixAt(i, dummy.matrix);
      });
      protonRef.current.instanceMatrix.needsUpdate = true;
    }
    if (neutronRef.current) {
      neutronPositions.forEach((pos, i) => {
        dummy.position.copy(pos);
        dummy.updateMatrix();
        neutronRef.current!.setMatrixAt(i, dummy.matrix);
      });
      neutronRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [protonPositions, neutronPositions]);

  return (
    <group>
      <instancedMesh ref={protonRef} args={[nucleusParticleGeometry, protonMaterial, protons]} />
      <instancedMesh ref={neutronRef} args={[nucleusParticleGeometry, neutronMaterial, neutrons]} />
    </group>
  );
};

// --- Optimized ElectronShell ---
const ringMaterial = new THREE.MeshBasicMaterial({ color: COLORS.orbit, side: THREE.DoubleSide, transparent: true });
const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const electronMaterial = new THREE.MeshStandardMaterial({ color: COLORS.electron, emissive: COLORS.electron, emissiveIntensity: 2 });

const ElectronShell: React.FC<{ count: number; shellIndex: number }> = ({ count, shellIndex }) => {
  const shell = SHELL_CONFIG[shellIndex];
  const groupRef = useRef<THREE.Group>(null);
  const instancesRef = useRef<THREE.InstancedMesh>(null);

  const ringGeometry = useMemo(() => new THREE.RingGeometry(shell.radius - 0.05, shell.radius + 0.05, 128), [shell.radius]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (0.5 / (shellIndex + 1));
    }
  });

  const electronPositions = useMemo(() => {
    const positions = [];
    if (count === 0) return positions;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions.push(new THREE.Vector3(Math.cos(angle) * shell.radius, 0, Math.sin(angle) * shell.radius));
    }
    return positions;
  }, [count, shell.radius]);

  useEffect(() => {
    if (instancesRef.current) {
      const dummy = new THREE.Object3D();
      electronPositions.forEach((pos, i) => {
        dummy.position.copy(pos);
        dummy.updateMatrix();
        instancesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      instancesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [electronPositions]);

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} geometry={ringGeometry} material={ringMaterial} material-opacity={count > 0 ? 0.8 : 0.2} />

      {count > 0 && (
        <group ref={groupRef}>
            <instancedMesh ref={instancesRef} args={[electronGeometry, electronMaterial, count]} />
        </group>
      )}

      <Text
        position={[shell.radius + 1, 0, 0]}
        fontSize={0.7}
        color={COLORS.text}
        anchorX="center"
        anchorY="middle"
      >
        {shell.name}
      </Text>
    </group>
  );
};

export const AtomModel: React.FC<AtomModelProps> = ({ protons, neutrons, electrons }) => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, -20]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <group>
        <Nucleus protons={protons} neutrons={neutrons} />
        {SHELL_CONFIG.map((shell, index) => (
          <ElectronShell key={index} count={electrons[index] || 0} shellIndex={index} />
        ))}
      </group>
    </>
  );
};