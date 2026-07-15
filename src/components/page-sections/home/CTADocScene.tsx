'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

/**
 * CTADocScene — Ultra-lightweight 3D scene for the CTA section.
 *
 * No Environment HDR, no shadows, no ContactShadows.
 * Just a handful of floating geometry cards lit with manual point lights.
 * Renders in <16ms per frame with zero external asset loading.
 */

function CTACard({
  position,
  rotation,
  delay,
  accentHex,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  delay: number;
  accentHex: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const accent = new THREE.Color(accentHex);
  const base = new THREE.Color('#fff7ed');

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() + delay;
    ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.1;
    ref.current.rotation.z = rotation[2] + Math.sin(t * 0.38) * 0.015;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {/* Card body */}
      <RoundedBox args={[2.0, 2.8, 0.07]} radius={0.08} smoothness={3}>
        <meshStandardMaterial color={base} roughness={0.28} metalness={0.04} />
      </RoundedBox>
      {/* Header bar */}
      <mesh position={[0, 1.1, 0.04]}>
        <planeGeometry args={[2.0, 0.5]} />
        <meshStandardMaterial color={accent} roughness={0.35} />
      </mesh>
      {/* Content lines */}
      {[0.42, 0.18, -0.08, -0.34, -0.6, -0.86].map((y, i) => (
        <mesh key={i} position={[i % 4 === 3 ? -0.2 : 0, y, 0.04]}>
          <planeGeometry args={[i % 4 === 3 ? 1.2 : 1.7, 0.065]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} opacity={0.8} transparent />
        </mesh>
      ))}
    </group>
  );
}

export function CTADocScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        {/* Manual lights only — no Environment HDR */}
        <ambientLight intensity={1.0} color="#fed7aa" />
        <pointLight position={[4, 6, 6]} intensity={2.5} color="#ffffff" />
        <pointLight position={[-5, -2, 4]} intensity={0.8} color="#fdba74" />
        <pointLight position={[2, -5, 3]} intensity={0.4} color="#fde68a" />

        {/* Back-left */}
        <CTACard
          position={[-2.0, 0.1, -1.0]}
          rotation={[0.05, 0.28, -0.15]}
          delay={1.8}
          accentHex="#f97316"
        />
        {/* Back-right */}
        <CTACard
          position={[1.8, -0.2, -0.8]}
          rotation={[0.04, -0.2, 0.12]}
          delay={0.9}
          accentHex="#f59e0b"
        />
        {/* Center front — hero prominence */}
        <CTACard
          position={[-0.1, 0.1, 1.0]}
          rotation={[0.02, 0.04, -0.03]}
          delay={0}
          accentHex="#ea580c"
        />
      </Suspense>
    </Canvas>
  );
}
