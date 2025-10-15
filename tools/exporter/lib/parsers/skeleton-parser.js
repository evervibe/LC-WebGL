import fs from 'fs-extra';

import {
  struct,
  fixedString,
  int32,
} from '@vertexvis/struct';

import { BinaryReader } from '../binary-reader.js';

const SKELETON_ID = 'SKEL';
const SKELETON_VERSION = 6;

const SkeletonHeaderStruct = struct([
  { name: 'chunkId', type: fixedString(4) },
  { name: 'version', type: int32 },
]);

function matrix12ToMat4(matrix12) {
  return [
    matrix12[0], matrix12[1], matrix12[2], matrix12[3],
    matrix12[4], matrix12[5], matrix12[6], matrix12[7],
    matrix12[8], matrix12[9], matrix12[10], matrix12[11],
    0, 0, 0, 1,
  ];
}

function normalizeParentName(name) {
  if (!name || name.trim().length === 0) {
    return null;
  }
  return name;
}

export async function parseSkeleton(filePath) {
  const buffer = await fs.readFile(filePath);
  const reader = new BinaryReader(buffer);

  const header = reader.readStruct(SkeletonHeaderStruct);

  if (header.chunkId !== SKELETON_ID) {
    throw new Error(`Invalid skeleton chunk ID in ${filePath}: expected "${SKELETON_ID}", found "${header.chunkId}"`);
  }

  if (header.version !== SKELETON_VERSION) {
    throw new Error(`Unsupported skeleton version ${header.version} in ${filePath}. Expected version ${SKELETON_VERSION}.`);
  }

  const lodCount = reader.readInt32();
  const lods = [];

  for (let lodIndex = 0; lodIndex < lodCount; lodIndex += 1) {
    const source = reader.readLengthPrefixedString();
    const maxDistance = reader.readFloat32();
    const boneCount = reader.readInt32();

    const bones = [];
    for (let boneIndex = 0; boneIndex < boneCount; boneIndex += 1) {
      const name = reader.readLengthPrefixedString();
      const parentNameRaw = reader.readLengthPrefixedString();
      const parentName = normalizeParentName(parentNameRaw);

      const matrix12 = reader.readFloat32Array(12);

      const position = reader.readFloat32Array(3);
      const rotation = reader.readFloat32Array(4);

      const offsetLength = reader.readFloat32();
      const boneLength = reader.readFloat32();

      bones.push({
        index: boneIndex,
        name,
        parentName,
        matrix12: Array.from(matrix12),
        matrix: matrix12ToMat4(matrix12),
        position: Array.from(position),
        rotation: Array.from(rotation),
        offsetLength,
        length: boneLength,
      });
    }

    const indexByName = new Map();
    bones.forEach((bone, index) => {
      indexByName.set(bone.name, index);
    });

    bones.forEach((bone) => {
      const parentIndex = bone.parentName != null ? indexByName.get(bone.parentName) ?? -1 : -1;
      bone.parentIndex = parentIndex;
    });

    lods.push({
      index: lodIndex,
      source,
      maxDistance,
      bones,
      indexByName,
    });
  }

  return {
    version: header.version,
    lods,
  };
}

export default parseSkeleton;
