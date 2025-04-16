import { PerspectiveCamera } from 'three';

function createCamera() {
  const camera = new PerspectiveCamera(
    35, // fov = Field Of View
    1, // aspect ratio (dummy value)
    0.1, // near clipping plane
    1000, // far clipping plane
  );

  // move the camera back so we can view the scene
  camera.position.set(0, -8, 35);


  let increasing = true;  // Flag for color change direction

      // this method will be called once per frame
      camera.tick = (delta) => {

        const speed = 5 * delta;  // Change rate for color components

        // Reverse color change direction when a certain threshold is reached
        if (camera.position.z >= 25 || camera.position.z <= 5) {
            increasing = !increasing;  // Reverse the direction
        }
        camera.position.z += increasing ? speed : -speed;
    };

  return camera;
}

export { createCamera };
