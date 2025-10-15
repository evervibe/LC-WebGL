function matrix12ToMat4(matrix12) {
  return [
    matrix12[0], matrix12[1], matrix12[2], matrix12[3],
    matrix12[4], matrix12[5], matrix12[6], matrix12[7],
    matrix12[8], matrix12[9], matrix12[10], matrix12[11],
    0, 0, 0, 1,
  ];
}

function invertMat4(m) {
  const inv = new Float32Array(16);

  inv[0] = m[5] * m[10] * m[15]
    - m[5] * m[11] * m[14]
    - m[9] * m[6] * m[15]
    + m[9] * m[7] * m[14]
    + m[13] * m[6] * m[11]
    - m[13] * m[7] * m[10];

  inv[4] = -m[4] * m[10] * m[15]
    + m[4] * m[11] * m[14]
    + m[8] * m[6] * m[15]
    - m[8] * m[7] * m[14]
    - m[12] * m[6] * m[11]
    + m[12] * m[7] * m[10];

  inv[8] = m[4] * m[9] * m[15]
    - m[4] * m[11] * m[13]
    - m[8] * m[5] * m[15]
    + m[8] * m[7] * m[13]
    + m[12] * m[5] * m[11]
    - m[12] * m[7] * m[9];

  inv[12] = -m[4] * m[9] * m[14]
    + m[4] * m[10] * m[13]
    + m[8] * m[5] * m[14]
    - m[8] * m[6] * m[13]
    - m[12] * m[5] * m[10]
    + m[12] * m[6] * m[9];

  inv[1] = -m[1] * m[10] * m[15]
    + m[1] * m[11] * m[14]
    + m[9] * m[2] * m[15]
    - m[9] * m[3] * m[14]
    - m[13] * m[2] * m[11]
    + m[13] * m[3] * m[10];

  inv[5] = m[0] * m[10] * m[15]
    - m[0] * m[11] * m[14]
    - m[8] * m[2] * m[15]
    + m[8] * m[3] * m[14]
    + m[12] * m[2] * m[11]
    - m[12] * m[3] * m[10];

  inv[9] = -m[0] * m[9] * m[15]
    + m[0] * m[11] * m[13]
    + m[8] * m[1] * m[15]
    - m[8] * m[3] * m[13]
    - m[12] * m[1] * m[11]
    + m[12] * m[3] * m[9];

  inv[13] = m[0] * m[9] * m[14]
    - m[0] * m[10] * m[13]
    - m[8] * m[1] * m[14]
    + m[8] * m[2] * m[13]
    + m[12] * m[1] * m[10]
    - m[12] * m[2] * m[9];

  inv[2] = m[1] * m[6] * m[15]
    - m[1] * m[7] * m[14]
    - m[5] * m[2] * m[15]
    + m[5] * m[3] * m[14]
    + m[13] * m[2] * m[7]
    - m[13] * m[3] * m[6];

  inv[6] = -m[0] * m[6] * m[15]
    + m[0] * m[7] * m[14]
    + m[4] * m[2] * m[15]
    - m[4] * m[3] * m[14]
    - m[12] * m[2] * m[7]
    + m[12] * m[3] * m[6];

  inv[10] = m[0] * m[5] * m[15]
    - m[0] * m[7] * m[13]
    - m[4] * m[1] * m[15]
    + m[4] * m[3] * m[13]
    + m[12] * m[1] * m[7]
    - m[12] * m[3] * m[5];

  inv[14] = -m[0] * m[5] * m[14]
    + m[0] * m[6] * m[13]
    + m[4] * m[1] * m[14]
    - m[4] * m[2] * m[13]
    - m[12] * m[1] * m[6]
    + m[12] * m[2] * m[5];

  inv[3] = -m[1] * m[6] * m[11]
    + m[1] * m[7] * m[10]
    + m[5] * m[2] * m[11]
    - m[5] * m[3] * m[10]
    - m[9] * m[2] * m[7]
    + m[9] * m[3] * m[6];

  inv[7] = m[0] * m[6] * m[11]
    - m[0] * m[7] * m[10]
    - m[4] * m[2] * m[11]
    + m[4] * m[3] * m[10]
    + m[8] * m[2] * m[7]
    - m[8] * m[3] * m[6];

  inv[11] = -m[0] * m[5] * m[11]
    + m[0] * m[7] * m[9]
    + m[4] * m[1] * m[11]
    - m[4] * m[3] * m[9]
    - m[8] * m[1] * m[7]
    + m[8] * m[3] * m[5];

  inv[15] = m[0] * m[5] * m[10]
    - m[0] * m[6] * m[9]
    - m[4] * m[1] * m[10]
    + m[4] * m[2] * m[9]
    + m[8] * m[1] * m[6]
    - m[8] * m[2] * m[5];

  let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

  if (det === 0) {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  det = 1.0 / det;

  for (let i = 0; i < 16; i += 1) {
    inv[i] *= det;
  }

  return inv;
}

export function buildSkeleton(document, skeletonData, { buffer, name } = {}) {
  const skeletonLOD = skeletonData?.lods?.[0];
  if (!skeletonLOD) {
    throw new Error('Skeleton data missing LOD information.');
  }

  const bones = skeletonLOD.bones;
  const boneCount = bones.length;

  const jointNodes = bones.map((bone) => {
    const node = document.createNode(bone.name || 'Joint');
    const rotation = bone.rotation || [1, 0, 0, 0];
    node.setTranslation(bone.position || [0, 0, 0]);
    node.setRotation([
      rotation[1] ?? 0,
      rotation[2] ?? 0,
      rotation[3] ?? 0,
      rotation[0] ?? 1,
    ]);
    node.setScale([1, 1, 1]);
    return node;
  });

  let rootJoint = jointNodes[0];
  bones.forEach((bone, index) => {
    const parentIndex = bone.parentIndex ?? -1;
    if (parentIndex >= 0 && jointNodes[parentIndex]) {
      jointNodes[parentIndex].addChild(jointNodes[index]);
    } else {
      rootJoint = jointNodes[index];
    }
  });

  const inverseMatrices = new Float32Array(boneCount * 16);
  bones.forEach((bone, index) => {
    const mat = bone.matrix ?? matrix12ToMat4(bone.matrix12 ?? []);
    const inverse = invertMat4(mat);
    inverseMatrices.set(inverse, index * 16);
  });

  const inverseAccessor = document.createAccessor(`${name ?? 'skeleton'}_inverseBindMatrices`)
    .setType('MAT4')
    .setArray(inverseMatrices)
    .setBuffer(buffer);

  const skin = document.createSkin(name ?? 'Skeleton');
  skin.setInverseBindMatrices(inverseAccessor);
  skin.setSkeleton(rootJoint);
  jointNodes.forEach((joint) => skin.addJoint(joint));

  return {
    bones,
    rootJoint,
    jointNodes,
    skin,
    boneIndexByName: skeletonLOD.indexByName,
  };
}

export default buildSkeleton;
