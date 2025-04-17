import { SphereGeometry, Mesh, MeshPhysicalMaterial } from 'three';

function createSphere() {
  const geometry = new SphereGeometry(1, 50, 50);
  const material = new MeshPhysicalMaterial({
    color: "#040810", 
    metalness: 1, 
    reflectivity: 1,
    iridescence: 1,
    iridescenceIOR: 1.5, // Index of refraction for iridescence 
    specularIntensity: 1, 
    specularColor: "#ffffff", 
    flatShading: true, 
    vertexColors: true
  });

  const sphere = new Mesh(geometry, material);
  sphere.rotation.set(0, 0, 0);

  let increasing = true; // Flag for color change direction

  // Define different animation states
  sphere.animations = {
    neutral: (delta) => {
      sphere.rotation.y += 0.1 * delta;
      sphere.rotation.x += 0.01 * delta;
      sphere.rotation.z += 0.01 * delta;
    },

    surprise: (delta) => {
      const speed = 0.5 * delta; // Adjust speed value for smoother animation
      const color = sphere.material.color;
    
      if (color.r >= 1.0 || color.r <= 0.0) {
        increasing = !increasing; // Reverse the direction when limits are reached
      }
    
      const direction = increasing ? 1 : -1;

      sphere.material.iridescenceIOR += direction * speed;
    
      // Update color components (R, G, B)
      color.r += direction * speed;
      color.g += direction * speed;
      color.b += direction * speed;
    
      // Ensure values are clamped between 0 and 1
      color.r = Math.min(Math.max(color.r, 0), 1);
      color.g = Math.min(Math.max(color.g, 0), 1);
      color.b = Math.min(Math.max(color.b, 0), 1);
    },
    anger: (delta) => {
      sphere.rotation.y += 1 * delta;
      sphere.rotation.x += 0.1 * delta;
      sphere.rotation.z += 0.1 * delta;
    },
  };

  // Set default state
  sphere.animationState = 'neutral'; // Default state to start with

  // The general tick method that the AnimationManager will call
  sphere.tick = (delta) => {
    // The AnimationManager will call the correct animation based on the state
    if (sphere.animations[sphere.animationState]) {
      sphere.animations[sphere.animationState](delta);
    }
  };

  return sphere;
}

export { createSphere };



// import { SphereGeometry, Mesh, MeshPhysicalMaterial } from 'three';
// import { MathUtils } from 'three';

// // const radiansPerSecond = MathUtils.degToRad(90);

// // function createMaterial() {
// //   // create a texture loader.
// //   const textureLoader = new TextureLoader();

// //   // load a texture
// //   const texture = textureLoader.load(
// //     '/assets/textures/uv-test-col.png',
// //   );

// //   // create a "standard" material using
// //   // the texture we just loaded as a color map
// //   const material = new MeshToonMaterial({
// //     map: texture,
// //   });

// //   return material;
// // }


// function createSphere() {
//   // create a geometry
//   const geometry = new SphereGeometry(1, 50, 50);

//   // create a default (white) Basic material
//   // const material = new MeshToonMaterial({ color: "#040810" });
//   const material = new MeshPhysicalMaterial({ color: "#040810", metalness: 1, reflectivity: 1, iridescence: 1, specularIntensity: 1, specularColor: "#ffffff", flatShading: true, vertexColors: true});
//   // const material = createMaterial();

//   // create a Mesh containing the geometry and material
//   const sphere = new Mesh(geometry, material);
//   // sphere.position.set(-1,0,0);
//   sphere.rotation.set(0, 0, 0);

//   let increasing = true;  // Flag for color change direction

//     // this method will be called once per frame
//     sphere.tick = (delta) => {
//         const speed = 10 * delta;  // Change rate for color components

//         // Reverse color change direction when a certain threshold is reached
//         if (sphere.material.iridescenceOR >= 2.33 || sphere.material.iridescenceOR <= 1.0) {
//             increasing = !increasing;  // Reverse the direction
//         }
//         sphere.rotation.y += 0.1;
//         sphere.rotation.x += 0.01;
//         sphere.rotation.z += 0.01;
//         sphere.material.iridescenceOR += increasing ? speed : -speed;
//     };

//   return sphere;
// }

// export { createSphere };
