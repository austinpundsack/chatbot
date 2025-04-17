import { BoxGeometry, Mesh, MeshStandardMaterial, MathUtils, TextureLoader } from 'three';


const radiansPerSecond = MathUtils.degToRad(360);


function createMaterial() {
  // create a texture loader.
  const textureLoader = new TextureLoader();

  // load a texture
  const texture = textureLoader.load(
    '/assets/textures/uv-test-col.png',
  );

  // create a "standard" material using
  // the texture we just loaded as a color map
  const material = new MeshStandardMaterial({
    map: texture,
  });

  return material;
}

  


function createCube() {
  // create a geometry
  const geometry = new BoxGeometry(2, 2, 2);

  // const spec = {
  //   color: 'blue',
  //   }

  // // create a default (white) Basic material
  // const material = new MeshStandardMaterial(spec);

  const material = createMaterial();

  // create a Mesh containing the geometry and material
  const cube = new Mesh(geometry, material);
  cube.position.set(3,0,0);
  cube.rotation.set(-0.5, -0.1, 0.8);


  let increasing = true;  // Flag for color change direction


    // this method will be called once per frame
    cube.tick = (delta) => {

      const speed = radiansPerSecond * delta;  // Change rate for color components

      // Reverse color change direction when a certain threshold is reached
      if (cube.position.x >= 9 || cube.position.x <= -10) {
          increasing = !increasing;  // Reverse the direction
      }

      cube.position.x += increasing ? speed : -speed;

      // increase the cube's rotation each frame
      cube.rotation.z += increasing ? speed : -speed;
      // cube.rotation.x += increasing ? speed : -speed;
      // cube.rotation.y += increasing ? speed : -speed;
    };

  return cube;
}

export { createCube };
