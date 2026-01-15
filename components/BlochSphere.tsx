import React, { useMemo } from 'react';
import { Sphere, Line, Text } from '@react-three/drei';
import { Vector3 } from 'three';

/* eslint-disable react/no-unknown-property */

interface BlochSphereProps {
  position?: [number, number, number];
  rotationState?: { theta: number; phi: number }; // Quantum state angles
  label?: string;
  color?: string;
  showVector?: boolean;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({
  position = [0, 0, 0],
  rotationState = { theta: 0, phi: 0 },
  label = '',
  color = '#6366f1',
  showVector = true,
}) => {
  
  // Calculate vector position from theta/phi
  const vectorEnd = useMemo(() => {
    const r = 2.5; // Radius matches the sphere
    const x = r * Math.sin(rotationState.theta) * Math.cos(rotationState.phi);
    const y = r * Math.cos(rotationState.theta);
    const z = r * Math.sin(rotationState.theta) * Math.sin(rotationState.phi);
    return new Vector3(x, y, z);
  }, [rotationState.theta, rotationState.phi]);

  return (
    <group position={position}>
      {/* Wireframe Sphere */}
      <Sphere args={[2.5, 32, 32]}>
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.3} />
      </Sphere>

      {/* Axes */}
      <Line points={[[0, -3, 0], [0, 3, 0]]} color="#475569" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[-3, 0, 0], [3, 0, 0]]} color="#475569" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[0, 0, -3], [0, 0, 3]]} color="#475569" lineWidth={1} transparent opacity={0.5} />

      {/* Labels */}
      <Text position={[0, 3.2, 0]} fontSize={0.4} color="#94a3b8">|0⟩</Text>
      <Text position={[0, -3.2, 0]} fontSize={0.4} color="#94a3b8">|1⟩</Text>
      
      {label && (
        <Text position={[0, -3.8, 0]} fontSize={0.5} color={color} fontWeight="bold">
          {label}
        </Text>
      )}

      {/* State Vector */}
      {showVector && (
        <group>
            <Line
                points={[[0, 0, 0], vectorEnd]}
                color={color}
                lineWidth={3}
            />
            {/* Arrow Tip */}
            <mesh position={vectorEnd} rotation={[0, 0, 0]} lookAt={new Vector3(0, 0, 0)}> 
                {/* Note: lookAt might need adjustments depending on orientation. 
                    Actually, let's just place a small sphere at the tip for simplicity/performance in this style */}
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
        </group>
      )}
    </group>
  );
};
