import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const ThreeBackgroundWave: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup (Balanced to view entire top-to-bottom particle field)
    const camera = new THREE.PerspectiveCamera(
      68,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3.8, 16.2);
    camera.lookAt(0, -0.2, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const container = mountRef.current;
    container.appendChild(renderer.domElement);

    // 4. Soft-Glow Circular Texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
      gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    // 5. Main Topographic Particle Wave (Expanded 72 x 64 grid covering entire viewport)
    const countX = 72;
    const countZ = 64;
    const particleCount = countX * countZ;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Template Palette: Soft Mint/Sage Green (Left) -> Warm Coral/Peach (Right)
    const colorSage = new THREE.Color('#88a795');  // Soft Sage / Mint Green
    const colorCoral = new THREE.Color('#ff7a59'); // Warm Coral / Salmon Peach

    let idx = 0;
    for (let ix = 0; ix < countX; ix++) {
      for (let iz = 0; iz < countZ; iz++) {
        // Broad grid spacing spanning full width and depth from top to bottom
        const x = (ix - countX / 2) * 0.82;
        const z = (iz - countZ / 2) * 0.82;

        positions[idx] = x;
        positions[idx + 1] = 0;
        positions[idx + 2] = z;

        // Position-based color gradient (Sage on left, Coral on right)
        const u = ix / countX;
        const v = iz / countZ;
        const mixRatio = (u * 0.75 + v * 0.25);
        const mixedColor = colorSage.clone().lerp(colorCoral, Math.max(0, Math.min(1, mixRatio)));

        colors[idx] = mixedColor.r;
        colors[idx + 1] = mixedColor.g;
        colors[idx + 2] = mixedColor.b;

        idx += 3;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle material with balanced size and opacity
    const material = new THREE.PointsMaterial({
      size: 0.21,
      map: particleTexture,
      transparent: true,
      opacity: 0.52,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particleWave = new THREE.Points(geometry, material);
    particleWave.position.set(0, -0.6, 0);
    particleWave.rotation.x = -Math.PI / 9;
    scene.add(particleWave);

    // 6. Ambient Floating Dust Particles (100 particles distributed across whole height)
    const dustCount = 100;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let j = 0; j < dustCount; j++) {
      dustPositions[j * 3] = (Math.random() - 0.5) * 44;
      // Evenly distributed across top, middle, and bottom (-14 to +14)
      dustPositions[j * 3 + 1] = (Math.random() - 0.5) * 28;
      dustPositions[j * 3 + 2] = (Math.random() - 0.5) * 44 - 4;

      const dustColor = Math.random() > 0.45 ? colorCoral : colorSage;
      dustColors[j * 3] = dustColor.r;
      dustColors[j * 3 + 1] = dustColor.g;
      dustColors[j * 3 + 2] = dustColor.b;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.30,
      map: particleTexture,
      transparent: true,
      opacity: 0.40,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);

    // 7. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 3.8;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Fluid S-Curve Undulating Wave Animation
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime() * 0.76;

      // Update Wave Vertices across entire screen height
      const posAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
      const posArray = posAttribute.array as Float32Array;

      let pIdx = 0;
      for (let i = 0; i < particleCount; i++) {
        const x = posArray[pIdx];
        const z = posArray[pIdx + 2];

        // Harmonious S-Curve wave formula
        const distFromCenter = Math.sqrt(x * x + z * z);
        const y = Math.sin(x * 0.35 + t * 1.05) * 0.65 +
                  Math.cos(z * 0.38 + t * 0.92) * 0.52 +
                  Math.sin(distFromCenter * 0.42 - t * 1.3) * 0.30;

        posArray[pIdx + 1] = y;
        pIdx += 3;
      }
      posAttribute.needsUpdate = true;

      // Update Floating Dust across the full vertical space
      const dustPosAttribute = dustGeometry.getAttribute('position') as THREE.BufferAttribute;
      const dustPosArray = dustPosAttribute.array as Float32Array;
      for (let j = 0; j < dustCount; j++) {
        dustPosArray[j * 3 + 1] += Math.sin(t * 0.55 + j) * 0.007;
      }
      dustPosAttribute.needsUpdate = true;

      // Smooth Camera Parallax
      targetCameraX = mouseX * 1.8;
      targetCameraY = 3.8 - mouseY * 0.9;

      camera.position.x += (targetCameraX - camera.position.x) * 0.025;
      camera.position.y += (targetCameraY - camera.position.y) * 0.025;
      camera.lookAt(0, -0.2, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Window Resize Handling
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // 10. Memory Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);

      geometry.dispose();
      material.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      particleTexture.dispose();

      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{
        opacity: 0.85,
        mixBlendMode: 'normal',
      }}
    />
  );
};

export default ThreeBackgroundWave;
