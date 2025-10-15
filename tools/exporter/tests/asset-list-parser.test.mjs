import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, expect, test } from 'vitest';

import parseAssetList from '../lib/parsers/asset-list-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

const baseDir = path.resolve(
  projectRoot,
  'legacy-assets',
  'Data',
  'Character',
  'Fighter',
);

describe('asset list parser', () => {
  test('parses skeleton list includes', async () => {
    const skeletonList = await parseAssetList(path.join(baseDir, 'Fighter.asl'));
    expect(skeletonList.kind).toBe('skeleton');
    expect(skeletonList.includes.length).toBeGreaterThan(0);
  });

  test('parses animation list entries', async () => {
    const animationList = await parseAssetList(path.join(baseDir, 'Fighter.aal'));
    expect(animationList.kind).toBe('animation');
    expect(animationList.entries.length).toBeGreaterThan(0);
    expect(animationList.entries[0].include).toMatch(/\.aa$/i);
  });
});
