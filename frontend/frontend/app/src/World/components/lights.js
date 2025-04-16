import { DirectionalLight, AmbientLight, HemisphereLight, PointLight, SpotLight, RectAreaLight } from 'three';

function createLights() {
// const ambientLight = new AmbientLight('white', 2);


const ambientLight = new HemisphereLight(
    'white', // bright sky color
    'darkslategrey', // dim ground color
    15, // intensity
  );

// Create a directional light
const mainLight = new DirectionalLight('white', 100);
// // Create a PointLight light
// const pointlight = new PointLight('white', 50);

// // Create a SpotLight light
// const spotlight = new SpotLight('white', 50);

// // Create a RectAreaLight light
// const rectlight = new RectAreaLight('white', 50);

// // move the light right, up, and towards us
// light.position.set(10, 10, 50);

// // move the light right, up, and towards us
// pointlight.position.set(0, 0, 10);

// move the light right, up, and towards us
mainLight.position.set(0, 0, 10);

// // move the light right, up, and towards us
// rectlight.position.set(10, 10, 50);

return { ambientLight, mainLight };
}

export { createLights };