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
  Group,
  Vector3,
  Color,
} from 'three';

function createTriangleGeometries(shape) {
  const group = new Group();
  const vertices = shape.attributes.position.array;
  const index = shape.index?.array;

  const defaultMaterial = new MeshBasicMaterial({ color: '#0b0c2a', transparent: true, opacity: 1 });
  const lerpSpeed = 0.05;
  let shakeTime = 0;

  function addAnimations(mesh) {
    mesh.animations = {
      neutral: (delta) => {
        mesh.rotation.y += 0.1 * delta * (Math.random() - 0.5);
        mesh.position.y += 0.01 * Math.sin(Date.now() * 0.001); // slight float
      },
      surprise: (delta) => {
        mesh.position.y += 2 * delta * Math.sin(Date.now() * 10);
        mesh.rotation.x += 5 * delta * (Math.random() - 0.5);
        mesh.rotation.z += 5 * delta * (Math.random() - 0.5);
      },
      anger: (delta) => {
        mesh.rotation.y += delta * (Math.random() - 0.5) * 1.5;
        mesh.rotation.x += delta * (Math.random() - 0.5) * 1.5;
        mesh.rotation.z += delta * (Math.random() - 0.5) * 1.5;
        mesh.material.color.lerp(new Color(0xff0000), 0.1 * delta * shakeTime);
      },
      calm: (delta) => {
        mesh.position.y += 0.2 * Math.sin(Date.now() * 0.001); // soft floating
        mesh.rotation.y += 0.05 * delta;
      },
      happy: (delta) => {
        mesh.material.color.lerp(new Color(0xF8D664), 0.1 * delta * 10);
        mesh.position.x += 0.1 * Math.sin(Date.now() * 0.003); // gentle bob
        mesh.rotation.y += 0.2 * delta;
      },
      sad: (delta) => {
        mesh.position.y -= 0.3 * delta; // slow sink
        mesh.rotation.z += 0.01 * delta * (Math.random() - 0.5); // droop
        mesh.material.color.lerp(new Color(0x334466), 0.1 * delta * 10);
      },
      fear: (delta) => {
        mesh.position.x += 0.1 * (Math.random() - 0.5);
        mesh.position.y += 0.1 * (Math.random() - 0.5);
        mesh.position.z -= 0.3 * delta; // move slightly back
        mesh.material.color.lerp(new Color(0x7f7fff), 0.1 * delta * 10);
      },
      disgust: (delta) => {
        mesh.position.x += 0.2 * (Math.random() - 0.5);
        mesh.position.y -= 0.1 * delta;
        mesh.rotation.x += 0.2 * delta * (Math.random() - 0.5);
        mesh.material.color.lerp(new Color(0x4B8F8C), 0.2 * delta);
      },
    };

    mesh.animationState = 'none';
    mesh.originalPosition = mesh.position.clone();
    mesh.originalRotation = mesh.rotation.clone();
    mesh.originalColor = new Color().copy(mesh.material.color);

    mesh.tick = (delta) => {
      mesh.animations[mesh.animationState]?.(delta);
      mesh.material.color.lerp(mesh.originalColor, lerpSpeed * (Math.random() - 0.1));
      mesh.position.lerp(mesh.originalPosition, lerpSpeed);
      mesh.rotation.x += (mesh.originalRotation.x - mesh.rotation.x) * lerpSpeed;
      mesh.rotation.y += (mesh.originalRotation.y - mesh.rotation.y) * lerpSpeed;
      mesh.rotation.z += (mesh.originalRotation.z - mesh.rotation.z) * lerpSpeed;
    };
  }

  if (!index) {
    for (let i = 0; i < vertices.length; i += 9) {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(vertices.slice(i, i + 9), 3));
      const mesh = new Mesh(geometry, defaultMaterial.clone());
      addAnimations(mesh);
      group.add(mesh);
    }
  } else {
    for (let i = 0; i < index.length; i += 3) {
      const faceVertices = new Float32Array([
        vertices[index[i] * 3], vertices[index[i] * 3 + 1], vertices[index[i] * 3 + 2],
        vertices[index[i + 1] * 3], vertices[index[i + 1] * 3 + 1], vertices[index[i + 1] * 3 + 2],
        vertices[index[i + 2] * 3], vertices[index[i + 2] * 3 + 1], vertices[index[i + 2] * 3 + 2],
      ]);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(faceVertices, 3));
      const mesh = new Mesh(geometry, defaultMaterial.clone());
      addAnimations(mesh);
      group.add(mesh);
    }
  }

  group.animations = {
    neutral: (delta) => {
      group.rotation.y += delta;
    },
    surprise: (delta) => {
      group.position.y += 5 * delta * Math.sin(Date.now() * 0.01);
      // group.scale.set(1.2, 1.2, 1.2);
      const lerpSpeed = 5 * delta;
      const minScale = 0.1;
      const tinyScale = new Vector3(minScale, minScale, minScale);
      const { userData, scale, position } = group;
  
      if (!userData.animationPhase) {
        userData.animationPhase = "shrinking";
        userData.originalScale = scale.clone();
      }
  
      if (userData.animationPhase === "shrinking") {
        scale.lerp(tinyScale, lerpSpeed);
        if (scale.distanceTo(tinyScale) < 0.01) {
          scale.copy(tinyScale);
          const savedPosition = position.clone();
          group.clear();
          const shapeTypes = ['box', 'sphere', 'dodecahedron', 'icosahedron', 'octahedron', 'tetrahedron'];
          const randomShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
          const invisibleShape = createInvisibleShape(randomShape);
          const newGroup = createTriangleGeometries(invisibleShape.geometry);
          newGroup.position.copy(savedPosition);
          newGroup.scale.copy(tinyScale);
          group.add(newGroup);
          group.scale.set(1, 1, 1);
          userData.childGroup = newGroup;
          userData.childTargetScale = userData.originalScale;
          userData.animationPhase = "growing";
  
          newGroup.children.forEach((child) => {
            child.originalPosition = child.position.clone();
            child.originalRotation = child.rotation.clone();
            child.originalColor = new Color().copy(child.material.color);
          });
        }
      } else if (userData.animationPhase === "growing") {
        const { childGroup, childTargetScale } = userData;
        if (!childGroup || !childTargetScale) return;
        childGroup.scale.lerp(childTargetScale, lerpSpeed);
        if (childGroup.scale.distanceTo(childTargetScale) < 0.01) {
          childGroup.scale.copy(childTargetScale);
          userData.animationPhase = null;
          group.animationState = 'none';
        }
      }
    },
    anger: (delta) => {
      shakeTime += 0.25;
      const scaleFactor = 1 + 0.075 * Math.sin(shakeTime * 1);
      group.scale.set(scaleFactor, scaleFactor, scaleFactor);
    },
    calm: (delta) => {
      group.position.y += delta * 0.1 * Math.sin(Date.now() * 0.001);
    },
    happy: (delta) => {
      group.rotation.y += delta;
      group.position.y += delta * 0.05 * Math.sin(Date.now() * 0.002);
    },
    sad: (delta) => {
      group.position.y -= 0.1 * delta;
    },
    fear: (delta) => {
      group.position.z -= 0.2 * delta;
      group.position.x += 2 * delta * Math.sin(Date.now() * 0.01);
    },
    disgust: (delta) => {
      group.rotation.z += 0.05 * delta * Math.sin(Date.now() * 5);
      group.position.x -= delta * Math.sin(Date.now() * 2);
    },
  };

  group.animationState = 'none';

  group.tick = (delta) => {
    group.position.z = Math.max(0, Math.min(group.position.z, 20));
    group.position.y = Math.max(-12, Math.min(group.position.y, 0));
    group.animations[group.animationState]?.(delta);
    group.children.forEach((child) => {
      child.tick?.(delta);
    });
  };

  return group;
}

function createInvisibleShape(geometryType) {
  const size = 2;
  let geometry;

  switch (geometryType) {
    case 'box': geometry = new BoxGeometry(size, size, size); break;
    case 'sphere': geometry = new SphereGeometry(size, 32, 32); break;
    case 'dodecahedron': geometry = new DodecahedronGeometry(size); break;
    case 'icosahedron': geometry = new IcosahedronGeometry(size); break;
    case 'octahedron': geometry = new OctahedronGeometry(size); break;
    case 'plane': geometry = new PlaneGeometry(size, size); break;
    case 'tetrahedron': geometry = new TetrahedronGeometry(size); break;
    default: geometry = new BoxGeometry(size, size, size);
  }

  const material = new MeshBasicMaterial({ visible: false });
  const mesh = new Mesh(geometry, material);
  return mesh;
}

export { createTriangleGeometries, createInvisibleShape };
