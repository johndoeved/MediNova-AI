"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function HologramOrgan() {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsedTime * 0.3;
      meshRef.current.rotation.x = elapsedTime * 0.1;
    }
    if (outerMeshRef.current) {
      outerMeshRef.current.rotation.y = -elapsedTime * 0.15;
      outerMeshRef.current.rotation.z = elapsedTime * 0.2;
    }
  });

  return (
    <group>
      {/* Outer Scanning Ring/Sphere */}
      <mesh ref={outerMeshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main Stylized Organ Core (Glowing Crimson/Magenta) */}
      <Sphere args={[1.0, 64, 64]} ref={meshRef}>
        <MeshDistortMaterial
          color="#f43f5e"
          roughness={0.1}
          metalness={0.9}
          distort={0.4}
          speed={2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      {/* Internal Core Light */}
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#ec4899" />
    </group>
  );
}

export default function ThreeHeart() {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-cyan-500/5 to-transparent rounded-full filter blur-2xl pointer-events-none" />
      
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} className="w-full h-full cursor-grab active:cursor-grabbing">
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#06b6d4" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
        
        <HologramOrgan />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          maxDistance={6} 
          minDistance={2} 
        />
      </Canvas>
    </div>
  );
}
