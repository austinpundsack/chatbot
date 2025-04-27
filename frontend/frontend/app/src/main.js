import { World, animationManager } from './World/World.js';

export function initializeWorld() {
  const container = document.querySelector('#scene-container');
  if (!container) return;

  const world = new World(container);

  // Set up event listeners for buttons to trigger animation states
  document.getElementById('surpriseAnimation').addEventListener('click', () => animationManager.setAllState('surprise'));
  document.getElementById('neutralAnimation').addEventListener('click', () => animationManager.setAllState('neutral'));
  document.getElementById('angerAnimation').addEventListener('click', () => animationManager.setAllState('anger'));
  document.getElementById('happyAnimation').addEventListener('click', () => animationManager.setAllState('happy'));
  document.getElementById('fearAnimation').addEventListener('click', () => animationManager.setAllState('fear'));
  document.getElementById('calmAnimation').addEventListener('click', () => animationManager.setAllState('calm'));
  document.getElementById('disgustAnimation').addEventListener('click', () => animationManager.setAllState('disgust'));
  document.getElementById('sadAnimation').addEventListener('click', () => animationManager.setAllState('sad'));

  window.addEventListener('emotionChanged', function(event) {
    const emotionValue = event.detail;

    if (animationManager) {
      animationManager.setAllState(emotionValue);
    } else {
      console.log("Animation Manager is not available.");
    }
  });

  // Start the animation loop
  world.start();
}