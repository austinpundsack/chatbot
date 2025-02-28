class AnimationManager {
    constructor() {
      this.objects = [];
    }
  
    addObject(object) {
      this.objects.push(object);
    }
  
    update(delta) {
      this.objects.forEach(object => {
        if (object.animationState && object.animations[object.animationState]) {
          object.animations[object.animationState](delta);
        }
      });
    }
  
    setAnimationState(state) {
        const animationManager = World.animationManager;  // Access the AnimationManager from World
      
        // Check if the animationManager is properly initialized
        if (animationManager && animationManager.setAllState) {
          animationManager.setAllState(state);  // Apply the state to all objects in the manager
        } else {
          console.error("AnimationManager is not initialized properly.");
        }
      }
      

    setAllState(state) {
        for (const object of this.objects) {
          this.setState(object, state);  // Apply state to each object
        }
      }

    setState(object, state) {
      if (object.animations[state]) {
        object.animationState = state;
      }
    }
  }
  
  export { AnimationManager };
  