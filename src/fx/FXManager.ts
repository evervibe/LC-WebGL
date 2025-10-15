import { Object3D } from 'three';

export interface FXRequest {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'spark' | 'slash' | 'buff';
  duration?: number;
}

export class FXManager {
  private root: Object3D;
  private active: FXRequest[] = [];

  constructor(root: Object3D) {
    this.root = root;
  }

  spawn(request: FXRequest) {
    this.active.push(request);
    // Placeholder: in einer echten Implementierung würden Partikel/Shader erzeugt werden.
    console.info('[FX] spawn', request);
  }

  update(delta: number) {
    this.active = this.active.filter((fx) => {
      if (!fx.duration) return true;
      fx.duration -= delta;
      if (fx.duration <= 0) {
        console.info('[FX] dispose', fx.id);
        return false;
      }
      return true;
    });
  }
}
