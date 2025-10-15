import fs from 'fs-extra';

import {
  struct,
  fixedString,
  int32,
} from '@vertexvis/struct';

import { BinaryReader } from '../binary-reader.js';

const ANIMSET_ID = 'ANIM';
const ANIMSET_VERSION = 14;

const AnimHeaderStruct = struct([
  { name: 'chunkId', type: fixedString(4) },
  { name: 'version', type: int32 },
]);

function readMatrix12(reader) {
  return Array.from(reader.readFloat32Array(12));
}

function readAnimPos(reader) {
  const frame = reader.readUint16();
  reader.skip(2); // alignment padding
  const position = Array.from(reader.readFloat32Array(3));
  return { frame, position };
}

function readAnimRot(reader) {
  const frame = reader.readUint16();
  reader.skip(2); // alignment padding
  const quat = Array.from(reader.readFloat32Array(4));
  return {
    frame,
    rotation: {
      w: quat[0],
      x: quat[1],
      y: quat[2],
      z: quat[3],
    },
  };
}

function readBoneEnvelope(reader) {
  const boneName = reader.readLengthPrefixedString();
  const defaultMatrix = readMatrix12(reader);

  const positionCount = reader.readInt32();
  const positions = [];
  for (let i = 0; i < positionCount; i += 1) {
    positions.push(readAnimPos(reader));
  }

  const rotationCount = reader.readInt32();
  const rotations = [];
  for (let i = 0; i < rotationCount; i += 1) {
    rotations.push(readAnimRot(reader));
  }

  const offsetLength = reader.readFloat32();

  return {
    boneName,
    defaultMatrix,
    positions,
    rotations,
    offsetLength,
  };
}

function readMorphEnvelope(reader) {
  const morphName = reader.readLengthPrefixedString();
  const factorCount = reader.readInt32();
  const factors = [];
  for (let i = 0; i < factorCount; i += 1) {
    factors.push(reader.readFloat32());
  }
  return {
    morphName,
    factors,
  };
}

export async function parseAnimation(filePath) {
  const buffer = await fs.readFile(filePath);
  const reader = new BinaryReader(buffer);

  const header = reader.readStruct(AnimHeaderStruct);

  if (header.chunkId !== ANIMSET_ID) {
    throw new Error(`Invalid animation chunk ID in ${filePath}: expected "${ANIMSET_ID}", found "${header.chunkId}"`);
  }

  if (header.version !== ANIMSET_VERSION) {
    throw new Error(`Unsupported animation version ${header.version} in ${filePath}. Expected version ${ANIMSET_VERSION}.`);
  }

  const animationCount = reader.readInt32();
  const animations = [];

  for (let animationIndex = 0; animationIndex < animationCount; animationIndex += 1) {
    const source = reader.readLengthPrefixedString();
    const name = reader.readLengthPrefixedString();

    const secondsPerFrame = Math.abs(reader.readFloat32());
    const frames = reader.readInt32();
    const threshold = reader.readFloat32();
    const compressed = reader.readInt32() !== 0;
    const customSpeed = reader.readInt32() !== 0;

    const boneEnvelopeCount = reader.readInt32();
    const bones = [];
    for (let i = 0; i < boneEnvelopeCount; i += 1) {
      bones.push(readBoneEnvelope(reader));
    }

    const morphEnvelopeCount = reader.readInt32();
    const morphs = [];
    for (let i = 0; i < morphEnvelopeCount; i += 1) {
      morphs.push(readMorphEnvelope(reader));
    }

    animations.push({
      index: animationIndex,
      name,
      source,
      secondsPerFrame,
      frames,
      threshold,
      compressed,
      customSpeed,
      bones,
      morphs,
    });
  }

  return {
    version: header.version,
    animations,
  };
}

export default parseAnimation;
