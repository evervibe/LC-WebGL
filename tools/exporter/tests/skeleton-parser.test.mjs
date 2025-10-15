import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import parseSkeleton from '../lib/parsers/skeleton-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

const sampleSkeletonPath = path.resolve(
  projectRoot,
  'legacy-assets',
  'Data',
  'Character',
  'Fighter',
  'Fighter.bs',
);

describe('skeleton parser', () => {
  test('reads bones and parent relationships', async () => {
    const result = await parseSkeleton(sampleSkeletonPath);

    expect(result.version).toBe(6);
    expect(result.lods.length).toBeGreaterThan(0);

    const lod = result.lods[0];
    expect(lod.bones.length).toBeGreaterThan(0);

    const rootBone = lod.bones.find((bone) => bone.parentIndex === -1);
    expect(rootBone).toBeDefined();
    expect(rootBone.name).toBeDefined();

    const childBone = lod.bones.find((bone) => bone.parentIndex === 0);
    expect(childBone).toBeDefined();
  });
});
