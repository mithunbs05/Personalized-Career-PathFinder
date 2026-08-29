import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundWaveProps {
  opacity?: number;
  isFixed?: boolean;
  className?: string;
  yOffset?: number;
}

export const ThreeBackgroundWave: React.FC<ThreeBackgroundWaveProps> = ({
  opacity = 0.75,
  isFixed = false,
  className = '',
  yOffset = 0.2,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / (container.clientHeight || window.innerHeight),
      0.1,
      1000
    );
    camera.position.set(0, 9, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight || window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Structured 3D Topographic Wave Grid (Light & Airy Color Tone)
    const gridCols = 60;
    const gridRows = 44;
    const totalParticles = gridCols * gridRows;
    const spacing = 0.85;

    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);

    // Light, luminous color palette
    const coralColor = new THREE.Color('#FF4D31');
    const brightCoral = new THREE.Color('#FF7A59');
    const sageColor = new THREE.Color('#7A8B7C');
    const lightSage = new THREE.Color('#9BB09E');

    let idx = 0;
    for (let i = 0; i < gridCols; i++) {
      for (let j = 0; j < gridRows; j++) {
        const x = (i - gridCols / 2) * spacing;
        const z = (j - gridRows / 2) * spacing;
        const y = 0;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        // Gradient blend: Soft Sage to Radiant Bright Coral in harmonic waves
        const mixRatio = Math.sin((i / gridCols) * Math.PI) * Math.cos((j / gridRows) * Math.PI);
        const baseColor = new THREE.Color().lerpColors(
          lightSage,
          brightCoral,
          Math.max(0, mixRatio * 0.9)
        );

        colors[idx * 3] = baseColor.r;
        colors[idx * 3 + 1] = baseColor.g;
        colors[idx * 3 + 2] = baseColor.b;

        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular soft glow texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const circleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.28,
      map: circleTexture,
      vertexColors: true,
      transparent: true,
      opacity,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const particleWave = new THREE.Points(geometry, material);
    particleWave.position.y = yOffset;
    particleWave.rotation.x = -Math.PI / 8;
    scene.add(particleWave);

    // 2. Light Ambient Star Dust Accent
    const starCount = 80;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 50;
      starPositions[i + 1] = (Math.random() - 0.5) * 25 + 3.5;
      starPositions[i + 2] = (Math.random() - 0.5) * 35;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: brightCoral,
      size: 0.32,
      map: circleTexture,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff4d31, 2, 45);
    pointLight.position.set(0, 12, 10);
    scene.add(pointLight);

    // Mouse follow interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.0008;
      mouseY = (e.clientY - windowHalfY) * 0.0008;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      camera.position.x = targetX * 5.5;
      camera.position.y = 9 + targetY * 2.8;
      camera.lookAt(0, 0, 0);

      // Animate undulating 3D wave mathematics
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      let pIdx = 0;
      for (let i = 0; i < gridCols; i++) {
        for (let j = 0; j < gridRows; j++) {
          const x = posArray[pIdx * 3];
          const z = posArray[pIdx * 3 + 2];

          const wave1 = Math.sin(x * 0.35 + elapsed * 1.3) * 0.75;
          const wave2 = Math.cos(z * 0.4 + elapsed * 1.05) * 0.65;
          const ripple = Math.sin(Math.sqrt(x * x + z * z) * 0.48 - elapsed * 1.8) * 0.35;

          posArray[pIdx * 3 + 1] = wave1 + wave2 + ripple;
          pIdx++;
        }
      }
      posAttr.needsUpdate = true;

      // Gentle floating dust rotation
      starField.rotation.y = elapsed * 0.012;

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
  }, [opacity, yOffset]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none z-0 overflow-hidden select-none ${
        isFixed ? 'fixed inset-0 w-full h-full' : 'absolute inset-0 w-full h-full'
      } ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
