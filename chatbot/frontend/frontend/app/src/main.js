import { World, animationManager } from './World/World.js';


// async function main() {
//   // Get a reference to the container element
//   const container = document.querySelector('#scene-container');

//   // create a new world
//   const world = new World(container);

//   // complete async tasks
//   // await world.init();

//   // start the animation loop
//   world.start();
// }

// main().catch((err) => {
//   console.error(err);
// });


export function initializeWorld() {
  const container = document.querySelector('#scene-container');
  if (!container) return;

  const world = new World(container); // assuming `World` is imported


  // const playPauseButton = document.getElementById("play");

  // playPauseButton.addEventListener("click", function() {
  //   playPause(playPauseButton);
  // });
  
  // function playPause(playPauseButton) {
  //   if (playPauseButton.innerText === "Play") {
  //     playPauseButton.classList.add("bg-red-500", "text-white");
  //     playPauseButton.innerText = "Pause";
  //     world.start();
  //   } else if (playPauseButton.innerText === "Pause") {
  //     playPauseButton.classList.remove("bg-red-500", "text-white");
  //     playPauseButton.innerText = "Play";
  //     world.stop();
  //   }
  // }

  // const control = document.getElementById("control");

  // control.addEventListener("click", function() {
  //   moveControl();
  // });
  
  // function moveControl() {
  //   world.controls.target.copy(world.cube.position);
  //     world.controls.update();  
  // }
    // world.render();  // renders one frame


      // Set up event listeners for buttons to trigger state change
    // Button to trigger "Start Animation"
    document.getElementById('surpriseAnimation').addEventListener('click', () => {
      // Trigger the animation state change for all objects managed by the AnimationManager
        animationManager.setAllState('surprise'); // Set all objects' animation state to 'running'
    });
  
    // Button to trigger "Pause Animation"
    document.getElementById('neutralAnimation').addEventListener('click', () => {
      // Trigger the animation state change for all objects managed by the AnimationManager
      animationManager.setAllState('neutral'); // Set all objects' animation state to 'paused'
    });

    // Button to trigger "Pause Animation"
    document.getElementById('angerAnimation').addEventListener('click', () => {
      // Trigger the animation state change for all objects managed by the AnimationManager
      animationManager.setAllState('anger'); // Set all objects' animation state to 'paused'
    });


    window.addEventListener('emotionChanged', function(event) {
      const emotionValue = event.detail; // Get the value passed in the event
      console.log("Emotion changed:", emotionValue);
      
      // Call the animation manager
      if (animationManager) {
        animationManager.setAllState(emotionValue);
      } else {
        console.log("Animation Manager is not available.");
      }
    });

    // start the animation loop
    world.start();
    // playPause(playPauseButton);
    // playPause(playPauseButton);


}




