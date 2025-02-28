import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Avatar3D = () => {
  const canvasRef = useRef(null);
  const leftEyeRef = useRef(null);  // Ref to store left eye mesh
  const rightEyeRef = useRef(null); // Ref to store right eye mesh

  // Set up scene, camera, and renderer
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, });
    renderer.setSize(window.innerWidth/2, window.innerHeight/2);
    renderer.setClearColor(0x000000, 0); // Set background to transparent

    // Create the light ball (main body)
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 50 });
    const ball = new THREE.Mesh(geometry, material);
    scene.add(ball);

    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(1, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Left Eye - Positioned left from the center
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-2, 2, 5); // Move it slightly left
    leftEyeRef.current = leftEye; // Store left eye mesh in ref
    scene.add(leftEye);

    // Right Eye - Positioned right from the center
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(2, 2, 5); // Move it slightly right
    rightEyeRef.current = rightEye; // Store right eye mesh in ref
    scene.add(rightEye);

    // Set camera position
    camera.position.z = 15;

    // Add animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      ball.rotation.x += 0.01;
      ball.rotation.y += 0.01;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth/2, window.innerHeight/2);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

// Handle mouse movement for eye tracking
useEffect(() => {
    const mouse = new THREE.Vector2();
  
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
      if (leftEyeRef.current && rightEyeRef.current) {
        // Move the left eye slightly to the left of the cursor
        leftEyeRef.current.position.x = mouse.x - 2; // Slightly left of the cursor
        leftEyeRef.current.position.y = mouse.y;
  
        // Move the right eye slightly to the right of the cursor
        rightEyeRef.current.position.x = mouse.x + 2; // Slightly right of the cursor
        rightEyeRef.current.position.y = mouse.y;
      }
    };
  
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);
  

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Avatar3D;
