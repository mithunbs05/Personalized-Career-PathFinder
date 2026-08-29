import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const ThreeBackgroundWave: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    
    // Create soft-glow circular texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);
    
    // Main Particle Wave Topography (60x44 grid)
    const countX = 60;
    const countZ = 44;
    const particleCount = countX * countZ;
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorSage = new THREE.Color('#9BB09E');
    const colorCoral = new THREE.Color('#FF7A59');
    
    let i = 0;
    for (let ix = 0; ix < countX; ix++) {
      for (let iz = 0; iz < countZ; iz++) {
        // Centered grid positions
        const x = (ix - countX / 2) * 0.8;
        const z = (iz - countZ / 2) * 0.8;
        
        positions[i] = x;
        positions[i + 1] = 0;
        positions[i + 2] = z;
        
        // Base color interpolation based on position
        const mixRatio = (x / (countX * 0.8) + 0.5 + z / (countZ * 0.8) + 0.5) / 2;
        const mixedColor = colorSage.clone().lerp(colorCoral, Math.max(0, Math.min(1, mixRatio)));
        
        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
        
        i += 3;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const particleWave = new THREE.Points(geometry, material);
    particleWave.position.y = 0.2;
    particleWave.rotation.x = -Math.PI / 8;
    scene.add(particleWave);
    
    // Ambient Star Dust Particles
    const dustCount = 80;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    
    for (let j = 0; j < dustCount; j++) {
      dustPositions[j * 3] = (Math.random() - 0.5) * 40;
      dustPositions[j * 3 + 1] = Math.random() * 20 - 5;
      dustPositions[j * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.3,
      map: particleTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xFF4D31, 2, 50);
    pointLight.position.set(0, 12, 0);
    scene.add(pointLight);
    
    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    let animationFrameId: number;
    let t = 0;
    
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      t += delta;
      
      // Update wave vertices
      const posAttribute = geometry.getAttribute('position');
      for (let i = 0; i < particleCount; i++) {
        const x = posAttribute.getX(i);
        const z = posAttribute.getZ(i);
        
        // Mathematical wave equation specified by user
        const y = Math.sin(x * 0.35 + t * 1.3) * 0.75 + 
                  Math.cos(z * 0.4 + t * 1.05) * 0.65 + 
                  Math.sin(Math.sqrt(x * x + z * z) * 0.48 - t * 1.8) * 0.35;
                  
        posAttribute.setY(i, y);
      }
      posAttribute.needsUpdate = true;
      
      // Update dust particles
      const dustPosAttribute = dustGeometry.getAttribute('position');
      for (let j = 0; j < dustCount; j++) {
        let y = dustPosAttribute.getY(j);
        y += Math.sin(t * 0.5 + j) * 0.02; // Float up and down slightly
        dustPosAttribute.setY(j, y);
      }
      dustPosAttribute.needsUpdate = true;
      
      // Mouse parallax dampening
      targetX = mouseX * 2;
      targetY = mouseY * 2;
      
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y + 5) * 0.02;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      geometry.dispose();
      material.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      particleTexture.dispose();
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};
