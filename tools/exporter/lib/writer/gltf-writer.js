import path from 'node:path';

import { NodeIO } from '@gltf-transform/core';

export default async function writeGltf({ document, outputPath, format = 'glb', logger }) {
  const targetFile = path.basename(outputPath);
  logger?.info?.(`Schreibe ${targetFile} (${format.toUpperCase()})`);

  const io = new NodeIO();
  await io.write(outputPath, document);
}
