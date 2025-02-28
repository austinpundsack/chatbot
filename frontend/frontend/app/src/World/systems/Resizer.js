const setSize = (container, camera, renderer) => {
  // Set the renderer size to the full window size
  renderer.setSize(window.innerWidth-20, window.innerHeight-100);

  // Update the camera aspect ratio and projection matrix
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Set the pixel ratio for high-DPI screens
  renderer.setPixelRatio(window.devicePixelRatio);
};

class Resizer {
  constructor(container, camera, renderer) {
    // Set initial size on load
    setSize(container, camera, renderer);

    // Add an event listener to resize the renderer when the window is resized
    window.addEventListener('resize', () => {
      // Resize the renderer and camera on window resize
      setSize(container, camera, renderer);
      // Optionally, perform any custom actions
      this.onResize();
    });
  }

  onResize() {
    // Custom actions to perform on resize can be added here
  }
}

export { Resizer };
