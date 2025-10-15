#!/usr/bin/env node
/**
 * Legacy Asset Konvertierung (Stub für 2.0.0-alpha)
 *
 * Ziel:
 *  - Batch-Konvertierung von FBX/SKA/SKM nach glTF/GLB
 *  - Nachbearbeitung mit KTX2/Draco für Texturen & Geometrie
 *
 * Voraussetzungen (manuell zu installieren):
 *  - Blender 3.x mit Kommandozeilen-Zugang
 *  - gltf-transform CLI (`npm install -g @gltf-transform/cli`)
 *  - toktx (KTX2 Kodierer) oder Basis Pfade
 *
 * Dieses Script orchestriert lediglich die Aufrufe. Die eigentlichen Tools
 * müssen lokal verfügbar sein. Pfade und Optionen in `convert-config.json`
 * hinterlegen.
 */

import { execSync } from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const configPath = path.join(root, 'data', 'convert-config.json');

async function loadConfig() {
  if (!(await fs.pathExists(configPath))) {
    throw new Error(`Konfigurationsdatei fehlt: ${configPath}`);
  }
  return fs.readJSON(configPath);
}

function run(command, opts = {}) {
  console.log('[convert-assets]', command);
  execSync(command, { stdio: 'inherit', ...opts });
}

async function convertWithBlender(config) {
  const blender = config.tools?.blenderPath;
  if (!blender) {
    console.warn('⚠️  Blender-Pfad nicht gesetzt. Schritt wird übersprungen.');
    return;
  }

  for (const job of config.jobs) {
    if (job.type !== 'fbx') continue;
    const outputDir = path.resolve(root, 'public', 'assets', job.targetId);
    await fs.ensureDir(outputDir);
    const command = `"${blender}" --background --python "${path.join(
      root,
      'scripts',
      'helpers',
      'blender-export.py',
    )}" -- "${path.resolve(job.input)}" "${path.join(outputDir, 'scene.glb')}"`;
    run(command);
  }
}

async function optimizeWithGltfTransform(config) {
  const gltfTransform = config.tools?.gltfTransform;
  if (!gltfTransform) {
    console.warn('⚠️  gltf-transform CLI nicht gesetzt. Schritt wird übersprungen.');
    return;
  }

  for (const job of config.jobs) {
    const assetDir = path.resolve(root, 'public', 'assets', job.targetId);
    const inputGlb = path.join(assetDir, 'scene.glb');
    const outputGlb = path.join(assetDir, 'scene.optimized.glb');
    if (!(await fs.pathExists(inputGlb))) continue;

    let command = `${gltfTransform} optimize "${inputGlb}" "${outputGlb}"`;
    if (config.options?.draco) {
      command += ' --draco';
    }
    if (config.options?.ktx2) {
      command += ` --ktx2 ${config.tools?.toktx ?? ''}`;
    }
    run(command);
  }
}

async function main() {
  try {
    const config = await loadConfig();
    await convertWithBlender(config);
    await optimizeWithGltfTransform(config);
    console.log('[convert-assets] abgeschlossen (Stub – Ergebnisse bitte überprüfen).');
  } catch (error) {
    console.error('[convert-assets] Fehler:', error.message);
    process.exitCode = 1;
  }
}

main();
