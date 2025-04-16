import { Clock } from "three";
import { AnimationManager } from './AnimationManager.js'; 

const clock = new Clock();

class Loop {
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
    this.animationManager = new AnimationManager();
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      // Tell every animated object to tick forward one frame
      this.tick();

      // Render a frame
      this.renderer.render(this.scene, this.camera);
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
    // Only call getDelta once per frame!
    const delta = clock.getDelta();

    // Update each updatable object
    for (const object of this.updatables) {
      object.tick(delta);
    }

    // Call the animation manager to update animations for each updatable
    this.animationManager.update(delta);
  }

  addUpdatable(object) {
    this.updatables.push(object);
    this.animationManager.addObject(object);  // Add the object to the animation manager
  }

  setAnimationManager(animationManager) {
    this.animationManager = animationManager;
  }
}

export { Loop };
