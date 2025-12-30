import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PhotonProps {
    startPosition: THREE.Vector3;
    direction: THREE.Vector3;
    onComplete: () => void;
}

export const Photon: React.FC<PhotonProps> = ({ startPosition, direction, onComplete }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const speed = 15; // Fast speed for light
    const lifetime = 2.0; // Seconds to live

    const photonMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color('#FFFF00'), // Yellow
            emissive: new THREE.Color('#FFFF00'),
            emissiveIntensity: 10,
            toneMapped: false
        });
    }, []);

    useFrame((_, delta) => {
        if (meshRef.current) {
            // Move photon
            meshRef.current.position.add(direction.clone().multiplyScalar(speed * delta));
        }
    });

    // We need state for time tracking to call onComplete correctly
    const time = useRef(0);
    useFrame((_, delta) => {
        time.current += delta;
        if (time.current > lifetime) {
            onComplete();
        }

        if (meshRef.current) {
            // Pulse effect
            const mat = meshRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 10 + Math.sin(time.current * 30) * 5;
        }
    });

    return (
        <mesh ref={meshRef} position={startPosition}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <primitive object={photonMaterial} attach="material" />
        </mesh>
    );
};
