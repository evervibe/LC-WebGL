import * as THREE from 'three';
import { AnimationMixer, Clock } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ClipConfig {
  name: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export class AnimationManager {
  private mixer: AnimationMixer | null = null;
  private clips: ClipConfig[] = [];
  private clock = new Clock();

  attach(gltf: GLTF, clips: ClipConfig[] = []) {
    if (!gltf.animations?.length) {
      this.mixer = null;
      this.clips = [];
      return;
    }
    this.mixer = new AnimationMixer(gltf.scene);
    this.clips = clips;

    clips.forEach((clip) => {
      const animation = gltf.animations.find((anim) => anim.name === clip.name);
      if (animation && this.mixer) {
        const action = this.mixer.clipAction(animation);
        if (!clip.loop) {
          action.setLoop(THREE.LoopOnce, 0);
        }
        if (clip.autoPlay) {
          action.play();
        }
      }
    });
    this.clock.start();
  }

  update() {
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
  }

  dispose() {
    this.mixer?.stopAllAction();
    this.mixer = null;
    this.clips = [];
  }
}
