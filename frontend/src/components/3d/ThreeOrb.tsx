import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeOrbProps {
  progress?: number;
  size?: number;
}

export const ThreeOrb: React.FC<ThreeOrbProps> = ({ progress = 68, size = 160 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Inner Core Orb
    const coreGeo = new THREE.IcosahedronGeometry(1.1, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF4D31'),
      roughness: 0.1,
      metalness: 0.9,
      emissive: new THREE.Color('#FF4D31'),
      emissiveIntensity: 0.45,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Outer Wireframe Lattice
    const wireGeo = new THREE.IcosahedronGeometry(1.35, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#7A8B7C'),
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    // Orbital Energy Ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.03, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF4D31'),
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff4d31, 3, 10);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      coreMesh.rotation.y = elapsed * 0.4;
      coreMesh.rotation.x = elapsed * 0.25;

      wireMesh.rotation.y = -elapsed * 0.25;
      wireMesh.rotation.z = elapsed * 0.15;

      ringMesh.rotation.z = elapsed * 0.8;
      ringMesh.rotation.y = Math.sin(elapsed * 0.5) * 0.3;

      const scalePulse = 1 + Math.sin(elapsed * 2.5) * 0.04;
      coreMesh.scale.set(scalePulse, scalePulse, scalePulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size, progress]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center pointer-events-none select-none"
      style={{ width: size, height: size }}
    />
  );
};
