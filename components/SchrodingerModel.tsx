import React, { useMemo, useState, useRef, useEffect } from 'react';
import { OrbitControls, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Nucleus } from './AtomModel';
import { generateOrbitalPoints } from '../utils/quantumPhysics';
import { COLORS } from '../constants';
import * as THREE from 'three';

interface SchrodingerModelProps {
  protons: number;
  neutrons: number;
  n?: number;
  l?: number;
  m?: number;
  viewMode?: 'cloud' | 'measurement' | 'wave';
}

export const SchrodingerModel: React.FC<SchrodingerModelProps> = ({ 
  protons, 
  neutrons,
  n = 1,
  l = 0,
  m = 0,
  viewMode = 'cloud'
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [measuredPoints, setMeasuredPoints] = useState<Float32Array>(new Float32Array(0));
  
  // Static Cloud (12k points)
  const cloudPoints = useMemo(() => {
    const rawPoints = generateOrbitalPoints(n, l, m, 12000);
    const positions = new Float32Array(rawPoints.length * 3);
    for (let i = 0; i < rawPoints.length; i++) {
      positions[i * 3] = rawPoints[i].x;
      positions[i * 3 + 1] = rawPoints[i].y;
      positions[i * 3 + 2] = rawPoints[i].z;
    }
    return positions;
  }, [n, l, m]);

  // Reset measurements when orbital changes
  useEffect(() => {
    setMeasuredPoints(new Float32Array(0));
  }, [n, l, m, viewMode]);

  // Measurement simulation logic
  useEffect(() => {
    if (viewMode !== 'measurement') return;

    const interval = setInterval(() => {
      setMeasuredPoints(prev => {
        // Add 25 random points from the probability distribution every tick
        const newPoints = generateOrbitalPoints(n, l, m, 25);
        const next = new Float32Array(prev.length + newPoints.length * 3);
        next.set(prev);
        for (let i = 0; i < newPoints.length; i++) {
          const offset = prev.length + i * 3;
          next[offset] = newPoints[i].x;
          next[offset + 1] = newPoints[i].y;
          next[offset + 2] = newPoints[i].z;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [viewMode, n, l, m]);

  // Auto-reset measurements every 10 seconds to keep simulation dynamic
  useEffect(() => {
    if (viewMode !== 'measurement') return;

    const resetInterval = setInterval(() => {
      setMeasuredPoints(new Float32Array(0));
    }, 10000);

    return () => clearInterval(resetInterval);
  }, [viewMode]);

  // Wave Animation
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    if (viewMode === 'wave') {
      const time = state.clock.getElapsedTime();
      const s = 1 + Math.sin(time * 3) * 0.05;
      pointsRef.current.scale.set(s, s, s);
      // @ts-ignore
      pointsRef.current.material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
    } else {
      pointsRef.current.scale.set(1, 1, 1);
      if (viewMode === 'measurement') {
        // @ts-ignore
        pointsRef.current.material.opacity = 0.8;
      } else {
        // @ts-ignore
        pointsRef.current.material.opacity = 0.6;
      }
    }
  });

  const subshells = ['s', 'p', 'd', 'f'];
  const orbitalName = `${n}${subshells[l] || ''}`;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <group>
        <Nucleus protons={protons} neutrons={neutrons} />

        {/* The Cloud / Wave */}
        {(viewMode === 'cloud' || viewMode === 'wave') && (
          <points ref={pointsRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={cloudPoints.length / 3}
                array={cloudPoints}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.15}
              color={COLORS.electron}
              transparent
              opacity={0.6}
              // @ts-ignore
              blending={THREE.AdditiveBlending}
              // @ts-ignore
              depthWrite={false}
            />
          </points>
        )}

        {/* Measured Points (The "Particle" view) */}
        {viewMode === 'measurement' && (
          <group>
            {/* Background "Ghost" cloud to show where it *could* be */}
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={cloudPoints.length / 3}
                  array={cloudPoints}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.12}
                color={COLORS.electron}
                transparent
                opacity={0.15}
                depthWrite={false}
              />
            </points>

            {/* Actual detected points */}
            {measuredPoints.length > 0 && (
              <points>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={measuredPoints.length / 3}
                    array={measuredPoints}
                    itemSize={3}
                  />
                </bufferGeometry>
                <pointsMaterial
                  size={0.35}
                  color="#fff" // Brighter white for "detection"
                  transparent
                  opacity={0.9}
                  // @ts-ignore
                  blending={THREE.AdditiveBlending}
                />
              </points>
            )}
          </group>
        )}

        {/* 3D Label */}
        <Html position={[0, -n * 2 - 2, 0]} center>
          <div className="bg-gray-900/80 backdrop-blur text-white px-3 py-1 rounded border border-indigo-500/50 text-sm font-mono whitespace-nowrap select-none pointer-events-none">
            Orbital {orbitalName} (n={n}, l={l}, m={m})
          </div>
        </Html>
      </group>
    </>
  );
};