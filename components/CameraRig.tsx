import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
    active: boolean;
    currentModel?: string;
}

export const CameraRig: React.FC<CameraRigProps> = ({ active, currentModel }) => {
    const { camera } = useThree();
    const angle = useRef(0);
    const radius = 35; 
    const height = 15;
    
    const [isTransitioning, setIsTransitioning] = useState(false);
    const targetPos = useRef(new THREE.Vector3(0, 15, 35));

    // Detect model change and set new target
    useEffect(() => {
        if (active) return;

        let x = 0, y = 15, z = 35; // Default

        if (currentModel === 'schrodinger') {
            x = 35; y = 12; z = 0; // 90 degrees side view
        } else if (currentModel === 'entanglement') {
            x = 0; y = 5; z = 25;
        } else if (currentModel === 'thomson') {
            x = 0; y = 20; z = 30;
        }

        targetPos.current.set(x, y, z);
        setIsTransitioning(true);
    }, [currentModel, active]);

    useFrame((state, delta) => {
        // Mode 1: Auto-rotation Tour (Active)
        if (active) {
            angle.current += delta * 0.2;
            const x = Math.cos(angle.current) * radius;
            const z = Math.sin(angle.current) * radius;
            camera.position.lerp(new THREE.Vector3(x, height, z), 0.05);
            camera.lookAt(0, 0, 0);
            return;
        }

        // Mode 2: Transition to initial position (One-time)
        if (isTransitioning) {
            camera.position.lerp(targetPos.current, 0.05);
            camera.lookAt(0, 0, 0);

            // Stop transitioning when close enough to the target
            if (camera.position.distanceTo(targetPos.current) < 0.1) {
                setIsTransitioning(false);
            }
        }
    });

    return null;
};
