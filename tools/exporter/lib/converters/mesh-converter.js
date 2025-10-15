import { Accessor } from '@gltf-transform/core';

function flattenVertices(vertices) {
  const array = new Float32Array(vertices.length * 3);
  vertices.forEach((vertex, index) => {
    const offset = index * 3;
    array[offset] = vertex.x;
    array[offset + 1] = vertex.y;
    array[offset + 2] = vertex.z;
  });
  return array;
}

function flattenNormals(normals) {
  const array = new Float32Array(normals.length * 3);
  normals.forEach((normal, index) => {
    const offset = index * 3;
    array[offset] = normal.x;
    array[offset + 1] = normal.y;
    array[offset + 2] = normal.z;
  });
  return array;
}

function flattenUVs(uvs) {
  const array = new Float32Array(uvs.length * 2);
  uvs.forEach((uv, index) => {
    const offset = index * 2;
    array[offset] = uv.u;
    array[offset + 1] = uv.v;
  });
  return array;
}

function buildSkinningData({ vertexWeights, weightMaps, boneIndexByName }) {
  const vertexCount = vertexWeights.length;
  const joints = new Uint16Array(vertexCount * 4);
  const weights = new Float32Array(vertexCount * 4);

  const mapToBone = weightMaps.map((map) => {
    const boneIndex = boneIndexByName.get(map.name);
    return typeof boneIndex === 'number' ? boneIndex : 0;
  });

  for (let i = 0; i < vertexCount; i += 1) {
    const vw = vertexWeights[i] || { indices: [0, 0, 0, 0], weights: [1, 0, 0, 0] };
    let sum = 0;

    for (let influence = 0; influence < 4; influence += 1) {
      const jointOffset = i * 4 + influence;
      const weightIndex = vw.actualWeightMapIndices?.[influence];
      const weight = vw.weights?.[influence] ?? 0;
      const boneIndex = typeof weightIndex === 'number' && weightIndex >= 0
        ? mapToBone[weightIndex] ?? 0
        : 0;
      joints[jointOffset] = boneIndex;
      weights[jointOffset] = weight;
      sum += weight;
    }

    if (sum === 0) {
      weights[i * 4] = 1;
    } else {
      for (let influence = 0; influence < 4; influence += 1) {
        weights[i * 4 + influence] /= sum;
      }
    }
  }

  return { joints, weights };
}

function buildIndices(surface, vertexCount) {
  const triangles = surface.triangles || [];
  const indices = new Uint32Array(triangles.length * 3);
  const base = surface.firstVertex ?? 0;

  triangles.forEach((triangle, index) => {
    const offset = index * 3;
    indices[offset] = base + triangle[0];
    indices[offset + 1] = base + triangle[1];
    indices[offset + 2] = base + triangle[2];
  });

  if (vertexCount <= 65535) {
    return new Uint16Array(indices);
  }

  return indices;
}

export function buildMesh(document, meshData, {
  buffer,
  skeleton,
  meshName = 'Mesh',
} = {}) {
  const lod = meshData?.lods?.[0];
  if (!lod) {
    throw new Error('Mesh data missing LOD information.');
  }

  const mesh = document.createMesh(meshName);

  const positionsArray = flattenVertices(lod.vertices);
  const normalsArray = lod.normals?.length ? flattenNormals(lod.normals) : null;
  const uvMap = lod.uvMaps?.[0];
  const uvArray = uvMap ? flattenUVs(uvMap.texCoords) : null;

  const positionAccessor = document.createAccessor(`${meshName}_positions`)
    .setType(Accessor.Type.VEC3)
    .setArray(positionsArray)
    .setBuffer(buffer);

  let normalAccessor = null;
  if (normalsArray) {
    normalAccessor = document.createAccessor(`${meshName}_normals`)
      .setType(Accessor.Type.VEC3)
      .setArray(normalsArray)
      .setBuffer(buffer);
  }

  let uvAccessor = null;
  if (uvArray) {
    uvAccessor = document.createAccessor(`${meshName}_uv0`)
      .setType(Accessor.Type.VEC2)
      .setArray(uvArray)
      .setBuffer(buffer);
  }

  let jointsAccessor = null;
  let weightsAccessor = null;
  if (skeleton) {
    const skinning = buildSkinningData({
      vertexWeights: lod.vertexWeights || [],
      weightMaps: lod.weightMaps || [],
      boneIndexByName: skeleton.boneIndexByName,
    });

    jointsAccessor = document.createAccessor(`${meshName}_joints`)
      .setType(Accessor.Type.VEC4)
      .setArray(skinning.joints)
      .setBuffer(buffer);

    weightsAccessor = document.createAccessor(`${meshName}_weights`)
      .setType(Accessor.Type.VEC4)
      .setArray(skinning.weights)
      .setBuffer(buffer);
  }

  lod.surfaces.forEach((surface, index) => {
    const primitive = document.createPrimitive(`${meshName}_primitive_${index}`);
    const indicesArray = buildIndices(surface, lod.vertexCount);
    const indicesAccessor = document.createAccessor(`${meshName}_indices_${index}`)
      .setType(Accessor.Type.SCALAR)
      .setArray(indicesArray)
      .setBuffer(buffer);

    primitive.setMode(4); // TRIANGLES
    primitive.setIndices(indicesAccessor);
    primitive.setAttribute('POSITION', positionAccessor);
    if (normalAccessor) {
      primitive.setAttribute('NORMAL', normalAccessor);
    }
    if (uvAccessor) {
      primitive.setAttribute('TEXCOORD_0', uvAccessor);
    }
    if (jointsAccessor && weightsAccessor) {
      primitive.setAttribute('JOINTS_0', jointsAccessor);
      primitive.setAttribute('WEIGHTS_0', weightsAccessor);
    }

    const material = document.createMaterial(surface.name || `${meshName}_Material_${index}`);
    primitive.setMaterial(material);

    mesh.addPrimitive(primitive);
  });

  const meshNode = document.createNode(`${meshName}_Node`).setMesh(mesh);
  if (skeleton?.skin) {
    meshNode.setSkin(skeleton.skin);
  }

  return {
    mesh,
    meshNode,
  };
}

export default buildMesh;
