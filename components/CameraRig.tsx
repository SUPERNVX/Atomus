import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
    active: boolean;
}

export const CameraRig: React.FC<CameraRigProps> = ({ active }) => {
    const { camera } = useThree();
    const angle = useRef(0);
    const radius = 35; // Distance from center
    const height = 15; // Height

    useFrame((_, delta) => {
        if (!active) return;

        angle.current += delta * 0.2; // Rotation speed

        const x = Math.cos(angle.current) * radius;
        const z = Math.sin(angle.current) * radius;

        // Smoothly interpolate camera position
        camera.position.lerp(new THREE.Vector3(x, height, z), 0.05);
        camera.lookAt(0, 0, 0);
    });

    return null;
};
