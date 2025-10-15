import fs from 'fs-extra';
import path from 'node:path';

export async function resolvePaths({ projectRoot, inputPath, outputPath }) {
  const inputDir = path.resolve(projectRoot, inputPath);
  const outputDir = path.resolve(projectRoot, outputPath);

  const exists = await fs.pathExists(inputDir);
  if (!exists) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  const stats = await fs.stat(inputDir);
  if (!stats.isDirectory()) {
    throw new Error(`Input path is not a directory: ${inputDir}`);
  }

  await fs.ensureDir(outputDir);

  return { inputDir, outputDir };
}

export async function ensureCleanDir(targetDir) {
  await fs.ensureDir(targetDir);
  const entries = await fs.readdir(targetDir);
  if (entries.length > 0) {
    await Promise.all(
      entries.map((entry) => fs.remove(path.join(targetDir, entry))),
    );
  }
}
