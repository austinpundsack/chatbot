import {
  BufferGeometry,
  BoxGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  OctahedronGeometry,
  PlaneGeometry,
  TetrahedronGeometry,
  BufferAttribute,
  Group
} from 'three';

function createTriangleGeometries(shape) {
  const group = new Group(); // Create a group to hold all triangles
  const vertices = shape.attributes.position.array;
  const index = shape.index ? shape.index.array : null;

  // Helper function to create animations for each triangle
  function addAnimations(mesh) {
    mesh.animations = {
      neutral: (delta) => {
        mesh.position.y += 0.5 * delta * (Math.random() - 0.5);
      },
      surprise: (delta) => {
        mesh.rotation.y += 0.1 * delta;
        mesh.rotation.x += 0.01 * delta;
        mesh.rotation.z += 0.01 * delta;
      },
      anger: (delta) => {
        mesh.rotation.y += delta * (Math.random() - 0.5);
        mesh.rotation.x += delta * (Math.random() - 0.5);
        mesh.rotation.z += delta * (Math.random() - 0.5);
      },
      calm: (delta) => {
      },
      happy: (delta) => {
      },
      sad: (delta) => {
      },
      fear: (delta) => {
      },
      disgust: (delta) => {
      },
    };

    mesh.animationState = 'surprise';

    mesh.tick = (delta) => {
      if (mesh.animations[mesh.animationState]) {
        mesh.animations[mesh.animationState](delta);
      }
    };
  }

  // Create triangles and add them to the group
  if (!index) {
    // Non-indexed geometry
    for (let j = 0; j < vertices.length; j += 9) {
      const geometry = new BufferGeometry();
      const faceVertices = new Float32Array([
        vertices[j], vertices[j + 1], vertices[j + 2],
        vertices[j + 3], vertices[j + 4], vertices[j + 5],
        vertices[j + 6], vertices[j + 7], vertices[j + 8],
      ]);
      geometry.setAttribute('position', new BufferAttribute(faceVertices, 3));

      const material = new MeshBasicMaterial({
        color: 'red',
        transparent: true,
        opacity: 1,
      });
      const mesh = new Mesh(geometry, material);

      addAnimations(mesh);
      group.add(mesh);
    }
  } else {
    // Indexed geometry
    for (let j = 0; j < index.length; j += 3) {
      const geometry = new BufferGeometry();
      const faceVertices = new Float32Array([
        vertices[index[j] * 3], vertices[index[j] * 3 + 1], vertices[index[j] * 3 + 2],
        vertices[index[j + 1] * 3], vertices[index[j + 1] * 3 + 1], vertices[index[j + 1] * 3 + 2],
        vertices[index[j + 2] * 3], vertices[index[j + 2] * 3 + 1], vertices[index[j + 2] * 3 + 2],
      ]);
      geometry.setAttribute('position', new BufferAttribute(faceVertices, 3));

      const material = new MeshBasicMaterial({
        color: 'red',
        transparent: true,
        opacity: 1,
      });
      const mesh = new Mesh(geometry, material);

      addAnimations(mesh);
      group.add(mesh);
    }
  }

  // Add animations to the group
  group.animations = {
    neutral: (delta) => {
      group.position.y += 0.5 * delta * (Math.random() - 0.5);
      group.rotation.y += 0.1 * delta;
      group.rotation.x += 0.01 * delta;
      group.rotation.z += 0.01 * delta;
    },
    surprise: (delta) => {
    },
    anger: (delta) => {
    },
    calm: (delta) => {
    },
    happy: (delta) => {
    },
    sad: (delta) => {
    },
    fear: (delta) => {
    },
    disgust: (delta) => {
    },
  };

  group.animationState = 'surprise';

  group.tick = (delta) => {
    if (group.animations[group.animationState]) {
      group.animations[group.animationState](delta);
    }

    group.children.forEach((child) => {
      if (child.tick) {
        child.tick(delta);
      }
    });
  };

  return group; // Ensure the group is returned
}

function createInvisibleShape(geometryType) {
  let geometry;
  const size = 1; 

  switch (geometryType) {
    case 'box':
      geometry = new BoxGeometry(size, size, size);
      break;
    case 'sphere':
      geometry = new SphereGeometry(size, 32, 32); 
      break;
    case 'dodecahedron':
      geometry = new DodecahedronGeometry(size);
      break;
    case 'icosahedron':
      geometry = new IcosahedronGeometry(size);
      break;
    case 'octahedron':
      geometry = new OctahedronGeometry(size);
      break;
    case 'plane':
      geometry = new PlaneGeometry(size, size);
      break;
    case 'tetrahedron':
      geometry = new TetrahedronGeometry(size);
      break;
    default:
      geometry = new BoxGeometry(size, size, size);
  }

  const material = new MeshBasicMaterial({ visible: false });
  const mesh = new Mesh(geometry, material);

  return mesh;
}

export { createTriangleGeometries, createInvisibleShape };