import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Node3DData {
  id: string;
  title: string;
  category: string;
  status: string;
  x: number;
  y: number;
  z: number;
  isMilestone?: boolean;
}

export const ThreeRoadmapScene: React.FC<{
  nodes?: Node3DData[];
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string;
}> = ({ nodes, onSelectNode, selectedNodeId }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultNodes: Node3DData[] = [
    { id: 'node-1', title: 'Python Core', category: 'Foundations', status: 'completed', x: -6, y: -3, z: 0 },
    { id: 'node-2', title: 'Machine Learning', category: 'Core AI', status: 'completed', x: -3, y: 0, z: 1 },
    { id: 'node-3', title: 'Deep Learning', category: 'PyTorch', status: 'current', x: 0, y: -2, z: -1, isMilestone: true },
    { id: 'node-4', title: 'LLM Fundamentals', category: 'GenAI', status: 'next', x: 3, y: 1, z: 1 },
    { id: 'node-5', title: 'Production RAG', category: 'GenAI', status: 'recommended', x: 6, y: -1, z: 0, isMilestone: true },
    { id: 'node-6', title: 'Autonomous Agents', category: 'AI Systems', status: 'locked', x: 8, y: 3, z: -1, isMilestone: true },
  ];

  const activeNodes = nodes && nodes.length > 0 ? nodes : defaultNodes;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Color definitions strictly in brand colors
    const coralColor = new THREE.Color('#FF4D31');
    const sageColor = new THREE.Color('#7A8B7C');
    const amberColor = new THREE.Color('#F59E0B');

    // Create 3D Nodes
    const sphereMeshes: { mesh: THREE.Mesh; id: string }[] = [];
    const particleStreams: THREE.Points[] = [];

    activeNodes.forEach((node, idx) => {
      const isCompleted = node.status === 'completed';
      const isCurrent = node.status === 'current';
      const isSelected = selectedNodeId === node.id;
      const nodeColor = isCompleted ? sageColor : isCurrent || isSelected ? coralColor : amberColor;

      const size = node.isMilestone ? 0.9 : 0.65;
      const geometry = node.isMilestone ? new THREE.DodecahedronGeometry(size, 1) : new THREE.IcosahedronGeometry(size, 2);
      const material = new THREE.MeshStandardMaterial({
        color: nodeColor,
        roughness: 0.15,
        metalness: 0.85,
        emissive: nodeColor,
        emissiveIntensity: isCurrent || isSelected ? 0.5 : 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.x, node.y, node.z);
      group.add(mesh);
      sphereMeshes.push({ mesh, id: node.id });

      // Pulsing Halo
      const haloGeo = new THREE.TorusGeometry(size * 1.3, 0.03, 16, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: isCurrent ? 0.8 : 0.3,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(node.x, node.y, node.z);
      group.add(halo);
    });

    // 3D Path connecting sequential nodes
    for (let i = 0; i < activeNodes.length - 1; i++) {
      const p1 = new THREE.Vector3(activeNodes[i].x, activeNodes[i].y, activeNodes[i].z);
      const p2 = new THREE.Vector3(activeNodes[i + 1].x, activeNodes[i + 1].y, activeNodes[i + 1].z);

      const curve = new THREE.LineCurve3(p1, p2);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: coralColor,
        transparent: true,
        opacity: 0.5,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tube);

      // Energy particles along the path
      const points = curve.getPoints(25);
      const particleGeo = new THREE.BufferGeometry().setFromPoints(points);
      const particleMat = new THREE.PointsMaterial({
        color: coralColor,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
      });
      const stream = new THREE.Points(particleGeo, particleMat);
      group.add(stream);
      particleStreams.push(stream);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff4d31, 2.5, 40);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);

    // Raycaster for interactive clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sphereMeshes.map((s) => s.mesh));

      if (intersects.length > 0) {
        const hit = sphereMeshes.find((s) => s.mesh === intersects[0].object);
        if (hit && onSelectNode) {
          onSelectNode(hit.id);
        }
      }
    };

    container.addEventListener('click', handleClick);

    // Mouse drag rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      group.rotation.y += deltaX * 0.005;
      group.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating auto-orbit if not dragging
      if (!isDragging) {
        group.rotation.y = Math.sin(elapsed * 0.3) * 0.15;
        group.rotation.x = Math.cos(elapsed * 0.2) * 0.08;
      }

      sphereMeshes.forEach(({ mesh }, i) => {
        mesh.rotation.y += 0.01;
        mesh.rotation.z += 0.005;
        const scale = 1 + Math.sin(elapsed * 2 + i) * 0.05;
        mesh.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeNodes, selectedNodeId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
    />
  );
};
