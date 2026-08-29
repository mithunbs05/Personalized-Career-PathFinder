import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroScene: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Fluid 3D Particle Wave Grid
    const gridCols = 55;
    const gridRows = 40;
    const totalParticles = gridCols * gridRows;
    const spacing = 0.8;

    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);

    const coralColor = new THREE.Color('#FF4D31');
    const sageColor = new THREE.Color('#7A8B7C');
    const subtleDarkColor = new THREE.Color(isDarkMode ? '#E8E6DE' : '#4A4A4A');

    let idx = 0;
    for (let i = 0; i < gridCols; i++) {
      for (let j = 0; j < gridRows; j++) {
        const x = (i - gridCols / 2) * spacing;
        const z = (j - gridRows / 2) * spacing;
        const y = 0;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        // Gradient color across wave: Coral accents blending into soft Sage
        const mixRatio = Math.sin((i / gridCols) * Math.PI) * Math.cos((j / gridRows) * Math.PI);
        const vertexColor = new THREE.Color().lerpColors(
          sageColor,
          coralColor,
          Math.max(0, mixRatio * 0.8)
        );

        colors[idx * 3] = vertexColor.r;
        colors[idx * 3 + 1] = vertexColor.g;
        colors[idx * 3 + 2] = vertexColor.b;

        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: isDarkMode ? 0.65 : 0.45,
      blending: THREE.NormalBlending,
    });

    const particleWave = new THREE.Points(geometry, material);
    particleWave.position.y = 0.2;
    particleWave.rotation.x = -Math.PI / 8;
    scene.add(particleWave);

    // 2. Floating Luminous Star Dust (Depth Field)
    const starCount = 120;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 40;
      starPositions[i + 1] = (Math.random() - 0.5) * 20 + 2;
      starPositions[i + 2] = (Math.random() - 0.5) * 30;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: coralColor,
      size: 0.18,
      transparent: true,
      opacity: 0.35,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 3. Subtle dynamic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff4d31, 2, 40);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Mouse follow interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.001;
      mouseY = (e.clientY - windowHalfY) * 0.001;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 6;
      camera.position.y = 8 + targetY * 3;
      camera.lookAt(0, 0, 0);

      // Animate undulating 3D wave mathematics
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      let pIdx = 0;
      for (let i = 0; i < gridCols; i++) {
        for (let j = 0; j < gridRows; j++) {
          const x = posArray[pIdx * 3];
          const z = posArray[pIdx * 3 + 2];

          // Dual harmonic wave function + localized ripple
          const wave1 = Math.sin(x * 0.35 + elapsed * 1.4) * 0.7;
          const wave2 = Math.cos(z * 0.4 + elapsed * 1.1) * 0.6;
          const ripple = Math.sin(Math.sqrt(x * x + z * z) * 0.5 - elapsed * 2) * 0.35;

          posArray[pIdx * 3 + 1] = wave1 + wave2 + ripple;
          pIdx++;
        }
      }
      posAttr.needsUpdate = true;

      // Gentle floating dust rotation
      starField.rotation.y = elapsed * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-90 transition-opacity duration-500"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
