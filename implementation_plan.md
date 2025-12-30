# Lint Fix Plan

## Goal Description
Fix all eslint errors reported in the project to ensure a clean lint and build process, without losing any current functionality.

## User Review Required
> [!IMPORTANT]
> `AnimatedElectron.bak.tsx` is a backup file and contains many errors. I propose to ignore this file in `eslint.config.js` rather than fixing it, as it appears to be a backup.

## Proposed Changes

### Configuration
#### [MODIFY] [eslint.config.js](file:///c:/Users/Nicolas/projeto/Atomus/eslint.config.js)
- Add `dist` and `**/*.bak.tsx` to ignores.
- Configure `react/no-unknown-property` to ignore React Three Fiber properties (args, attach, geometry, material, position, rotation, intensity, object, visible, etc.).

### Components
#### [MODIFY] [App.tsx](file:///c:/Users/Nicolas/projeto/Atomus/App.tsx)
- Fix `no-explicit-any`: Replace `any` with specific types.
- Fix `react-hooks/set-state-in-effect`: Refactor state updates to avoid synchronous updates during render or justify/suppress if strictly necessary for synchronization (e.g. URL sync).

#### [MODIFY] [Controls.tsx](file:///c:/Users/Nicolas/projeto/Atomus/components/Controls.tsx)
- Fix `react-hooks/set-state-in-effect`: Refactor prop-to-state synchronization.

#### [MODIFY] [AtomModel.tsx](file:///c:/Users/Nicolas/projeto/Atomus/components/AtomModel.tsx)
- Fix `react-hooks/purity`: Wrap `Math.random()` usage in `useMemo`.

#### [MODIFY] [RutherfordModel.tsx](file:///c:/Users/Nicolas/projeto/Atomus/components/RutherfordModel.tsx)
- Fix `react-hooks/purity`: Wrap `Math.random()` usage in `useMemo`.
- Remove unused variables (`useRef`, `useFrame`, `COLORS`).

#### [MODIFY] [SchrodingerModel.tsx](file:///c:/Users/Nicolas/projeto/Atomus/components/SchrodingerModel.tsx)
- Fix `react-hooks/purity`: Wrap `Math.random()` usage in `useMemo`.
- Fix `react-hooks/set-state-in-effect`.
- Remove unused variables.

#### [MODIFY] [SommerfeldModel.tsx](file:///c:/Users/Nicolas/projeto/Atomus/components/SommerfeldModel.tsx)
- Fix `react-hooks/purity`: Wrap `Math.random()` usage in `useMemo`.

## Verification Plan

### Automated Tests
- Run `npm run lint` and ensure it returns exit code 0.
- Run `npm run build` and ensure it completes successfully.

### Manual Verification
- Since I cannot run the app in a browser to visually verify, I will rely on the build process and code analysis to ensure functionality is preserved.
