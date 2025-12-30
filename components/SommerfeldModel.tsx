import React, { useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Nucleus } from './AtomModel';
import { AnimatedOrbit } from './animated/AnimatedOrbit';

// Define available subshells for each principal quantum number n
// k ranges from 1 to n
const getSubshellConfig = (n: number, k: number) => {
  const tiltIndex = (n * 10 + k) % 13;
  const tilts = [
    new THREE.Euler(0, 0, 0),
    new THREE.Euler(Math.PI / 2, 0, 0),
    new THREE.Euler(0, Math.PI / 4, 0),
    new THREE.Euler(-Math.PI / 4, 0, 0),
    new THREE.Euler(Math.PI / 4, Math.PI / 4, 0),
    new THREE.Euler(-Math.PI / 4, -Math.PI / 4, 0),
    new THREE.Euler(0, -Math.PI / 4, 0),
    new THREE.Euler(Math.PI / 3, -Math.PI / 3, 0),
    new THREE.Euler(-Math.PI / 3, Math.PI / 3, 0),
    new THREE.Euler(0, 0, Math.PI / 2),
    new THREE.Euler(Math.PI / 6, 0, Math.PI / 6),
    new THREE.Euler(0, Math.PI / 6, -Math.PI / 6),
    new THREE.Euler(Math.PI / 4, 0, -Math.PI / 4),
  ];
  return tilts[tiltIndex];
};

interface SommerfeldModelProps {
  protons: number;
  neutrons: number;
  electrons: number[]; // Array of electron counts per shell (K, L, M...)
  orbitThickness?: number;
}

export const SommerfeldModel: React.FC<SommerfeldModelProps> = ({ protons, neutrons, electrons: electronShells, orbitThickness = 2 }) => {
  const activeOrbits = useMemo(() => {
    const orbits: { n: number; k: number; count: number; tilt: THREE.Euler; radiusX: number; radiusZ: number; focus: number; speed: number }[] = [];

    // Calculate approximate nucleus radius based on particle count
    const totalNucleons = protons + neutrons;
    const nucleusRadius = Math.pow(totalNucleons, 1 / 3) * 0.4 * 1.2;
    const padding = 0.8; // Safety distance
    const minSafeDistance = nucleusRadius + padding;

    // 1. Determine Base Scale
    // The base scale is driven ONLY by the need for the innermost circular orbit (n=1, k=1) to clear the nucleus.
    // This minimizes the "Zoom" effect, as we don't scale up for elliptical orbits (we round them instead).
    // r = a = baseScale * 1. We need r > minSafeDistance.
    const minBaseScale = minSafeDistance;
    const baseScale = Math.max(2.0, minBaseScale);

    electronShells.forEach((count, index) => {
      if (count === 0) return;
      const n = index + 1;

      let remainingElectrons = count;

      for (let k = 1; k <= n; k++) {
        if (remainingElectrons <= 0) break;

        const capacity = 2 * (2 * k - 1);
        const subshellElectrons = Math.min(remainingElectrons, capacity);

        if (subshellElectrons > 0) {
          const tilt = getSubshellConfig(n, k);
          // eslint-disable-next-line react-hooks/purity
          const speed = 0.2 + Math.random() * 0.2;

          // Calculate dimensions
          const radiusX = baseScale * n; // Semi-major axis (a)

          // Calculate natural eccentricity from k/n
          // b = a * (k/n)
          // e = sqrt(1 - (b/a)^2) = sqrt(1 - (k/n)^2)
          // Periapsis (closest approach) = a * (1 - e)

          // We need Periapsis >= minSafeDistance
          // a * (1 - e_effective) >= minSafeDistance
          // 1 - e_effective >= minSafeDistance / a
          // e_effective <= 1 - (minSafeDistance / a)

          const maxAllowedEccentricity = Math.max(0, 1 - (minSafeDistance / radiusX));

          // Natural eccentricity
          const ratio = k / n;
          const naturalEccentricity = Math.sqrt(1 - ratio * ratio);

          // Clamp eccentricity to be safe
          const effectiveEccentricity = Math.min(naturalEccentricity, maxAllowedEccentricity);

          // Recalculate b (radiusZ) from effective eccentricity
          // e = sqrt(1 - (b/a)^2) -> e^2 = 1 - (b/a)^2 -> (b/a)^2 = 1 - e^2 -> b = a * sqrt(1 - e^2)
          const radiusZ = radiusX * Math.sqrt(1 - effectiveEccentricity * effectiveEccentricity);

          const focus = Math.sqrt(radiusX * radiusX - radiusZ * radiusZ);

          orbits.push({
            n,
            k,
            count: subshellElectrons,
            tilt,
            radiusX,
            radiusZ,
            focus,
            speed
          });

          remainingElectrons -= subshellElectrons;
        }
      }
    });

    return orbits;
  }, [electronShells, protons, neutrons]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[20, 20, 20]} intensity={1.5} />
      <pointLight position={[-20, -20, -20]} intensity={1} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      <group>
        <Nucleus protons={protons} neutrons={neutrons} />
        {activeOrbits.map((orbit, i) => (
          <AnimatedOrbit
            key={`${orbit.n}-${orbit.k}-${i}`}
            tilt={orbit.tilt}
            radiusX={orbit.radiusX}
            radiusZ={orbit.radiusZ}
            speed={orbit.speed}
            thickness={orbitThickness}
            focus={orbit.focus}
            electronCount={orbit.count}
          />
        ))}
      </group>
    </>
  );
};