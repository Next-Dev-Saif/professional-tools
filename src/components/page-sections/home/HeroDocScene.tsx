'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Float } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeroDocScene — Lightweight 3D scene for the home page hero.
 *
 * Renders three floating document cards at different depths/angles
 * using solid geometry and subtle tinting — no texture loading,
 * no async fetch. Pure Three.js geometry so it boots instantly.
 *
 * The camera slowly rotates on the Y axis via useFrame for a
 * cinematic auto-rotate feel without the OrbitControls overhead.
 */

/** A single floating document card */
function DocCard({
  position,
  rotation,
  color,
  accentColor,
  delay,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  accentColor: string;
  delay: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() + delay;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.55) * 0.12;
    groupRef.current.rotation.z = rotation[2] + Math.sin(t * 0.4) * 0.018;
  });

  const cardColor = new THREE.Color(color);
  const accent = new THREE.Color(accentColor);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Card body */}
      <RoundedBox args={[2.4, 3.2, 0.06]} radius={0.07} smoothness={3}>
        <meshStandardMaterial color={cardColor} roughness={0.25} metalness={0.05} />
      </RoundedBox>

      {/* Header stripe */}
      <mesh position={[0, 1.3, 0.04]}>
        <boxGeometry args={[2.4, 0.48, 0.01]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Title line */}
      <mesh position={[0, 0.88, 0.04]}>
        <boxGeometry args={[1.7, 0.1, 0.01]} />
        <meshStandardMaterial color="#c8d6f0" roughness={0.5} />
      </mesh>

      {/* Content lines */}
      {[-0.05, -0.3, -0.55, -0.80, -1.05].map((y, i) => (
        <mesh key={i} position={[i % 3 === 2 ? -0.25 : 0, y, 0.04]}>
          <boxGeometry args={[i % 3 === 2 ? 1.3 : 1.9, 0.065, 0.01]} />
          <meshStandardMaterial color="#dde6f5" roughness={0.6} opacity={0.8} transparent />
        </mesh>
      ))}

      {/* Bottom badge */}
      <RoundedBox args={[0.7, 0.22, 0.02]} radius={0.06} smoothness={4} position={[-0.7, -1.32, 0.05]}>
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.1} opacity={0.85} transparent />
      </RoundedBox>
    </group>
  );
}

/** Slowly drifting camera rig */
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * 0.18;
    camera.position.x = Math.sin(t) * 0.8;
    camera.position.y = 0.3 + Math.cos(t * 0.7) * 0.15;
    camera.lookAt(0, 0.1, 0);
  });
  return null;
}

export function HeroDocScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 0.3, 7.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.1} />
          <pointLight position={[6, 10, 8]} intensity={2.8} color="#ffffff" castShadow={false} />
          <pointLight position={[-6, 2, 4]} intensity={0.8} color="#fdba74" />
          <pointLight position={[2, -4, 6]} intensity={0.4} color="#fde68a" />

          {/* Back card — tilted left, muted */}
          <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.3}>
            <DocCard
              position={[-1.9, -0.1, -1.2]}
              rotation={[0.06, 0.22, -0.14]}
              color="#fff7ed"
              accentColor="#f97316"
              delay={2.1}
            />
          </Float>

          {/* Front-right card — warm accent */}
          <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.25}>
            <DocCard
              position={[1.85, 0.0, -0.4]}
              rotation={[0.04, -0.18, 0.1]}
              color="#ffedd5"
              accentColor="#f59e0b"
              delay={0.8}
            />
          </Float>

          {/* Center card — hero, most prominent */}
          <Float speed={1.3} rotationIntensity={0.04} floatIntensity={0.2}>
            <DocCard
              position={[0, 0.15, 1.1]}
              rotation={[0.02, 0.0, -0.02]}
              color="#ffffff"
              accentColor="#ea580c"
              delay={0}
            />
          </Float>

          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.12}
            scale={12}
            blur={4}
            far={4}
            frames={1}
          />

          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
