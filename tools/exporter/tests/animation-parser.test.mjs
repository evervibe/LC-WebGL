import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import parseAnimation from '../lib/parsers/animation-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

const sampleAnimationPath = path.resolve(
  projectRoot,
  'legacy-assets',
  'Data',
  'Character',
  'Fighter',
  'Fighter.ba',
);

describe('animation parser', () => {
  test('reads animation clips and bone envelopes', async () => {
    const result = await parseAnimation(sampleAnimationPath);

    expect(result.version).toBe(14);
    expect(result.animations.length).toBeGreaterThan(0);

    const animation = result.animations[0];
    expect(animation.bones.length).toBeGreaterThan(0);
    expect(animation.bones[0].positions.length).toBeGreaterThan(0);
    expect(animation.bones[0].rotations.length).toBeGreaterThan(0);
  });
});
