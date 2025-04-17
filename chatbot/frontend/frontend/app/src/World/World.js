import { createCamera } from './components/camera.js';
// import { createCube } from './components/cube.js';
// import { createSphere } from './components/sphere.js';
import { createScene } from './components/scene.js';
import { createLights } from './components/lights.js';
import { createRenderer } from './systems/renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
// import { createControls } from './systems/controls.js';
// import { createMeshGroup } from './components/meshgroup.js';
// import { loadBirds } from './components/models/bird.js';
// import { createTorus } from './components/torus.js';
import { AnimationManager } from './systems/AnimationManager.js'; 
// import { createTorusGroup } from './components/torusgroup.js';
import { createInvisibleShape, createTriangleGeometries } from './components/trianglegroup.js';
// import {Mesh,MeshBasicMaterial} from 'three';


// These variables are module-scoped: we cannot access them
// from outside the module
let camera;
// let controls;
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
    // const torus = createTorus();




const shape = createInvisibleShape("sphere");
const triangleGroup = createTriangleGeometries(shape.geometry);

scene.add(shape);
scene.add(triangleGroup);

    // scene.add(torus);
    // const meshGroup = createMeshGroup();
    // scene.add(meshGroup);
    // const sphere = createSphere();
    // const torusGroup = createTorusGroup();
    // scene.add(torusGroup);

    // scene.add(sphere);
    // scene.add(this.cube);

    const { ambientLight, mainLight } = createLights();
    // camera.add(mainLight);
    scene.add(ambientLight, mainLight);
    // this.cube = createCube();
    // const controls = createControls(camera, renderer.domElement);

    // controls.target.copy(sphere.position);

    // controls.minAzimuthAngle = 0;
    // controls.maxAzimuthAngle = Math.PI;

    // controls.minPolarAngle = 0;
    // controls.maxPolarAngle = Math.PI;

    // controls.autoRotate = true;
    // controls.autoRotateSpeed = 1;

    // controls.enableRotate = false;
    // controls.enableZoom = false;
    // controls.enablePan = false;
    // controls.dampingFactor = 1;
    animationManager.addObject(triangleGroup);
    triangleGroup.children.forEach((triangle) => animationManager.addObject(triangle));
    // animationManager.addObject(sphere);  // Add sphere to animation manager
    // animationManager.addObject(torus);   // Add torus to animation manager
    // animationManager.addObject(torusGroup);   // Add torus to animation manager
    // animationManager.addObject(torusGroup);
    // animationManager.addObject(shape);   // Add torus to animation manager
    // loop.updatables.push(this.cube);
    // loop.updatables.push(sphere);
    // loop.updatables.push(shape);
    loop.updatables.push(triangleGroup);
    triangleGroup.children.forEach((triangle) => loop.updatables.push(triangle));
    // loop.updatables.push(meshGroup);
    // loop.updatables.push(torus);
    // loop.updatables.push(controls);
    // loop.updatables.push(torusGroup);
    // loop.updatables.push(camera)
    scene.add(camera);
    // scene.add(ambientLight, mainLight, this.cube);
    



    // light.target = cube
    // controls.addEventListener('change', () => {
    //   render();
    //   });
    const resizer = new Resizer(container, camera, renderer);

    // Static resizer method not needed when rendering animation
    // resizer.onResize = () => {
    //   this.render();
    // };
  }


  // async init() {
  //   const { parrot, flamingo, stork } = await loadBirds();
  
  //   // move the target to the center of the front bird
  //   controls.target.copy(parrot.position);
  //   loop.updatables.push(parrot, flamingo, stork);
  //   scene.add(parrot, flamingo, stork);
  //   randomizeVisibility();
  //   // Function to reset visibility and randomly turn one true
  //   function randomizeVisibility() {
  //     // Set all birds to invisible
  //     parrot.visible = false;
  //     flamingo.visible = false;
  //     stork.visible = false;
  
  //     // Create an array of the bird objects
  //     const birds = [parrot, flamingo, stork];
  
  //     // Choose a random bird and set its visibility to true
  //     const randomBird = birds[Math.floor(Math.random() * birds.length)];
  //     randomBird.visible = true;
  //   }
  
  //   // Get the button element by its ID
  //   const hideButton = document.getElementById('hide');
  
  //   // Add an event listener for the 'click' event on the hide button
  //   hideButton.addEventListener('click', () => {
  //     randomizeVisibility();
  //   });
  // }
  

  render() {
    // draw a single frame
    renderer.render(scene, camera);
  }

  start() {
    loop.start();
  }
  
  stop() {
    loop.stop();
  }

}

export { World, animationManager };