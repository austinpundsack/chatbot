class AnimationManager {
  constructor() {
    this.objects = [];
  }

  addObject(object) {
    this.objects.push(object);
  }

  update(delta) {
    this.objects.forEach((object) => {
      if (object.tick) {
        object.tick(delta); // Call the tick method for each object
      } else {
        console.log(`Object does not have a tick method:`, object);
      }
    });
  }

  setAnimationState(state) {
    this.setAllState(state);
  }

  setAllState(state) {
    for (const object of this.objects) {
      this.setStateRecursively(object, state); // Apply state recursively
    }
  }
  
  setStateRecursively(object, state) {
    // Apply the state to the current object
    if (object.animations && object.animations[state]) {
      object.animationState = state;
    }
  
    // If the object has children, apply the state to them as well
    if (object.children && object.children.length > 0) {
      object.children.forEach((child) => {
        this.setStateRecursively(child, state);
      });
    }
  }
}

export { AnimationManager };
