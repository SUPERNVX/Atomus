import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../../constants';
import { Photon } from './Photon';

interface ExcitedElectronProps {
    startRadius: number;
    endRadius: number;
    angle: number; // Starting angle on the orbit
    sourceSpeed: number;
    targetSpeed: number;
    onComplete: () => void;
}

type AnimationPhase = 'charging' | 'jumping' | 'waiting' | 'returning' | 'finished';

export const ExcitedElectron: React.FC<ExcitedElectronProps> = ({
    startRadius,
    endRadius,
    angle,
    sourceSpeed,
    targetSpeed,
    onComplete
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [phase, setPhase] = useState<AnimationPhase>('charging');
    const [photon, setPhoton] = useState<{ active: boolean; position: THREE.Vector3; direction: THREE.Vector3 } | null>(null);
    const { clock } = useThree();

    // Capture the global time when this component mounts to sync with the main shell rotation
    const startTime = useRef(clock.elapsedTime);

    // Create material instance once
    const electronMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color('#00FFFF'), // Pure Cyan
            emissive: new THREE.Color('#00FFFF'),
            emissiveIntensity: 10, // High intensity for bloom
            toneMapped: false // "Japan 90s" neon look
        });
    }, []);

    // State for animation timing
    const state = useRef({
        time: 0, // Time within current phase
        totalTime: 0, // Total lifetime of the simulation

        // Position tracking
        currentAngle: 0, // Will be initialized in first frame
        currentRadius: startRadius,

        // Return phase helpers
        returnStartPos: new THREE.Vector3(),

        // Colors
        targetColor: new THREE.Color('#00FFFF'), // Neon Cyan
        baseColor: new THREE.Color(COLORS.electron),

        waitTimer: 3.0 // Fixed 3s wait
    });

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        state.current.time += delta;
        state.current.totalTime += delta;

        // Calculate global time to sync with the rotating shell
        const globalTime = startTime.current + state.current.totalTime;

        // Calculate where the "slot" (original electron position) is right now.
        // Syncs with AtomModel's rotation.y += delta * speed (which visually moves CW in Z due to Three.js coords)
        const slotAngle = angle - globalTime * sourceSpeed;

        const slotX = Math.cos(slotAngle) * startRadius;
        const slotZ = Math.sin(slotAngle) * startRadius;
        const slotPos = new THREE.Vector3(slotX, 0, slotZ);

        // Initialize currentAngle on first frame if needed
        if (state.current.totalTime <= delta) {
            state.current.currentAngle = slotAngle;
        }

        switch (phase) {
            case 'charging':
                // Stick to the slot
                meshRef.current.position.copy(slotPos);
                state.current.currentAngle = slotAngle;

                // Pulse/Charge effect
                if (state.current.time < 1.0) {
                    // Keep the high intensity neon look
                    const t = state.current.time;
                    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
                    // Pulse intensity
                    mat.emissiveIntensity = 10 + Math.sin(t * 20) * 5;
                } else {
                    setPhase('jumping');
                    state.current.time = 0;
                }
                break;

            case 'jumping':
                // Move from Inner Shell to Outer Shell
                if (state.current.time < 0.5) {
                    const t = state.current.time / 0.5;
                    const ease = 1 - Math.pow(1 - t, 3); // Ease out cubic

                    state.current.currentRadius = startRadius + (endRadius - startRadius) * ease;

                    // Keep rotating at source speed during jump (SUBTRACTING)
                    state.current.currentAngle -= delta * sourceSpeed;

                    const x = Math.cos(state.current.currentAngle) * state.current.currentRadius;
                    const z = Math.sin(state.current.currentAngle) * state.current.currentRadius;
                    meshRef.current.position.set(x, 0, z);
                } else {
                    state.current.currentRadius = endRadius;
                    setPhase('waiting');
                    state.current.time = 0;
                }
                break;

            case 'waiting':
                // Orbit at target speed (SUBTRACTING)
                if (state.current.time < state.current.waitTimer) {
                    state.current.currentAngle -= delta * targetSpeed;
                    const x = Math.cos(state.current.currentAngle) * endRadius;
                    const z = Math.sin(state.current.currentAngle) * endRadius;
                    meshRef.current.position.set(x, 0, z);
                } else {
                    setPhase('returning');
                    state.current.time = 0;
                    // Capture start position for the return lerp
                    state.current.returnStartPos.copy(meshRef.current.position);
                }
                break;

            case 'returning':
                // Smoothly fly back to the moving slot
                if (state.current.time < 1.0) { // 1 second return time
                    const t = state.current.time / 1.0;
                    const ease = t * t * (3 - 2 * t); // Smoothstep

                    // Lerp from where we started returning -> where the slot is NOW
                    meshRef.current.position.lerpVectors(state.current.returnStartPos, slotPos, ease);

                } else {
                    // Arrived!
                    meshRef.current.position.copy(slotPos);

                    // Spawn Photon
                    const photonDir = slotPos.clone().normalize();
                    setPhoton({
                        active: true,
                        position: slotPos.clone(),
                        direction: photonDir
                    });

                    setPhase('finished');
                    state.current.time = 0;
                }
                break;

            case 'finished':
                // Stick to slot
                meshRef.current.position.copy(slotPos);

                // Fade color back
                if (state.current.time < 1.0) {
                    const t = state.current.time / 1.0;
                    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
                    // Lerp back to normal electron
                    mat.color.lerpColors(state.current.targetColor, state.current.baseColor, t);
                    mat.emissive.lerpColors(state.current.targetColor, state.current.baseColor, t);
                    mat.emissiveIntensity = THREE.MathUtils.lerp(10, 2, t);
                } else {
                    // Wait for photon (approx 2s)
                    if (state.current.time > 2.0) {
                        onComplete();
                    }
                }
                break;
        }
    });

    const handlePhotonComplete = () => {
        // Optional
    };

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.3, 16, 16]} />
                {/* Use primitive to avoid lint errors with intrinsic material props */}
                <primitive object={electronMaterial} attach="material" />
            </mesh>
            {photon && photon.active && (
                <Photon
                    startPosition={photon.position}
                    direction={photon.direction}
                    onComplete={handlePhotonComplete}
                />
            )}
        </group>
    );
};
