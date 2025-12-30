import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Text } from '@react-three/drei';
import { SHELL_CONFIG, COLORS } from '../constants';
import { ExcitedElectron } from './animated/ExcitedElectron';

interface AtomModelProps {
  protons: number;
  neutrons: number;
  electrons: number[];
  excitation?: {
    active: boolean;
    shellIndex: number;
    targetShellIndex: number;
    electronIndex: number; // Which electron in the shell is excited
    onComplete: () => void;
  };
  showEffects?: boolean;
  onParticleClick?: (type: 'proton' | 'neutron' | 'electron') => void;
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
const neonProtonMaterial = new THREE.MeshStandardMaterial({ color: COLORS.proton, emissive: COLORS.proton, emissiveIntensity: 1.5, toneMapped: false });
const neonNeutronMaterial = new THREE.MeshStandardMaterial({ color: COLORS.neutron, emissive: COLORS.neutron, emissiveIntensity: 1.5, toneMapped: false });

export const Nucleus: React.FC<{
  protons: number;
  neutrons: number;
  showEffects?: boolean;
  onParticleClick?: (type: 'proton' | 'neutron') => void;
}> = ({ protons, neutrons, showEffects, onParticleClick }) => {
  const protonRef = useRef<THREE.InstancedMesh>(null);
  const neutronRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Nucleus Pulse Animation
  useFrame((state) => {
    if (showEffects && groupRef.current) {
      const t = state.clock.elapsedTime;
      const scale = 1 + Math.sin(t * 2) * 0.02; // Subtle breathing
      groupRef.current.scale.set(scale, scale, scale);
    } else if (groupRef.current) {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  const { protonPositions, neutronPositions } = useMemo(() => {
    const totalParticles = protons + neutrons;
    const particleRadius = 0.4;
    const gap = 0.1; // Small gap between particles
    const minDistance = (particleRadius * 2) + gap;
    const positions: THREE.Vector3[] = [];

    // 1. Initialize positions randomly within a small sphere
    // Scale initial radius with number of particles to avoid extreme initial overlap
    const initialRadius = Math.pow(totalParticles, 1 / 3) * particleRadius * 1.5;

    for (let i = 0; i < totalParticles; i++) {
      // eslint-disable-next-line react-hooks/purity
      positions.push(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * initialRadius));
    }

    // 2. Relaxation iterations to resolve overlaps (Force-directed graph approach)
    const iterations = 50;
    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion
      for (let i = 0; i < totalParticles; i++) {
        for (let j = i + 1; j < totalParticles; j++) {
          const p1 = positions[i];
          const p2 = positions[j];
          const diff = new THREE.Vector3().subVectors(p1, p2);
          const dist = diff.length();

          if (dist < minDistance && dist > 0.001) {
            const overlap = minDistance - dist;
            const push = diff.normalize().multiplyScalar(overlap * 0.5);
            p1.add(push);
            p2.sub(push);
          } else if (dist <= 0.001) {
            // Handle exact overlap (rare but possible)
            p1.add(new THREE.Vector3(0.01, 0, 0));
          }
        }
      }

      // Attraction to center (to keep nucleus compact)
      for (let i = 0; i < totalParticles; i++) {
        positions[i].sub(positions[i].clone().multiplyScalar(0.05));
      }
    }

    // 3. Assign positions to protons and neutrons
    // Shuffle positions to mix protons and neutrons randomly
    // eslint-disable-next-line react-hooks/purity
    const shuffled = [...positions].sort(() => Math.random() - 0.5);

    return {
      protonPositions: shuffled.slice(0, protons),
      neutronPositions: shuffled.slice(protons)
    };
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
  }, [protonPositions, neutronPositions, showEffects]);

  const activeProtonMaterial = showEffects ? neonProtonMaterial : protonMaterial;
  const activeNeutronMaterial = showEffects ? neonNeutronMaterial : neutronMaterial;

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={protonRef}
        args={[nucleusParticleGeometry, activeProtonMaterial, protons]}
        onClick={(e) => { e.stopPropagation(); onParticleClick?.('proton'); }}
      />
      <instancedMesh
        ref={neutronRef}
        args={[nucleusParticleGeometry, activeNeutronMaterial, neutrons]}
        onClick={(e) => { e.stopPropagation(); onParticleClick?.('neutron'); }}
      />
    </group>
  );
};

// --- Optimized ElectronShell ---
const ringMaterial = new THREE.MeshBasicMaterial({ color: COLORS.orbit, side: THREE.DoubleSide, transparent: true });
const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const electronMaterial = new THREE.MeshStandardMaterial({ color: COLORS.electron, emissive: COLORS.electron, emissiveIntensity: 2 });

export const getShellSpeed = (index: number) => 0.5 / (index + 1);

const ElectronShell: React.FC<{
  count: number;
  shellIndex: number;
  skipElectronIndex?: number;
  onElectronClick?: () => void;
}> = ({ count, shellIndex, skipElectronIndex, onElectronClick }) => {
  const shell = SHELL_CONFIG[shellIndex];
  const groupRef = useRef<THREE.Group>(null);
  const instancesRef = useRef<THREE.InstancedMesh>(null);

  const ringGeometry = useMemo(() => new THREE.RingGeometry(shell.radius - 0.05, shell.radius + 0.05, 128), [shell.radius]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * getShellSpeed(shellIndex);
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
        if (i === skipElectronIndex) {
          dummy.scale.set(0, 0, 0); // Hide this electron
        } else {
          dummy.scale.set(1, 1, 1);
        }
        dummy.position.copy(pos);
        dummy.updateMatrix();
        instancesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      instancesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [electronPositions, skipElectronIndex]);

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} geometry={ringGeometry} material={ringMaterial} material-opacity={count > 0 ? 0.8 : 0.2} />

      {count > 0 && (
        <group ref={groupRef}>
          <instancedMesh
            ref={instancesRef}
            args={[electronGeometry, electronMaterial, count]}
            onClick={(e) => { e.stopPropagation(); onElectronClick?.(); }}
          />
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

export const AtomModel: React.FC<AtomModelProps> = ({ protons, neutrons, electrons, excitation, showEffects, onParticleClick }) => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, -20]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <group>
        <Nucleus
          protons={protons}
          neutrons={neutrons}
          showEffects={showEffects}
          onParticleClick={onParticleClick}
        />
        {SHELL_CONFIG.map((shell, index) => (
          <ElectronShell
            key={index}
            count={electrons[index] || 0}
            shellIndex={index}
            skipElectronIndex={excitation && excitation.shellIndex === index ? excitation.electronIndex : undefined}
            onElectronClick={() => onParticleClick?.('electron')}
          />
        ))}

        {excitation && excitation.active && (
          <ExcitedElectron
            startRadius={SHELL_CONFIG[excitation.shellIndex].radius}
            endRadius={SHELL_CONFIG[excitation.targetShellIndex].radius}
            angle={(excitation.electronIndex / electrons[excitation.shellIndex]) * Math.PI * 2}
            sourceSpeed={getShellSpeed(excitation.shellIndex)}
            targetSpeed={getShellSpeed(excitation.targetShellIndex)}
            onComplete={excitation.onComplete}
          />
        )}
      </group>
    </>
  );
};