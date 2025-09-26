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
  thickness?: number; // Optional thickness parameter for orbit line width
  focus?: number; // Optional focus offset for Sommerfeld model
}

export const AnimatedOrbit: React.FC<AnimatedOrbitProps> = ({ tilt, radiusX, radiusZ, speed, thickness = 2, focus = 0 }) => {
  const electronRef = useRef<THREE.Mesh>(null);

  // Animate electron position along the orbit
  useFrame(({ clock }) => {
    if (electronRef.current) {
      const t = clock.getElapsedTime() * speed;
      electronRef.current.position.x = Math.cos(t) * radiusX + focus;
      electronRef.current.position.z = Math.sin(t) * radiusZ;
    }
  });

  // Calculate the points for the orbit line with higher resolution for better quality
  const points = useMemo(() => {
    const p = [];
    // Increase resolution from 360 to 720 points for smoother curves
    for (let i = 0; i <= 720; i++) {
      const rad = (i * Math.PI) / 360; // Double the resolution
      p.push(new THREE.Vector3(Math.cos(rad) * radiusX + focus, 0, Math.sin(rad) * radiusZ));
    }
    return p;
  }, [radiusX, radiusZ, focus]);

  return (
    <group rotation={tilt}>
      <Line 
        points={points} 
        color={COLORS.orbit} 
        lineWidth={thickness} 
        transparent 
        opacity={0.7} 
        visible={thickness > 0} // Only show if thickness is greater than 0
      />
      <mesh ref={electronRef} geometry={electronGeometry} material={electronMaterial} />
    </group>
  );
};