import fs from 'fs-extra';

import {
  struct,
  fixedString,
  int32,
} from '@vertexvis/struct';

import { BinaryReader } from '../binary-reader.js';

const MESH_ID = 'MESH';
const MESH_NEW_VER = 17;

const MeshHeaderStruct = struct([
  { name: 'chunkId', type: fixedString(4) },
  { name: 'version', type: int32 },
  { name: 'byteLength', type: int32 },
]);

function createMeshDecoder() {
  let checker = MESH_NEW_VER;
  return (value) => {
    let val = value >>> 0;
    let ulChecker = 0;

    checker = (checker + 13) & 0xff;
    ulChecker |= checker << 24;
    checker = (checker + 23) & 0xff;
    ulChecker |= checker << 16;
    checker = (checker + 19) & 0xff;
    ulChecker |= checker << 8;
    checker = (checker + 29) & 0xff;
    ulChecker |= checker;
    checker = (checker + 5) & 0xff;

    return (val ^ ulChecker) >>> 0;
  };
}

function toSigned32(value) {
  return (value << 0) >> 0;
}

function clampArrayLength(requested, available, context) {
  if (requested > available) {
    throw new Error(`Invalid binary structure: ${context} requested ${requested} > remaining ${available}`);
  }
  return requested;
}

function readVertices(reader, count) {
  const floats = reader.readFloat32Array(count * 3);
  const vertices = [];
  for (let i = 0; i < count; i += 1) {
    const idx = i * 3;
    vertices.push({
      x: floats[idx],
      y: floats[idx + 1],
      z: floats[idx + 2],
    });
  }
  return vertices;
}

function readNormals(reader, count) {
  const floats = reader.readFloat32Array(count * 3);
  const normals = [];
  for (let i = 0; i < count; i += 1) {
    const idx = i * 3;
    normals.push({
      x: floats[idx],
      y: floats[idx + 1],
      z: floats[idx + 2],
    });
  }
  return normals;
}

function readUvMaps(reader, decode, count, vertexCount) {
  const maps = [];
  for (let i = 0; i < count; i += 1) {
    const name = reader.readLengthPrefixedString();
    const coords = reader.readFloat32Array(vertexCount * 2);
    const uvs = [];
    for (let j = 0; j < vertexCount; j += 1) {
      const idx = j * 2;
      uvs.push({
        u: coords[idx],
        v: coords[idx + 1],
      });
    }
    maps.push({
      name,
      id: decodeStringId(name),
      texCoords: uvs,
    });
  }
  return maps;
}

function decodeStringId(name) {
  return name;
}

function readTriangles(reader, triangleCount) {
  const totalIndices = triangleCount * 3;
  const indices = reader.readUint16Array(totalIndices);
  const triangles = [];
  for (let i = 0; i < triangleCount; i += 1) {
    const idx = i * 3;
    triangles.push([
      indices[idx],
      indices[idx + 1],
      indices[idx + 2],
    ]);
  }
  return triangles;
}

function readShaderBlock(reader, decode) {
  const colorCount = toSigned32(decode(reader.readInt32()));
  const floatCount = toSigned32(decode(reader.readInt32()));
  const textureCount = toSigned32(decode(reader.readInt32()));
  const texCoordCount = toSigned32(decode(reader.readInt32()));

  const shaderName = reader.readLengthPrefixedString();

  const textures = [];
  for (let i = 0; i < textureCount; i += 1) {
    textures.push(reader.readLengthPrefixedString());
  }

  const flags = decode(reader.readInt32()) >>> 0;

  const colors = [];
  for (let i = 0; i < colorCount; i += 1) {
    colors.push(decode(reader.readInt32()) >>> 0);
  }

  const floats = [];
  for (let i = 0; i < floatCount; i += 1) {
    floats.push(reader.readFloat32());
  }

  const texCoordIndices = [];
  for (let i = 0; i < texCoordCount; i += 1) {
    texCoordIndices.push(toSigned32(decode(reader.readInt32())));
  }

  return {
    name: shaderName,
    textures,
    flags,
    colors,
    floats,
    texCoordIndices,
  };
}

function readWeightMaps(reader, decode, count) {
  const weightMaps = [];
  for (let i = 0; i < count; i += 1) {
    const name = reader.readLengthPrefixedString();
    const weightCount = toSigned32(decode(reader.readInt32()));
    const entries = [];
    for (let j = 0; j < weightCount; j += 1) {
      const vertexIndex = reader.readInt32();
      const weight = reader.readFloat32();
      entries.push({
        vertexIndex,
        weight,
      });
    }
    weightMaps.push({
      name,
      id: decodeStringId(name),
      entries,
    });
  }
  return weightMaps;
}

function readMorphMaps(reader, decode, count) {
  const morphMaps = [];
  for (let i = 0; i < count; i += 1) {
    const name = reader.readLengthPrefixedString();
    const relative = toSigned32(decode(reader.readInt32())) !== 0;
    const morphCount = toSigned32(decode(reader.readInt32()));
    const morphs = [];
    for (let j = 0; j < morphCount; j += 1) {
      const vertexIndex = reader.readInt32();
      const delta = {
        x: reader.readFloat32(),
        y: reader.readFloat32(),
        z: reader.readFloat32(),
        nx: reader.readFloat32(),
        ny: reader.readFloat32(),
        nz: reader.readFloat32(),
      };
      morphs.push({
        vertexIndex,
        delta,
      });
    }
    morphMaps.push({
      name,
      id: decodeStringId(name),
      relative,
      morphs,
    });
  }
  return morphMaps;
}

function readVertexWeightInfos(reader, count) {
  const infos = [];
  for (let i = 0; i < count; i += 1) {
    const indices = reader.readUint8Array(4);
    const weightsRaw = reader.readUint8Array(4);
    const weights = Array.from(weightsRaw, (value) => value / 255);
    infos.push({
      indices: Array.from(indices),
      weights,
    });
  }
  return infos;
}

function normalizeRelativeWeights({ surfaces, vertexWeights }) {
  const vertexToSurface = new Map();
  surfaces.forEach((surface, surfaceIndex) => {
    const { firstVertex, vertexCount } = surface;
    for (let i = 0; i < vertexCount; i += 1) {
      vertexToSurface.set(firstVertex + i, surfaceIndex);
    }
  });

  const normalized = vertexWeights.map((entry, vertexIndex) => {
    const surfaceIndex = vertexToSurface.get(vertexIndex);
    if (surfaceIndex === undefined) {
      return {
        indices: entry.indices,
        weights: entry.weights,
        actualWeightMapIndices: entry.indices,
      };
    }

    const surface = surfaces[surfaceIndex];
    const actualIndices = entry.indices.map((relativeIndex) => {
      if (relativeIndex >= surface.weightMapIndices.length) {
        return -1;
      }
      return surface.weightMapIndices[relativeIndex];
    });

    return {
      indices: entry.indices,
      weights: entry.weights,
      actualWeightMapIndices: actualIndices,
    };
  });

  return normalized;
}

export async function parseMesh(filePath) {
  const buffer = await fs.readFile(filePath);
  const reader = new BinaryReader(buffer);

  const header = reader.readStruct(MeshHeaderStruct);

  if (header.chunkId !== MESH_ID) {
    throw new Error(`Invalid mesh chunk ID in ${filePath}: expected "${MESH_ID}", found "${header.chunkId}"`);
  }

  if (header.version !== MESH_NEW_VER) {
    throw new Error(`Unsupported mesh version ${header.version} in ${filePath}. Only version ${MESH_NEW_VER} is supported.`);
  }

  const decode = createMeshDecoder();

  const lodCountEncoded = reader.readInt32();
  const lodCount = clampArrayLength(toSigned32(decode(lodCountEncoded)), 16, 'LOD count');

  const lods = [];

  for (let lodIndex = 0; lodIndex < lodCount; lodIndex += 1) {
    const vertexWeightInfoCount = toSigned32(decode(reader.readInt32()));
    const weightMapCount = toSigned32(decode(reader.readInt32()));
    const uvMapCount = toSigned32(decode(reader.readInt32()));
    const vertexCount = toSigned32(decode(reader.readInt32()));
    const surfaceCount = toSigned32(decode(reader.readInt32()));
    const morphMapCount = toSigned32(decode(reader.readInt32()));

    const source = reader.readLengthPrefixedString();
    const maxDistance = reader.readFloat32();
    const flags = decode(reader.readInt32()) >>> 0;

    const vertices = readVertices(reader, vertexCount);
    const normals = readNormals(reader, vertexCount);
    const uvMaps = readUvMaps(reader, decode, uvMapCount, vertexCount);

    const surfaces = [];
    for (let surfaceIndex = 0; surfaceIndex < surfaceCount; surfaceIndex += 1) {
      const firstVertex = toSigned32(decode(reader.readInt32()));
      const surfaceVertexCount = toSigned32(decode(reader.readInt32()));
      const triangleCount = toSigned32(decode(reader.readInt32()));

      const triangles = readTriangles(reader, triangleCount);
      const name = reader.readLengthPrefixedString();
      const surfaceFlags = decode(reader.readInt32()) >>> 0;

      const relIndexCount = toSigned32(decode(reader.readInt32()));
      const weightMapIndices = relIndexCount > 0
        ? Array.from(reader.readUint8Array(relIndexCount))
        : [];

      const hasShader = toSigned32(decode(reader.readInt32())) !== 0;
      let shader = null;
      if (hasShader) {
        shader = readShaderBlock(reader, decode);
      }

      surfaces.push({
        name,
        firstVertex,
        vertexCount: surfaceVertexCount,
        triangleCount,
        triangles,
        flags: surfaceFlags,
        weightMapIndices,
        shader,
      });
    }

    const weightMaps = readWeightMaps(reader, decode, weightMapCount);
    const morphMaps = readMorphMaps(reader, decode, morphMapCount);
    const vertexWeightsRaw = vertexWeightInfoCount > 0
      ? readVertexWeightInfos(reader, vertexWeightInfoCount)
      : [];
    const vertexWeights = normalizeRelativeWeights({
      surfaces,
      vertexWeights: vertexWeightsRaw,
    });

    lods.push({
      index: lodIndex,
      source,
      maxDistance,
      flags,
      vertexCount,
      vertices,
      normals,
      uvMaps,
      surfaces,
      weightMaps,
      morphMaps,
      vertexWeights,
    });
  }

  return {
    version: header.version,
    lods,
  };
}

export default parseMesh;
