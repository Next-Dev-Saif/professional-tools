'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, RoundedBox, Float } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

/**
 * LiveDocScene — Interactive 3D document scene for the How-it-Works section.
 *
 * Renders a clipboard-style document holder with stacked pages.
 * Users can orbit/rotate. Auto-rotates slowly until the user interacts.
 * Pure geometry — no external texture assets.
 */

function DocumentStack() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.25) * 0.12;
  });

  const pageW = 3.2;
  const pageH = 4.5;
  const lineColor = '#d1daf2';
  const accentBlue = new THREE.Color('#2563eb');
  const boardColor = new THREE.Color('#5c3d1e');

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Clipboard board */}
      <RoundedBox
        args={[pageW + 0.55, pageH + 0.75, 0.14]}
        radius={0.1}
        smoothness={4}
        position={[0, 0, -0.18]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={boardColor} roughness={0.82} metalness={0.08} />
      </RoundedBox>

      {/* Metal clip */}
      <group position={[0, pageH / 2 + 0.16, -0.08]}>
        <mesh castShadow>
          <boxGeometry args={[pageW * 0.38, 0.28, 0.28]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.25} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.1, 0.12]} rotation={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[pageW * 0.28, 0.38, 0.05]} />
          <meshStandardMaterial color="#a3a3a3" roughness={0.35} metalness={0.75} />
        </mesh>
      </group>

      {/* Page shadow pages (back) */}
      {[0.04, 0.02].map((z, i) => (
        <mesh key={i} position={[i * 0.03 - 0.02, 0, z - 0.04]} castShadow receiveShadow>
          <planeGeometry args={[pageW, pageH]} />
          <meshStandardMaterial color="#edf2ff" roughness={0.6} side={THREE.FrontSide} />
        </mesh>
      ))}

      {/* Main front page */}
      <mesh position={[0, 0, 0.04]} castShadow receiveShadow>
        <planeGeometry args={[pageW, pageH]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.02} />
      </mesh>

      {/* Header stripe */}
      <mesh position={[0, pageH / 2 - 0.38, 0.06]}>
        <planeGeometry args={[pageW, 0.62]} />
        <meshStandardMaterial color={accentBlue} roughness={0.3} />
      </mesh>

      {/* Header text lines (white bars on blue) */}
      {[0, -0.18].map((y, i) => (
        <mesh key={i} position={[i === 1 ? -0.3 : 0, pageH / 2 - 0.38 + y, 0.07]}>
          <planeGeometry args={[i === 1 ? 1.6 : 2.2, 0.09]} />
          <meshStandardMaterial color="white" opacity={0.6} transparent roughness={0.5} />
        </mesh>
      ))}

      {/* Body content lines */}
      {Array.from({ length: 11 }, (_, i) => {
        const y = pageH / 2 - 0.95 - i * 0.32;
        const isShort = i % 4 === 3;
        return (
          <mesh key={i} position={[isShort ? -0.35 : 0, y, 0.06]}>
            <planeGeometry args={[isShort ? 1.9 : 2.8, 0.075]} />
            <meshStandardMaterial color={lineColor} roughness={0.6} opacity={0.9} transparent />
          </mesh>
        );
      })}

      {/* Section divider */}
      <mesh position={[0, -0.55, 0.061]}>
        <planeGeometry args={[pageW - 0.3, 0.015]} />
        <meshStandardMaterial color="#c7d5f0" roughness={0.5} />
      </mesh>

      {/* Bottom status badge */}
      <RoundedBox args={[0.9, 0.24, 0.025]} radius={0.06} smoothness={4} position={[-0.9, -pageH / 2 + 0.3, 0.07]}>
        <meshStandardMaterial color={accentBlue} roughness={0.3} opacity={0.8} transparent />
      </RoundedBox>
    </group>
  );
}

export function LiveDocScene() {
  return (
    <div className="w-full h-full bg-background">
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 8], fov: 40 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.0} />
          <pointLight position={[7, 10, 9]} intensity={2.6} color="#ffffff" />
          <pointLight position={[-5, 3, 5]} intensity={0.6} color="#93c5fd" />

          <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.18}>
            <DocumentStack />
          </Float>

          <ContactShadows
            position={[0, -3.2, 0]}
            opacity={0.18}
            scale={14}
            blur={2.5}
            far={5}
            frames={1}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
