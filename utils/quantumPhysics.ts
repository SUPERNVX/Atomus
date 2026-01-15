// utils/quantumPhysics.ts

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Funções Matemáticas Auxiliares
 */

// Cache de fatoriais para performance
const factorialCache: number[] = [1, 1];
const factorial = (n: number): number => {
  if (n < 0) return 1;
  if (factorialCache[n]) return factorialCache[n];
  let res = factorialCache[factorialCache.length - 1];
  for (let i = factorialCache.length; i <= n; i++) {
    res *= i;
    factorialCache[i] = res;
  }
  return res;
};

/**
 * Polinômios de Laguerre Generalizados L_n^alpha(x)
 * Calculados via relação de recorrência.
 */
const generalizedLaguerre = (n: number, alpha: number, x: number): number => {
  if (n === 0) return 1;
  if (n === 1) return 1 + alpha - x;

  let L_k_minus_1 = 1; // L_0
  let L_k = 1 + alpha - x; // L_1

  for (let k = 1; k < n; k++) {
    const L_k_plus_1 = ((2 * k + 1 + alpha - x) * L_k - (k + alpha) * L_k_minus_1) / (k + 1);
    L_k_minus_1 = L_k;
    L_k = L_k_plus_1;
  }
  return L_k;
};

/**
 * Polinômios de Legendre Associados P_l^m(x)
 * Calculados via relação de recorrência estável.
 * x = cos(theta), então -1 <= x <= 1
 */
const associatedLegendre = (l: number, m: number, x: number): number => {
  if (m > l) return 0;
  const absM = Math.abs(m);

  // 1. Calcular P_m^m(x)
  let pmm = 1.0;
  if (absM > 0) {
    const somx2 = Math.sqrt((1.0 - x) * (1.0 + x));
    let fact = 1.0;
    for (let i = 1; i <= absM; i++) {
      pmm *= -fact * somx2;
      fact += 2.0;
    }
  }
  if (l === absM) return pmm;

  // 2. Calcular P_{m+1}^m(x)
  let pmmp1 = x * (2.0 * absM + 1.0) * pmm;
  if (l === absM + 1) return pmmp1;

  // 3. Recorrência para P_l^m(x)
  let pll = 0;
  for (let ll = absM + 2; ll <= l; ll++) {
    pll = ((2.0 * ll - 1.0) * x * pmmp1 - (ll + absM - 1.0) * pmm) / (ll - absM);
    pmm = pmmp1;
    pmmp1 = pll;
  }
  return pll;
};

/**
 * Função de Onda Radial R_{nl}(r)
 * Para átomo de Hidrogênio (Z=1)
 */
const radialWavefunction = (r: number, n: number, l: number): number => {
  const Z = 1; // Hidrogênio
  // Raio de Bohr a0 = 1 (unidades atômicas)
  
  const rho = (2 * Z * r) / n;
  const normalization = Math.sqrt(
    Math.pow(2 * Z / n, 3) * 
    (factorial(n - l - 1) / (2 * n * factorial(n + l)))
  );

  const L = generalizedLaguerre(n - l - 1, 2 * l + 1, rho);
  
  return normalization * Math.exp(-rho / 2) * Math.pow(rho, l) * L;
};

/**
 * Harmônicos Esféricos Reais Y_{lm}(theta, phi)
 * Combinação de Polinômios de Legendre e funções trigonométricas.
 */
const realSphericalHarmonic = (l: number, m: number, theta: number, phi: number): number => {
  const absM = Math.abs(m);
  const P_lm = associatedLegendre(l, absM, Math.cos(theta));
  
  // Constante de Normalização
  let N = Math.sqrt(
    ((2 * l + 1) / (4 * Math.PI)) * 
    (factorial(l - absM) / factorial(l + absM))
  );

  if (m === 0) {
    return N * P_lm;
  } else if (m > 0) {
    N *= Math.sqrt(2); // Fator para harmônicos reais (m != 0)
    return N * P_lm * Math.cos(m * phi);
  } else {
    N *= Math.sqrt(2);
    return N * P_lm * Math.sin(absM * phi);
  }
};

/**
 * Converte Cartesiano (x,y,z) para Esférico (r, theta, phi)
 */
const getSpherical = (x: number, y: number, z: number) => {
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r === 0) return { r: 0, theta: 0, phi: 0 };
  const theta = Math.acos(z / r); // 0 a PI
  const phi = Math.atan2(y, x);   // -PI a PI
  return { r, theta, phi };
};

/**
 * Densidade de Probabilidade |Psi|^2
 */
export const getProbabilityDensity = (x: number, y: number, z: number, n: number, l: number, m: number): number => {
  const { r, theta, phi } = getSpherical(x, y, z);
  
  // Otimização: Probabilidade zero muito longe do núcleo
  if (r > n * n * 5) return 0; // O raio do átomo escala aprox com n^2

  const R = radialWavefunction(r, n, l);
  const Y = realSphericalHarmonic(l, m, theta, phi);
  
  const psi = R * Y;
  return psi * psi;
};

/**
 * Gerador de Pontos via Monte Carlo Rejection Sampling
 */
export const generateOrbitalPoints = (n: number, l: number, m: number, count: number = 8000): Point3D[] => {
  const points: Point3D[] = [];
  
  // Ajuste da caixa delimitadora (Bounding Box)
  // Orbitais crescem com n^2. Um limite fixo cortaria orbitais altos.
  const limit = Math.pow(n, 2) * 2.5 + 5; 
  
  let attempts = 0;
  // Limite de segurança aumentado para orbitais complexos (picos estreitos)
  const maxAttempts = count * 500; 

  // Estimativa do Máximo Global da Probabilidade para eficiência
  // Picos tendem a decair com o volume, então ajustamos heuristicamente
  // ou fazemos um pre-scan rápido.
  let maxProbEstimate = 0;
  
  // Pre-scan adaptativo para encontrar um bom maxProb
  const scanCount = 1000;
  for(let i=0; i<scanCount; i++) {
     const tx = (Math.random() - 0.5) * 2 * limit * 0.5; // Scan mais concentrado no centro
     const ty = (Math.random() - 0.5) * 2 * limit * 0.5;
     const tz = (Math.random() - 0.5) * 2 * limit * 0.5;
     const p = getProbabilityDensity(tx, ty, tz, n, l, m);
     if (p > maxProbEstimate) maxProbEstimate = p;
  }
  // Se falhou em achar algo (orbital muito fino), usa um fallback seguro
  if (maxProbEstimate === 0) maxProbEstimate = 0.001;
  
  // Multiplicador de segurança para não cortar picos que o scan perdeu
  maxProbEstimate *= 1.2;

  while (points.length < count && attempts < maxAttempts) {
    attempts++;
    
    const x = (Math.random() - 0.5) * 2 * limit;
    const y = (Math.random() - 0.5) * 2 * limit;
    const z = (Math.random() - 0.5) * 2 * limit;

    const prob = getProbabilityDensity(x, y, z, n, l, m);

    // Rejection Sampling
    if (Math.random() * maxProbEstimate < prob) {
      points.push({ x, y, z });
    }
  }

  return points;
};
