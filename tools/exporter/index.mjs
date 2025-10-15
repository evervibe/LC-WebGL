#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

import { createLogger } from './lib/logger.js';
import { resolvePaths } from './lib/paths.js';
import runExporter from './lib/run-exporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const logger = createLogger('exporter');

function printHelp() {
  logger.info([
    'Legacy Mesh Exporter',
    '',
    'Usage:',
    '  node tools/exporter/index.mjs --input <legacy-path> --output <target-path> [options]',
    '',
    'Options:',
    '  --input, -i       Legacy asset directory containing .bm/.bs/.ba files',
    '  --output, -o      Output directory for generated glTF/GLB files',
    '  --format, -f      Output format: glb | gltf (default: glb)',
    '  --textures, -t    Attempt to convert .tex textures (experimental)',
    '  --help, -h        Show this help message',
  ].join('\n'));
}

function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    format: 'glb',
    convertTextures: false,
  };

  const queue = [...argv];
  while (queue.length > 0) {
    const token = queue.shift();
    switch (token) {
      case '--input':
      case '-i':
        args.input = queue.shift();
        break;
      case '--output':
      case '-o':
        args.output = queue.shift();
        break;
      case '--format':
      case '-f':
        args.format = queue.shift();
        break;
      case '--textures':
      case '-t':
        args.convertTextures = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        if (token.startsWith('-')) {
          throw new Error(`Unknown option "${token}"`);
        }
    }
  }

  return args;
}

async function main() {
  const [, , ...rest] = process.argv;
  const args = parseArgs(rest);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (!args.input || !args.output) {
    logger.error('Missing required arguments --input and --output.');
    printHelp();
    process.exit(1);
  }

  const format = (args.format || 'glb').toLowerCase();
  if (!['glb', 'gltf'].includes(format)) {
    logger.error(`Ungültiges Format "${args.format}". Erlaubt: glb | gltf.`);
    process.exit(1);
  }

  try {
    const { inputDir, outputDir } = await resolvePaths({
      projectRoot,
      inputPath: args.input,
      outputPath: args.output,
    });

    await runExporter({
      inputDir,
      outputDir,
      format,
      convertTextures: args.convertTextures,
      logger,
    });
  } catch (err) {
    logger.error(err instanceof Error ? err.message : String(err));
    if (err?.stack) {
      logger.debug(err.stack);
    }
    process.exit(1);
  }
}

main();
