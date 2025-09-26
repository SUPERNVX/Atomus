import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SHELL_CONFIG, COLORS } from '../constants';

const Particle: React.FC<{
  position: [number, number, number];
  color: string;
  size: number;
  material?: THREE.Material;
}> = ({ position, color, size, material }) => (
  <mesh position={position}>
    <sphereGeometry args={[size, 16, 16]} />
    {material ? (
      <primitive object={material} attach="material" />
    ) : (
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    )}
  </mesh>
);

const AnimatedElectron: React.FC<{ fromShell: number; toShell: number; onComplete: () => void; }> = ({ fromShell, toShell, onComplete }) => {
  const electronRef = useRef<THREE.Group>(null);
  const photonRef = useRef<THREE.Group>(null);

  const animationData = useRef({
    progress: 0,
    photonProgress: 0,
    photonDirection: new THREE.Vector3(),
  });

  const [phase, setPhase] = useState<'exciting' | 'relaxing' | 'done'>('exciting');
  const [showPhoton, setShowPhoton] = useState(false);

  const fromRadius = SHELL_CONFIG[fromShell].radius;
  const toRadius = SHELL_CONFIG[toShell].radius;

  const initialRotationY = useMemo(() => Math.random() * Math.PI * 2, []);

  const photonMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#fef08a',
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
  }), []);

  useEffect(() => {
    let timer: number;
    if (phase === 'relaxing') {
      timer = window.setTimeout(() => {
        animationData.current.progress = 0;
        animationData.current.photonProgress = 0;
        animationData.current.photonDirection.randomDirection();
        setShowPhoton(true);
      }, 500);
    } else if (phase === 'done') {
      timer = window.setTimeout(onComplete, 200);
    }
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  useFrame((state, delta) => {
    const { clock } = state;
    const animationSpeed = 0.9;

    if (!electronRef.current) return;

    if (phase === 'exciting') {
      animationData.current.progress = Math.min(1, animationData.current.progress + delta * animationSpeed);
      const { progress } = animationData.current;

      const currentRadius = fromRadius + (toRadius - fromRadius) * progress;
      const yOffset = Math.sin(progress * Math.PI) * (toRadius - fromRadius) * 0.6;
      electronRef.current.position.set(currentRadius, yOffset, 0);

      if (progress >= 1) {
        setPhase('relaxing');
      }
    } else if (phase === 'relaxing') {
      animationData.current.progress = Math.min(1, animationData.current.progress + delta * animationSpeed);
      const { progress } = animationData.current;

      const currentRadius = toRadius - (toRadius - fromRadius) * progress;
      const yOffset = Math.sin((1 - progress) * Math.PI) * (toRadius - fromRadius) * 0.6;
      electronRef.current.position.set(currentRadius, yOffset, 0);

      if (showPhoton && photonRef.current) {
        const photonSpeed = 1.2;
        animationData.current.photonProgress = Math.min(1, animationData.current.photonProgress + delta * photonSpeed);
        const pProgress = animationData.current.photonProgress;

        const startPosition = new THREE.Vector3(toRadius, 0, 0);
        const distance = pProgress * 15;
        const newPosition = startPosition.add(animationData.current.photonDirection.clone().multiplyScalar(distance));
        photonRef.current.position.copy(newPosition);

        const expansion = 1 + Math.sin(pProgress * Math.PI) * 0.6;
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 30) * 0.15;
        photonRef.current.scale.setScalar(expansion * pulse);

        photonMaterial.opacity = 1 - Math.pow(pProgress, 2);
      }

      if (animationData.current.progress >= 1 && animationData.current.photonProgress >= 1) {
        setPhase('done');
      }
    }
  });

  return (
    <group rotation-y={initialRotationY}>
      <group ref={electronRef} position={[fromRadius, 0, 0]}>
        <Particle position={[0, 0, 0]} color={COLORS.electron} size={0.25} />
      </group>
      {showPhoton && (
        <group ref={photonRef}>
          <Particle position={[0, 0, 0]} color="#fef08a" size={0.3} material={photonMaterial} />
        </group>
      )}
    </group>
  );
};