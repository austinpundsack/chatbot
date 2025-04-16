import { TorusGeometry, Mesh, MeshPhysicalMaterial, MathUtils } from 'three';


const radiansPerSecond = MathUtils.degToRad(90);


// function createMaterial() {
//   // create a texture loader.
//   const textureLoader = new TextureLoader();

//   // load a texture
//   const texture = textureLoader.load(
//     '/assets/textures/uv-test-col.png',
//   );

//   // create a "standard" material using
//   // the texture we just loaded as a color map
//   const material = new MeshStandardMaterial({
//     map: texture,
//   });

//   return material;
// }

  


function createTorus() {
  // create a geometry
  const geometry = new TorusGeometry(1.3, 0.05, 15, 30);

  // const spec = {
  //   color: 'blue',
  //   }

  // // create a default (white) Basic material
  // const material = new MeshStandardMaterial(spec);

  // const material = createMaterial();

  const material = new MeshPhysicalMaterial({ color: "#040810", metalness: 1, reflectivity: 1, iridescence: 1, specularIntensity: 1, specularColor: "#ffffff", flatShading: true, vertexColors: true});

  // create a Mesh containing the geometry and material
  const torus = new Mesh(geometry, material);
  // torus.position.set(3,0,0);
  // torus.rotation.set(-0.5, -0.1, 0.8);


  let increasing = true; // Flag for color change direction

  // Define different animation states
  torus.animations = {
    neutral: (delta) => {
      const speed = radiansPerSecond * delta;  // Change rate for color components

      // Reverse color change direction when a certain threshold is reached
      if (torus.position.x >= 9 || torus.position.x <= -10) {
          increasing = !increasing;  // Reverse the direction
      }

      // torus.position.x += increasing ? speed : -speed;

      // increase the torus's rotation each frame
      torus.rotation.z += increasing ? speed : -speed;
      torus.rotation.x += increasing ? speed : -speed;
      torus.rotation.y += increasing ? speed : -speed;
    },

    surprise: (delta) => {
      const speed = 0.5 * delta; // Adjust speed value for smoother animation
      const color = torus.material.color;
    
      if (color.r >= 1.0 || color.r <= 0.0) {
        increasing = !increasing; // Reverse the direction when limits are reached
      }
    
      const direction = increasing ? 1 : -1;

      torus.material.iridescenceIOR += direction * speed;
    
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
      const speed = radiansPerSecond * delta * 20;  // Change rate for color components

      // Reverse color change direction when a certain threshold is reached
      if (torus.position.x >= 9 || torus.position.x <= -10) {
          increasing = !increasing;  // Reverse the direction
      }

      // torus.position.x += increasing ? speed : -speed;

      // increase the torus's rotation each frame
      torus.rotation.z += increasing ? speed : -speed;
      torus.rotation.x += increasing ? speed : -speed;
      torus.rotation.y += increasing ? speed : -speed;
    },
  };

  // Set default state
  torus.animationState = 'neutral'; // Default state to start with

    // this method will be called once per frame
    torus.tick = (delta) => {
    // The AnimationManager will call the correct animation based on the state
    if (torus.animations[torus.animationState]) {
      torus.animations[torus.animationState](delta);
    }
    };

  return torus;
}

export { createTorus };
