import { Accessor, AnimationChannel, AnimationSampler } from '@gltf-transform/core';

function buildSampler(document, {
  buffer,
  name,
  times,
  values,
  type,
  interpolation = AnimationSampler.Interpolation.LINEAR,
}) {
  const inputAccessor = document.createAccessor(`${name}_time`)
    .setType(Accessor.Type.SCALAR)
    .setArray(times)
    .setBuffer(buffer);

  const outputAccessor = document.createAccessor(`${name}_values`)
    .setType(type)
    .setArray(values)
    .setBuffer(buffer);

  const sampler = document.createAnimationSampler(name)
    .setInput(inputAccessor)
    .setOutput(outputAccessor)
    .setInterpolation(interpolation);

  return sampler;
}

function buildTranslationSampler(document, { buffer, animation, boneName, node, samples }) {
  if (!samples.length) return;

  const times = new Float32Array(samples.length);
  const values = new Float32Array(samples.length * 3);

  samples.forEach((sample, index) => {
    times[index] = sample.time;
    const offset = index * 3;
    values[offset] = sample.position[0];
    values[offset + 1] = sample.position[1];
    values[offset + 2] = sample.position[2];
  });

  const sampler = buildSampler(document, {
    buffer,
    name: `${animation.getName() || 'anim'}_${boneName}_translation`,
    times,
    values,
    type: Accessor.Type.VEC3,
  });

  animation.addSampler(sampler);

  const channel = document.createAnimationChannel()
    .setTargetNode(node)
    .setTargetPath(AnimationChannel.TargetPath.TRANSLATION)
    .setSampler(sampler);
  animation.addChannel(channel);
}

function buildRotationSampler(document, { buffer, animation, boneName, node, samples }) {
  if (!samples.length) return;

  const times = new Float32Array(samples.length);
  const values = new Float32Array(samples.length * 4);

  samples.forEach((sample, index) => {
    times[index] = sample.time;
    const offset = index * 4;
    values[offset] = sample.rotation[0];
    values[offset + 1] = sample.rotation[1];
    values[offset + 2] = sample.rotation[2];
    values[offset + 3] = sample.rotation[3];
  });

  const sampler = buildSampler(document, {
    buffer,
    name: `${animation.getName() || 'anim'}_${boneName}_rotation`,
    times,
    values,
    type: Accessor.Type.VEC4,
  });

  animation.addSampler(sampler);

  const channel = document.createAnimationChannel()
    .setTargetNode(node)
    .setTargetPath(AnimationChannel.TargetPath.ROTATION)
    .setSampler(sampler);
  animation.addChannel(channel);
}

function toAnimationSamples(envelope, secondsPerFrame) {
  const translations = (envelope.positions || []).map((entry) => ({
    time: entry.frame * secondsPerFrame,
    position: entry.position,
  }));

  const rotations = (envelope.rotations || []).map((entry) => ({
    time: entry.frame * secondsPerFrame,
    rotation: [
      entry.rotation.x,
      entry.rotation.y,
      entry.rotation.z,
      entry.rotation.w,
    ],
  }));

  return { translations, rotations };
}

function convertRotationQuaternion(quat) {
  return [quat.x, quat.y, quat.z, quat.w];
}

export function buildAnimations(document, animationData, {
  buffer,
  skeleton,
} = {}) {
  if (!animationData?.animations?.length || !skeleton) {
    return [];
  }

  const createdAnimations = [];
  animationData.animations.forEach((clip, clipIndex) => {
    const animation = document.createAnimation(clip.name || `Animation_${clipIndex}`);
    createdAnimations.push(animation);

    clip.bones.forEach((boneEnvelope) => {
      const boneIndex = skeleton.boneIndexByName.get(boneEnvelope.boneName);
      if (typeof boneIndex !== 'number') {
        return;
      }

      const node = skeleton.jointNodes[boneIndex];
      if (!node) {
        return;
      }

      const { translations, rotations } = toAnimationSamples(boneEnvelope, clip.secondsPerFrame || 0.0333333);

      buildTranslationSampler(document, {
        buffer,
        animation,
        boneName: boneEnvelope.boneName,
        node,
        samples: translations,
      });

      const rotationSamples = rotations.map((sample) => ({
        time: sample.time,
        rotation: convertRotationQuaternion(sample.rotation),
      }));

      buildRotationSampler(document, {
        buffer,
        animation,
        boneName: boneEnvelope.boneName,
        node,
        samples: rotationSamples,
      });
    });
  });

  return createdAnimations;
}

export default buildAnimations;
