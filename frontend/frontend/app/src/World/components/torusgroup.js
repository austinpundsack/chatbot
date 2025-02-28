import {
    TorusGeometry,
    Group,
    MathUtils,
    Mesh,
    MeshPhysicalMaterial, Matrix4, Vector3
  } from 'three';
  
  function createTorusGroup() {
    // a group holds other objects
    // but cannot be seen itself
    const group = new Group();
  
    const geometry = new TorusGeometry(1.3, 0.05, 15, 30);
  
    const material = new MeshPhysicalMaterial({ color: "#040810", metalness: 1, reflectivity: 1, iridescence: 1, specularIntensity: 1, specularColor: "#ffffff", flatShading: true, vertexColors: true});
  
    const protoTorus = new Mesh(geometry, material);
    
    // Add the protoTorus to the group
    // group.add(protoTorus);
    
    // Create 20 clones of the protoTorus and add each to the group
    const radius = 0; // Radius of the sphere
    const ringRadius = 0.65; // Radius of the ring along which toruses will be placed
    const numToruses = 100; // Number of toruses
    
    let previousTorusPosition = new Vector3(); // To store the position of the previous torus
    
    for (let i = 0; i < numToruses; i++) {
      const torus = protoTorus.clone();
    
      // Calculate the angle for this torus around the ring
      const angle = (i / numToruses) * 2 * Math.PI; // Spread over a full circle (2PI)
    
      // Position the torus along the ring
      torus.position.x = radius + ringRadius * Math.cos(angle);  // Position on the x-axis
      torus.position.y =  0.1; // Position on the y-axis
      torus.position.z = ringRadius * Math.sin(angle); // Slightly adjust z for visual separation
    
      // Optionally scale each torus based on its index
      torus.scale.multiplyScalar(0.01 + (i / numToruses / 10));
    
      // If it's not the first torus, make it face the previous one
      if (i > 0) {
        // Use the direction to set the rotation so the torus faces the next one in the sequence
        torus.rotation.setFromRotationMatrix(new Matrix4().lookAt(torus.position, previousTorusPosition, new Vector3(0, 1, 0)));
      }
    
      // Store this torus position for the next iteration
      previousTorusPosition.copy(torus.position);
    
      // Add the torus to the group
      group.add(torus);
    }
    
    
    
  
    // every torus inside the group will be scaled
    group.scale.multiplyScalar(2);
  
    const radiansPerSecond = MathUtils.degToRad(300);

    let increasing = true; // Flag for color change direction

    // Define different animation states
    group.animations = {  
      surprise: (delta) => {
        const speed = 0.01 * delta;
        
        // Iterate over all meshes in the group (children)
        group.children.forEach((child) => {
          if (child.material) {
            const color = child.material.color;
    
            // Ensure the color exists before updating
            if (color) {
              if (color.r >= 1.0 || color.r <= 0.0) {
                increasing = !increasing; // Reverse the direction when limits are reached
              }
    
              const direction = increasing ? 1 : -1;
              
              // Update iridescence IOR
              child.material.iridescenceIOR += direction * speed;

              // Adjust color and ensure it stays within valid bounds
              color.r += direction * speed;
              color.g += direction * speed;
              color.b += direction * speed;
    
              color.r = Math.min(Math.max(color.r, 0), 1);
              color.g = Math.min(Math.max(color.g, 0), 1);
              color.b = Math.min(Math.max(color.b, 0), 1);
            }
          }
        });
      },
      neutral: (delta) => {
        const speed = radiansPerSecond * delta;
    
        // Update the group's position to rotate around a sphere (following spherical coordinates)
        const time = performance.now() * 0.001; // Get a time-based factor for smooth animation
    
        // For the spherical movement, we will make the group orbit a point (the center of the sphere)
        const radius = 0; // Distance from the center of the sphere
        const angle = time * speed; // Control the speed of the orbit
        
        // Orbit the group in XZ plane (making it move around the sphere)
        group.position.x = radius * Math.cos(angle); // Update x to move on the circle's circumference
        group.position.z = radius * Math.sin(angle); // Update z to move on the circle's circumference
    
        // Simulate a swinging effect like a rope (swaying back and forth)
        const swingSpeed = 0.1; // How fast the rope swings back and forth
        const swingAmplitude = 5; // How far the rope swings (angular offset)
    
        // Apply a swinging effect on the group (this will make it sway back and forth)
        group.rotation.x = swingAmplitude * Math.sin(time * swingSpeed); // Swing along X-axis
        group.rotation.z = swingAmplitude * Math.cos(time * swingSpeed); // Swing along Z-axis
    
        // Snake-like movement (undulation effect) applied to each torus
        const snakeAmplitude = 1; // How much each torus "wiggles"
        const snakeSpeed = 1; // Speed of the snake-like wave motion
    
        // Iterate through each torus to apply their individual snake-like position movement
        group.children.forEach((child, index) => {
            if (child.material) {
                // Create a sine wave-based y-position shift to simulate a snake-like motion
                const offset = Math.sin(time * snakeSpeed + (index / group.children.length) * Math.PI * 2) * snakeAmplitude;
                child.position.y = offset; // Apply the wave to the y-position
    
                // Small rotation for each torus to add more dynamic movement
                const rotationSpeed = 0.1 + (index / 10000);
                child.rotation.x += rotationSpeed;
                child.rotation.y += rotationSpeed;
                child.rotation.z += rotationSpeed;
            }
        });
    },
    anger: (delta) => {
      const speed = radiansPerSecond * delta;
  
      // Update the group's position to rotate around a sphere (following spherical coordinates)
      const time = performance.now() * 0.001; // Get a time-based factor for smooth animation
  
      // For the spherical movement, we will make the group orbit a point (the center of the sphere)
      const radius = 0; // Distance from the center of the sphere
      const angle = time * speed; // Control the speed of the orbit
      
      // Orbit the group in XZ plane (making it move around the sphere)
      group.position.x = radius * Math.cos(angle); // Update x to move on the circle's circumference
      group.position.z = radius * Math.sin(angle); // Update z to move on the circle's circumference
  
      // Simulate a swinging effect like a rope (swaying back and forth)
      const swingSpeed = 1; // How fast the rope swings back and forth
      const swingAmplitude = 1; // How far the rope swings (angular offset)
  
      // Apply a swinging effect on the group (this will make it sway back and forth)
      group.rotation.x = swingAmplitude * Math.sin(time * swingSpeed); // Swing along X-axis
      group.rotation.z = swingAmplitude * Math.cos(time * swingSpeed); // Swing along Z-axis
  
      // Snake-like movement (undulation effect) applied to each torus
      const snakeAmplitude = 2; // How much each torus "wiggles"
      const snakeSpeed = 10; // Speed of the snake-like wave motion
  
      // Iterate through each torus to apply their individual snake-like position movement
      group.children.forEach((child, index) => {
          if (child.material) {
              // Create a sine wave-based y-position shift to simulate a snake-like motion
              const offset = Math.sin(time * snakeSpeed + (index / group.children.length) * Math.PI * 2) * snakeAmplitude;
              child.position.y = offset; // Apply the wave to the y-position
  
              // Small rotation for each torus to add more dynamic movement
              const rotationSpeed = 0.1 + (index / 1000);
              child.rotation.x += rotationSpeed;
              child.rotation.y += rotationSpeed;
              child.rotation.z += rotationSpeed;
          }
      });
  }
    
    
    
    };
  
    // Set default state
    group.animationState = 'neutral'; // Default state to start with


    // each frame, rotate the entire group of spheres
    group.tick = (delta) => {
        // The AnimationManager will call the correct animation based on the state
        if (group.animations[group.animationState]) {
          group.animations[group.animationState](delta);
        }      
      // group.rotation.z -= delta * radiansPerSecond;
    };
  
    return group;
  }
  
  export { createTorusGroup };