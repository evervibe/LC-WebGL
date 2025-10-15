import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import parseMesh from '../lib/parsers/mesh-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

const sampleMeshPath = path.resolve(
  projectRoot,
  'legacy-assets',
  'Data',
  'Character',
  'Fighter',
  'fr_bu.bm',
);

describe('mesh parser', () => {
  test('parses bm mesh header and lod data', async () => {
    const result = await parseMesh(sampleMeshPath);

    expect(result.version).toBe(17);
    expect(result.lods).toHaveLength(1);

    const lod = result.lods[0];
    expect(lod.vertexCount).toBe(lod.vertices.length);
    expect(lod.normals).toHaveLength(lod.vertexCount);
    expect(lod.vertexWeights).toHaveLength(lod.vertexCount);
    expect(lod.surfaces.length).toBeGreaterThan(0);
    expect(lod.weightMaps.length).toBeGreaterThan(0);

    const surface = lod.surfaces[0];
    expect(surface.triangles.length).toBeGreaterThan(0);
    expect(surface.weightMapIndices.length).toBeGreaterThan(0);

    const firstVertex = lod.vertices[0];
    expect(firstVertex).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      z: expect.any(Number),
    });
  });
});
