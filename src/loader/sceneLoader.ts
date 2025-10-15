import { LoadingManager, Texture } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export type SceneLoadProgress = {
  loaded: number;
  total: number;
  ratio: number;
  item?: string;
};

export interface SceneLoaderOptions {
  dracoPath?: string;
  ktx2Path?: string;
  onProgress?: (progress: SceneLoadProgress) => void;
}

export class SceneLoader {
  private manager: LoadingManager;
  private gltfLoader: GLTFLoader;

  constructor(private options: SceneLoaderOptions = {}) {
    this.manager = new LoadingManager();
    this.manager.onProgress = (item, loaded, total) => {
      this.options.onProgress?.({
        item,
        loaded,
        total,
        ratio: total ? loaded / total : 0,
      });
    };

    this.gltfLoader = new GLTFLoader(this.manager);

    if (options.dracoPath) {
      const dracoLoader = new DRACOLoader(this.manager);
      dracoLoader.setDecoderPath(options.dracoPath);
      this.gltfLoader.setDRACOLoader(dracoLoader);
    }

    if (options.ktx2Path) {
      const ktx2Loader = new KTX2Loader(this.manager);
      ktx2Loader.setTranscoderPath(options.ktx2Path);
      ktx2Loader.detectSupport({
        // minimal WebGL2 detection
        extensions: [],
        isWebGL2: true,
        capabilities: { isWebGL2: true },
      } as unknown as Parameters<KTX2Loader['detectSupport']>[0]);
      this.gltfLoader.setKTX2Loader(ktx2Loader);
    }
  }

  async loadScene(url: string): Promise<GLTF> {
    return this.gltfLoader.loadAsync(url);
  }

  disposeTexture(texture: Texture) {
    if (texture.isTexture) {
      texture.dispose();
    }
  }
}
