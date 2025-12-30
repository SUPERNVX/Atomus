import React, { useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls, Line, Cone } from '@react-three/drei';
import { COLORS } from '../constants';
import { Nucleus, Particle } from './AtomModel';

const CLOUD_RADIUS = 10;

const ProbabilityCloud: React.FC = () => {
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < 20000; i++) {
            // eslint-disable-next-line react-hooks/purity
            const pos = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * CLOUD_RADIUS);
            p.push(pos);
        }
        return p;
    }, []);

    return (
        <points>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flatMap(p => p.toArray()))}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial attach="material" size={0.05} color={COLORS.electron} transparent opacity={0.5} />
        </points>
    );
};

const TrajectoryArrow: React.FC<{ start: THREE.Vector3, end: THREE.Vector3 }> = ({ start, end }) => {
    const quaternion = useMemo(() => {
        const defaultDirection = new THREE.Vector3(0, 1, 0); // Default direction of Cone geometry
        const targetDirection = end.clone().sub(start).normalize();
        return new THREE.Quaternion().setFromUnitVectors(defaultDirection, targetDirection);
    }, [start, end]);

    return (
        <group>
            <Line points={[start, end]} color="#818cf8" lineWidth={2} />
            <Cone
                args={[0.2, 0.5, 8]} // radius, height, radialSegments
                position={end}
                quaternion={quaternion}
            >
                <meshBasicMaterial color="#818cf8" />
            </Cone>
        </group>
    );
};

interface SchrodingerModelProps {
    protons: number;
    neutrons: number;
    mode: 'position' | 'trajectory' | 'none';
    actionId: number;
}

const schrodingerElectronMaterial = new THREE.MeshStandardMaterial({ color: COLORS.electron, emissive: COLORS.electron, emissiveIntensity: 2 });

export const SchrodingerModel: React.FC<SchrodingerModelProps> = ({ protons, neutrons, mode, actionId }) => {
    const { position, trajectory } = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        actionId; // Trigger re-calculation
        const totalParticles = protons + neutrons;
        // Dynamic radius: Base 2.0 + factor of total particles. 
        // Example: Carbon (12) -> ~3.5. Uranium (238) -> ~8.0
        const nucleusRadius = Math.max(3.0, Math.pow(totalParticles, 1 / 3) * 1.5);

        if (mode === 'position') {
            let pos;
            do {
                // eslint-disable-next-line react-hooks/purity
                pos = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * CLOUD_RADIUS);
            } while (pos.length() < nucleusRadius);

            return { position: pos, trajectory: null };
        } else if (mode === 'trajectory') {
            let start: THREE.Vector3, end: THREE.Vector3, intersects = true;

            while (intersects) {
                // eslint-disable-next-line react-hooks/purity
                start = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * CLOUD_RADIUS);
                // eslint-disable-next-line react-hooks/purity
                end = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * CLOUD_RADIUS);

                const line = new THREE.Line3(start, end);
                const closestPoint = new THREE.Vector3();
                line.closestPointToPoint(new THREE.Vector3(0, 0, 0), true, closestPoint);

                if (closestPoint.length() >= nucleusRadius) {
                    intersects = false;
                }
            }

            return { position: null, trajectory: [start!, end!] as [THREE.Vector3, THREE.Vector3] };
        }
        return { position: null, trajectory: null };
    }, [mode, actionId, protons, neutrons]);

    return (
        <>
            <ambientLight intensity={0.8} />
            <pointLight position={[20, 20, 20]} intensity={1.5} />
            <pointLight position={[-20, -20, -20]} intensity={1} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

            <group>
                <Nucleus protons={protons} neutrons={neutrons} />
                <ProbabilityCloud />
                {position && <Particle position={position.toArray() as [number, number, number]} color={COLORS.electron} size={0.3} material={schrodingerElectronMaterial} />}
                {trajectory && <TrajectoryArrow start={trajectory[0]} end={trajectory[1]} />}
            </group>
        </>
    );
};