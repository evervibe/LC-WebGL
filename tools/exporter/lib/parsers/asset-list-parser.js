import fs from 'fs-extra';

function sanitizeFloat(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolToken(token) {
  if (typeof token !== 'string') {
    return null;
  }
  const normalized = token.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

function extractIncludePath(line) {
  const match = line.match(/#include\s+"([^"]+)"/i);
  if (!match) {
    return null;
  }
  return match[1];
}

function parseSkeletonList(lines) {
  let maxDistance = null;
  const includes = [];

  for (const line of lines) {
    if (line.startsWith('MAX_DISTANCE')) {
      const [, value] = line.split(/\s+/);
      maxDistance = sanitizeFloat(value?.replace(/;$/, ''));
      continue;
    }
    if (line.startsWith('#INCLUDE')) {
      const includePath = extractIncludePath(line);
      if (includePath) {
        includes.push(includePath);
      }
    }
  }

  return {
    kind: 'skeleton',
    maxDistance,
    includes,
  };
}

function parseMeshList(lines) {
  let maxDistance = null;
  const includes = [];

  for (const line of lines) {
    if (line.startsWith('MAX_DISTANCE')) {
      const [, value] = line.split(/\s+/);
      maxDistance = sanitizeFloat(value?.replace(/;$/, ''));
      continue;
    }
    if (line.startsWith('#INCLUDE')) {
      const includePath = extractIncludePath(line);
      if (includePath) {
        includes.push(includePath);
      }
    }
  }

  return {
    kind: 'mesh',
    maxDistance,
    includes,
  };
}

function parseAnimationList(lines) {
  const entries = [];
  let current = {
    threshold: null,
    compression: null,
    animSpeed: null,
  };

  const commitEntry = (includePath) => {
    entries.push({
      include: includePath,
      threshold: current.threshold,
      compression: current.compression,
      animSpeed: current.animSpeed,
    });
    current = {
      threshold: null,
      compression: null,
      animSpeed: null,
    };
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/;$/, '');
    if (line.startsWith('TRESHOLD')) {
      const [, value] = line.split(/\s+/);
      current.threshold = sanitizeFloat(value);
      continue;
    }
    if (line.startsWith('COMPRESION')) {
      const [, value] = line.split(/\s+/);
      current.compression = parseBoolToken(value);
      continue;
    }
    if (line.startsWith('ANIMSPEED')) {
      const [, value] = line.split(/\s+/);
      current.animSpeed = sanitizeFloat(value);
      continue;
    }
    if (line.startsWith('#INCLUDE')) {
      const includePath = extractIncludePath(line);
      if (includePath) {
        commitEntry(includePath);
      }
    }
  }

  return {
    kind: 'animation',
    entries,
  };
}

export async function parseAssetList(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8');
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));

  if (lines.length === 0) {
    return {
      kind: 'unknown',
      entries: [],
    };
  }

  const header = lines[0].toUpperCase();

  if (header.startsWith('SKELETONLODLIST')) {
    return parseSkeletonList(lines.slice(1));
  }
  if (header.startsWith('MESHLODLIST')) {
    return parseMeshList(lines.slice(1));
  }
  if (header.startsWith('ANIMSETLIST')) {
    return parseAnimationList(lines.slice(1));
  }

  return {
    kind: 'unknown',
    entries: [],
  };
}

export default parseAssetList;
