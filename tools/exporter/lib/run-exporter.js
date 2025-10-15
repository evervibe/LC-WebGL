import fs from 'fs-extra';
import path from 'node:path';

import { Document } from '@gltf-transform/core';

import parseMesh from './parsers/mesh-parser.js';
import parseSkeleton from './parsers/skeleton-parser.js';
import parseAnimation from './parsers/animation-parser.js';
import parseAssetList from './parsers/asset-list-parser.js';
import buildSkeleton from './converters/skeleton-converter.js';
import buildMesh from './converters/mesh-converter.js';
import buildAnimations from './converters/animation-converter.js';
import writeGltf from './writer/gltf-writer.js';

function findFirst(entries, predicate) {
  return entries.find(predicate) || null;
}

async function loadOptionalList(inputDir, baseName, extension, logger) {
  const listPath = path.join(inputDir, `${baseName}.${extension}`);
  const exists = await fs.pathExists(listPath);
  if (!exists) {
    return null;
  }
  try {
    return await parseAssetList(listPath);
  } catch (error) {
    logger?.warn?.(`Konnte ${extension}-Liste nicht lesen (${listPath}): ${error?.message ?? error}`);
    return null;
  }
}

export default async function runExporter({
  inputDir,
  outputDir,
  format,
  convertTextures,
  logger,
}) {
  const entries = await fs.readdir(inputDir);
  const meshFiles = entries.filter((filename) => filename.toLowerCase().endsWith('.bm')).sort();

  if (!meshFiles.length) {
    logger.warn('Keine .bm-Meshes gefunden – Abbruch.');
    return;
  }

  const skeletonFile = findFirst(entries, (filename) => filename.toLowerCase().endsWith('.bs'));
  const animationFile = findFirst(entries, (filename) => filename.toLowerCase().endsWith('.ba'));

  const baseName = skeletonFile ? path.parse(skeletonFile).name : path.parse(meshFiles[0]).name;

  const skeletonPath = skeletonFile ? path.join(inputDir, skeletonFile) : null;
  const animationPath = animationFile ? path.join(inputDir, animationFile) : null;

  const skeletonData = skeletonPath ? await parseSkeleton(skeletonPath) : null;
  const animationData = animationPath ? await parseAnimation(animationPath) : null;

  await loadOptionalList(inputDir, baseName, 'asl', logger);
  await loadOptionalList(inputDir, baseName, 'aml', logger);
  await loadOptionalList(inputDir, baseName, 'aal', logger);

  logger.info(`Konvertiere ${meshFiles.length} Mesh(es) aus ${path.relative(process.cwd(), inputDir)}.`);
  if (skeletonPath) {
    logger.info(`Nutze Skelett: ${path.basename(skeletonPath)}`);
  } else {
    logger.warn('Kein .bs-Skelett gefunden. Meshes werden ohne Skin exportiert.');
  }
  if (animationPath) {
    logger.info(`Nutze Animation: ${path.basename(animationPath)}`);
  }
  if (convertTextures) {
    logger.warn('Texturkonvertierung ist noch nicht implementiert.');
  }

  for (const meshFile of meshFiles) {
    const meshPath = path.join(inputDir, meshFile);
    const meshName = path.parse(meshFile).name;
    const meshLogger = logger.child(meshName);

    meshLogger.info('Lese Legacy-Mesh …');
    const meshData = await parseMesh(meshPath);

    if (!meshData?.lods?.length) {
      meshLogger.warn('Keine LOD-Daten gefunden – Mesh wird übersprungen.');
      continue;
    }

    const document = new Document();
    const buffer = document.createBuffer(`${meshName}_buffer`);

    let skeleton = null;
    if (skeletonData) {
      skeleton = buildSkeleton(document, skeletonData, {
        buffer,
        name: `${meshName}_skeleton`,
      });
    }

    const { meshNode } = buildMesh(document, meshData, {
      buffer,
      skeleton,
      meshName,
    });

    if (skeleton?.rootJoint) {
      meshNode.addChild(skeleton.rootJoint);
    }

    if (animationData?.animations?.length && skeleton) {
      meshLogger.info(`Füge ${animationData.animations.length} Animation(en) hinzu …`);
      buildAnimations(document, animationData, {
        buffer,
        skeleton,
      });
    }

    const scene = document.createScene(`${meshName}_Scene`);
    scene.addChild(meshNode);

    const targetFile = `${meshName}.${format === 'gltf' ? 'gltf' : 'glb'}`;
    const outputPath = path.join(outputDir, targetFile);

    meshLogger.debug?.(`Document-Typ: ${document.constructor.name}`);
    meshLogger.debug?.(`Document-Methoden: ${Object.getOwnPropertyNames(Object.getPrototypeOf(document)).join(', ')}`);

    await writeGltf({
      document,
      outputPath,
      format,
      logger: meshLogger,
    });

    meshLogger.info('Export abgeschlossen.');
  }
}
