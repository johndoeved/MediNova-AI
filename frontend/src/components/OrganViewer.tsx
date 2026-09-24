"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface OrganProps {
  activeOrgan: string;
  condition?: string | null;
  pulseRate?: number;
}

function HologramOrgan({ activeOrgan, condition, pulseRate = 72 }: OrganProps) {
  const meshRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const warningRef = useRef<THREE.Mesh>(null);

  const speedMultiplier = pulseRate / 72;

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate the organ and trigger breathing animations if applicable
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsedTime * 0.2;
      
      if (activeOrgan === "Lungs") {
        // Slow smooth breathing expansion
        const breath = 1.0 + Math.sin(elapsedTime * 2) * 0.06;
        meshRef.current.scale.set(breath, breath, breath);
      }
    }

    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y = elapsedTime * 0.3 * speedMultiplier;
      coreMeshRef.current.rotation.x = elapsedTime * 0.1 * speedMultiplier;

      if (activeOrgan === "Heart") {
        // Pulse rate based heartbeat expansion
        const pulseSpeed = Math.PI * (pulseRate / 60);
        const pulse = 1.0 + Math.sin(elapsedTime * pulseSpeed) * 0.05;
        coreMeshRef.current.scale.set(pulse, pulse, pulse);
      }
    }

    if (outerMeshRef.current) {
      outerMeshRef.current.rotation.y = -elapsedTime * 0.12;
      outerMeshRef.current.rotation.z = elapsedTime * 0.15;
    }

    if (warningRef.current) {
      const blink = 0.4 + Math.sin(elapsedTime * 9) * 0.5;
      if (warningRef.current.material) {
        (warningRef.current.material as any).opacity = blink;
      }
    }
  });

  // ───── HEART ─────
  if (activeOrgan === "Heart") {
    const isTachy = condition === "heart_tachycardia";
    const isSeptal = condition === "heart_septal_defect";
    const highlight = isTachy || isSeptal;

    return (
      <group ref={meshRef}>
        <mesh ref={outerMeshRef}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color={highlight ? (isSeptal ? "#06b6d4" : "#f59e0b") : "#06b6d4"}
            wireframe
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <Sphere args={[1.0, 64, 64]} ref={coreMeshRef}>
          <MeshDistortMaterial
            color={highlight ? (isSeptal ? "#0284c7" : "#ef4444") : "#f43f5e"}
            roughness={0.1}
            metalness={0.9}
            distort={highlight ? 0.48 : 0.4}
            speed={isTachy ? 3.5 : 2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </Sphere>

        {isTachy && (
          <group position={[0.35, 0.15, 0.75]}>
            <mesh ref={warningRef}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} />
            </mesh>
          </group>
        )}

        {isSeptal && (
          <group position={[0.0, 0.0, 0.65]}>
            <mesh>
              <torusGeometry args={[0.15, 0.03, 16, 32]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
            <mesh ref={warningRef}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
            </mesh>
          </group>
        )}

        <pointLight position={[0, 0, 0]} intensity={highlight ? 2.5 : 1.5} color={highlight ? (isSeptal ? "#06b6d4" : "#f59e0b") : "#ec4899"} />
      </group>
    );
  }

  // ───── BRAIN ─────
  if (activeOrgan === "Brain") {
    const isAneurysm = condition === "brain_aneurysm";

    return (
      <group ref={meshRef}>
        <mesh ref={outerMeshRef}>
          <sphereGeometry args={[1.6, 24, 24]} />
          <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.08} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Hemisphere structures */}
        <group>
          {/* Left Hemisphere */}
          <mesh position={[-0.42, 0.1, 0]}>
            <sphereGeometry args={[0.74, 32, 32]} />
            <MeshDistortMaterial color={isAneurysm ? "#6d28d9" : "#8b5cf6"} distort={0.16} speed={1.2} roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Right Hemisphere */}
          <mesh position={[0.42, 0.1, 0]}>
            <sphereGeometry args={[0.74, 32, 32]} />
            <MeshDistortMaterial color={isAneurysm ? "#6d28d9" : "#8b5cf6"} distort={0.16} speed={1.2} roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Cerebellum */}
          <mesh position={[0, -0.42, -0.42]}>
            <sphereGeometry args={[0.48, 16, 16]} />
            <meshStandardMaterial color="#6d28d9" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Brainstem */}
          <mesh position={[0, -0.75, -0.32]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.12, 0.55, 16]} />
            <meshStandardMaterial color="#5b21b6" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {isAneurysm && (
          <group position={[-0.55, 0.42, 0.38]}>
            <mesh ref={warningRef}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
            </mesh>
          </group>
        )}

        <pointLight position={[0, 0, 0]} intensity={isAneurysm ? 2.5 : 1.5} color={isAneurysm ? "#ef4444" : "#a78bfa"} />
      </group>
    );
  }

  // ───── LUNGS ─────
  if (activeOrgan === "Lungs") {
    const isNodule = condition === "lung_nodule";

    return (
      <group ref={meshRef}>
        <mesh ref={outerMeshRef}>
          <sphereGeometry args={[1.7, 24, 24]} />
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.06} blending={THREE.AdditiveBlending} />
        </mesh>

        <group>
          {/* Left Lung */}
          <mesh position={[-0.48, 0, 0]} rotation={[0, 0, 0.12]}>
            <capsuleGeometry args={[0.38, 0.75, 16, 32]} />
            <MeshDistortMaterial color="#06b6d4" distort={0.1} speed={0.8} roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Right Lung */}
          <mesh position={[0.48, 0, 0]} rotation={[0, 0, -0.12]}>
            <capsuleGeometry args={[0.38, 0.75, 16, 32]} />
            <MeshDistortMaterial color="#06b6d4" distort={0.1} speed={0.8} roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Trachea */}
          <mesh position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.55, 16]} />
            <meshStandardMaterial color="#0891b2" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {isNodule && (
          <group position={[0.46, -0.28, 0.32]}>
            <mesh ref={warningRef}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
            </mesh>
          </group>
        )}

        <pointLight position={[0, 0, 0]} intensity={isNodule ? 2.5 : 1.5} color={isNodule ? "#ef4444" : "#22d3ee"} />
      </group>
    );
  }

  // ───── KIDNEYS ─────
  if (activeOrgan === "Kidneys") {
    const isStone = condition === "kidney_stone";

    return (
      <group ref={meshRef}>
        <mesh ref={outerMeshRef}>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshBasicMaterial color="#f59e0b" wireframe transparent opacity={0.08} blending={THREE.AdditiveBlending} />
        </mesh>

        <group>
          {/* Left Kidney */}
          <mesh position={[-0.45, -0.08, 0]} rotation={[0, 0.1, 0.32]}>
            <capsuleGeometry args={[0.28, 0.52, 16, 32]} />
            <MeshDistortMaterial color="#f59e0b" distort={0.14} speed={1.1} roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Right Kidney */}
          <mesh position={[0.45, -0.08, 0]} rotation={[0, -0.1, -0.32]}>
            <capsuleGeometry args={[0.28, 0.52, 16, 32]} />
            <MeshDistortMaterial color="#f59e0b" distort={0.14} speed={1.1} roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {isStone && (
          <group position={[-0.42, -0.12, 0.26]}>
            <mesh ref={warningRef}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} />
            </mesh>
          </group>
        )}

        <pointLight position={[0, 0, 0]} intensity={isStone ? 2.5 : 1.5} color={isStone ? "#ffffff" : "#fbbf24"} />
      </group>
    );
  }

  // ───── LIVER ─────
  if (activeOrgan === "Liver") {
    const isLesion = condition === "liver_lesion";

    return (
      <group ref={meshRef}>
        <mesh ref={outerMeshRef}>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.06} blending={THREE.AdditiveBlending} />
        </mesh>

        <group>
          {/* Main lobe */}
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, -0.42]}>
            <sphereGeometry args={[0.85, 32, 32]} />
            <MeshDistortMaterial color="#10b981" distort={0.22} speed={1.2} roughness={0.25} metalness={0.75} />
          </mesh>
          {/* Left smaller lobe */}
          <mesh position={[-0.48, -0.12, 0.08]} rotation={[0, 0.32, 0.32]}>
            <sphereGeometry args={[0.58, 16, 16]} />
            <meshStandardMaterial color="#059669" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {isLesion && (
          <group position={[0.26, -0.08, 0.36]}>
            <mesh ref={warningRef}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
            </mesh>
          </group>
        )}

        <pointLight position={[0, 0, 0]} intensity={isLesion ? 2.5 : 1.5} color={isLesion ? "#ef4444" : "#34d399"} />
      </group>
    );
  }

  // Fallback to simple sphere
  return (
    <Sphere args={[1.0, 32, 32]} ref={coreMeshRef}>
      <meshStandardMaterial color="#3b82f6" />
    </Sphere>
  );
}

export default function OrganViewer({ activeOrgan, condition, pulseRate = 72 }: OrganProps) {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-cyan-500/5 to-transparent rounded-full filter blur-2xl pointer-events-none" />
      
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} className="w-full h-full cursor-grab active:cursor-grabbing">
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#06b6d4" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
        
        <HologramOrgan activeOrgan={activeOrgan} condition={condition} pulseRate={pulseRate} />
        
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
