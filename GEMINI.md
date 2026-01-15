# Project Context: Atomus (3D Atomic Model Visualizer)

## Project Overview

**Atomus** is an interactive 3D web application designed to visualize the evolution of atomic theory. It serves as an educational tool, allowing users to explore various atomic models—from Dalton's solid sphere to modern Quantum Entanglement—through immersive 3D simulations.

**Key Features:**
*   **Interactive Models:** Users can manipulate parameters like proton/neutron counts and electron configurations.
*   **Historical Timeline:** Navigate through scientific history (Dalton, Thomson, Rutherford, Bohr, Sommerfeld, Schrödinger, Entanglement).
*   **Educational Tools:** Guided tours, key experiment information, and interactive simulations (e.g., electron excitation, qubit states).

**Tech Stack:**
*   **Framework:** React 19 (Functional Components, Hooks)
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **3D Graphics:** Three.js via `@react-three/fiber` and `@react-three/drei`
*   **Styling:** Tailwind CSS
*   **Routing:** `react-router-dom` (HashRouter)
*   **Internationalization:** `react-i18next`

## Architecture & Structure

The project follows a flat structure with source files located directly in the root directory (no `src/` folder).

### Directory Layout
*   `components/`: Contains React components for both UI overlays and 3D scene elements.
    *   `animated/`: Specialized animated 3D components (e.g., `Photon`, `AnimatedOrbit`).
*   `data/`: Static data files for elements (`elements.ts`) and model descriptions (`models.ts`).
*   `public/`: Static assets (images, locales for i18n).
*   `dist/`: Production build output.

### Key Files
*   `App.tsx`: The main application orchestrator. It handles:
    *   Global state (protons, neutrons, electrons).
    *   Routing (`/dalton`, `/bohr`, etc.).
    *   The main 3D `Canvas` and scene composition.
    *   UI overlays (Timeline, Controls, InfoPanel).
*   `index.tsx`: Application entry point. Mounts React to the DOM.
*   `GUIDELINES.md`: The "North Star" document for design philosophy, visual style, and specific implementation details for each atomic model.
*   `vite.config.ts`: Configuration for Vite, including the base path for GitHub Pages deployment.

## Building and Running

**Prerequisites:** Node.js (v16+) and npm.

### Development
Start the local development server:
```bash
npm install
npm run dev
```
The server typically runs on `http://localhost:3000`.

### Production Build
Create a production-ready build in the `dist/` directory:
```bash
npm run build
```

### Code Quality
Run linting and type checking (via script inferred):
```bash
npm run lint
```

## Development Conventions

### Coding Style
*   **React:** Use Functional Components with Hooks. Lazy load heavy 3D model components.
*   **Styling:** Use Tailwind CSS utility classes for UI components. For 3D objects, use standard Three.js materials configured via props.
*   **Types:** Strictly use TypeScript interfaces and types (defined in `types.ts` or locally).

### 3D Implementation (React Three Fiber)
*   **Declarative 3D:** Use `<Canvas>` as the root. Models are composed of standard meshes (`<mesh>`, `<sphereGeometry>`, `<meshStandardMaterial>`).
*   **Performance:** Use `Suspense` for loading.
*   **Animation:** Use `useFrame` for continuous animations (orbits, rotation).

### Project Specifics (from GUIDELINES.md)
*   **Color Palette:** Adhere to `constants.ts` for particle colors (Protons: Red, Neutrons: Green, Electrons: Blue).
*   **Philosophy:** Prioritize educational accuracy and visual appeal. Interfaces should be "Contextual" (show only relevant controls for the active model).
*   **Data Source:** Element data (atomic numbers, shells) comes from `data/elements.ts`.

## Deployment
The project is configured for GitHub Pages via the `base: '/Atomus/'` setting in `vite.config.ts`.
