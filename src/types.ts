import type { Vector3Tuple } from 'three';

export interface UIWindowSample {
  id: string;
  desc: string;
  size: {
    x: number | null;
    y: number | null;
    w: number | null;
    h: number | null;
  };
}

export interface UIWindowControlGroup {
  type: string;
  count: number;
  samples?: UIWindowSample[];
}

export interface UIWindowSummary {
  id: string;
  file: string;
  size: {
    w: number | null;
    h: number | null;
  };
  position: {
    x: number | null;
    y: number | null;
  };
  controlTotal: number;
  controlTypes: UIWindowControlGroup[];
}

export interface UIWindowCatalog {
  generatedAt: string;
  source: string;
  totalWindows: number;
  windows: UIWindowSummary[];
}

export interface SceneMetadata {
  id: string;
  title: string;
  description?: string;
  assetPath?: string;
  version?: string;
  tags?: string[];
  center?: Vector3Tuple;
  orbitDistance?: number;
  relatedWindows?: UIWindowSummary[];
}

export type SceneCatalogResponse = SceneMetadata[];
