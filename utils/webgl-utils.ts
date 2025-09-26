import * as THREE from 'three';

// Utilitário para gerenciar recursos WebGL e prevenir vazamentos
export class WebGLResourceManager {
  private static instance: WebGLResourceManager;
  private disposableObjects: Set<THREE.Object3D | THREE.Material | THREE.Geometry> = new Set();

  static getInstance(): WebGLResourceManager {
    if (!WebGLResourceManager.instance) {
      WebGLResourceManager.instance = new WebGLResourceManager();
    }
    return WebGLResourceManager.instance;
  }

  // Registra objetos para limpeza automática
  register(object: THREE.Object3D | THREE.Material | THREE.Geometry): void {
    this.disposableObjects.add(object);
  }

  // Remove um objeto específico do registro
  unregister(object: THREE.Object3D | THREE.Material | THREE.Geometry): void {
    this.disposableObjects.delete(object);
  }

  // Limpa todos os recursos registrados
  dispose(): void {
    this.disposableObjects.forEach(object => {
      if ('dispose' in object && typeof object.dispose === 'function') {
        try {
          object.dispose();
        } catch (error) {
          console.warn('Error disposing object:', error);
        }
      }
    });
    this.disposableObjects.clear();
  }

  // Otimiza configurações do renderer para estabilidade
  static optimizeRenderer(renderer: THREE.WebGLRenderer): void {
    // Configurações conservadoras para prevenir context loss
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = 'srgb';
    
    // Configurações de memória
    renderer.info.autoReset = true;
    
    // Configurações anti-aliasing baseadas no dispositivo
    const gl = renderer.getContext();
    if (gl.getParameter(gl.MAX_SAMPLES) < 4) {
      renderer.antialias = false;
    }
  }

  // Hook para detectar e gerenciar context loss
  static setupContextLossHandling(
    canvas: HTMLCanvasElement,
    onContextLoss: () => void,
    onContextRestore: () => void
  ): () => void {
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      onContextLoss();
    };

    const handleContextRestore = () => {
      console.log('WebGL context restored');
      onContextRestore();
    };

    canvas.addEventListener('webglcontextlost', handleContextLoss, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestore, false);

    // Retorna função de cleanup
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLoss);
      canvas.removeEventListener('webglcontextrestored', handleContextRestore);
    };
  }
}

// Hook personalizado para usar o resource manager
export const useWebGLResourceManager = () => {
  const manager = WebGLResourceManager.getInstance();
  
  const registerResource = (resource: THREE.Object3D | THREE.Material | THREE.Geometry) => {
    manager.register(resource);
  };

  const unregisterResource = (resource: THREE.Object3D | THREE.Material | THREE.Geometry) => {
    manager.unregister(resource);
  };

  return { registerResource, unregisterResource };
};