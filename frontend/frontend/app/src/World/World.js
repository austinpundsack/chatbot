import { createCamera } from './components/camera.js';
import { createScene } from './components/scene.js';
import { createLights } from './components/lights.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { AnimationManager } from './systems/AnimationManager.js';
import { createInvisibleShape, createTriangleGeometries } from './components/trianglegroup.js';
import { Raycaster, Vector2, Vector3 } from 'three';

let camera;
let renderer;
let scene;
let loop;
const animationManager = new AnimationManager();

class World {
  constructor(container) {
    camera = createCamera();
    scene = createScene();
    renderer = createRenderer();
    loop = new Loop(camera, scene, renderer);
    container.append(renderer.domElement);

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    container.addEventListener('mousemove', (event) => this.onMouseMove(event));

    const shape = createInvisibleShape("sphere");
    const triangleGroup = createTriangleGeometries(shape.geometry);
    this.triangleGroup = triangleGroup;
    scene.add(triangleGroup);

    const { ambientLight, mainLight } = createLights();
    scene.add(ambientLight, mainLight, camera); // Ensure camera is added to the scene

    animationManager.addObject(triangleGroup);
    triangleGroup.children.forEach((triangle) => animationManager.addObject(triangle));

    loop.updatables.push(triangleGroup, this);
    triangleGroup.children.forEach((triangle) => loop.updatables.push(triangle));

    const resizer = new Resizer(container, camera, renderer);
  }

  tick(delta) {
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(this.triangleGroup.children);

    intersects.forEach((intersect) => {
      const triangle = intersect.object;
      const triangleWorldPos = new Vector3();
      triangle.getWorldPosition(triangleWorldPos);
      const direction = new Vector3().subVectors(triangleWorldPos, intersect.point).normalize();
      triangle.position.addScaledVector(direction, delta * 5 * -1);
    });
  }

  onMouseMove(event) {
    const rect = event.target.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  update(delta) {
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(this.triangleGroup.children);

    intersects.forEach((intersect) => {
      const triangle = intersect.object;
      const triangleWorldPos = new Vector3();
      triangle.getWorldPosition(triangleWorldPos);
      const direction = new Vector3().subVectors(triangleWorldPos, intersect.point).normalize();
      triangle.position.addScaledVector(direction, 0.5);
    });
  }

  start() {
    loop.start();
  }

  stop() {
    loop.stop();
  }
}

export { World, animationManager };