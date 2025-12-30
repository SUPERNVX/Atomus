import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { COLORS } from '../../constants';

// Memoized objects for performance
const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const electronMaterial = new THREE.MeshStandardMaterial({ color: COLORS.electron, emissive: COLORS.electron, emissiveIntensity: 2 });

interface AnimatedOrbitProps {
  tilt: THREE.Euler;
  radiusX: number;
  radiusZ: number;
  speed: number;
  thickness?: number;
  focus?: number;
  electronCount?: number; // New prop for multiple electrons
}

export const AnimatedOrbit: React.FC<AnimatedOrbitProps> = ({
  tilt,
  radiusX,
  radiusZ,
  speed,
  thickness = 2,
  focus = 0,
  electronCount = 1
}) => {
  const electronsRef = useRef<THREE.InstancedMesh>(null);

  // Calculate points for the orbit line
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i <= 720; i++) {
      const rad = (i * Math.PI) / 360;
      p.push(new THREE.Vector3(Math.cos(rad) * radiusX + focus, 0, Math.sin(rad) * radiusZ));
    }
    return p;
  }, [radiusX, radiusZ, focus]);

  // Animate electrons
  useFrame(({ clock }) => {
    if (electronsRef.current) {
      const time = clock.getElapsedTime() * speed;
      const dummy = new THREE.Object3D();

      for (let i = 0; i < electronCount; i++) {
        // Distribute electrons evenly along the orbit
        const offset = (i / electronCount) * Math.PI * 2;
        const t = time + offset;

        dummy.position.x = Math.cos(t) * radiusX + focus;
        dummy.position.z = Math.sin(t) * radiusZ;
        dummy.updateMatrix();

        electronsRef.current.setMatrixAt(i, dummy.matrix);
      }
      electronsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group rotation={tilt}>
      <Line
        points={points}
        color={COLORS.orbit}
        lineWidth={thickness}
        transparent
        opacity={0.7}
        visible={thickness > 0}
      />
      <instancedMesh
        ref={electronsRef}
        args={[electronGeometry, electronMaterial, electronCount]}
      />
    </group>
  );
};