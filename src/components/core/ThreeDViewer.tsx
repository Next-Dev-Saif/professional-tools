'use client';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Environment, RoundedBox, Html } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { a, useSpring } from '@react-spring/three';

const A4_ASPECT = 1.414;

function PageMesh({ texture, index, currentPage, totalPages, width, height }: { texture: THREE.Texture, index: number, currentPage: number, totalPages: number, width: number, height: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.PlaneGeometry>(null);
  
  const isFlipped = index < currentPage;

  const { flipProgress, zPosition } = useSpring({
    flipProgress: isFlipped ? 1 : 0,
    // Slightly offset Z so pages stack nicely.
    zPosition: isFlipped ? -0.15 - (index * 0.001) : (totalPages - index) * 0.001,
    config: { mass: 1, tension: 120, friction: 20 }
  });

  useFrame(() => {
    const progress = flipProgress.get();
    
    // Origin is strictly at the top. We rotate over the clip.
    if (groupRef.current) {
      groupRef.current.rotation.x = progress * -Math.PI;
    }

    if (planeRef.current) {
      const pos = planeRef.current.attributes.position;
      
      // The curve morph peaks at the middle of the flip (progress = 0.5)
      const bendAmount = Math.sin(progress * Math.PI); 
      
      for (let i = 0; i < pos.count; i++) {
         const x = pos.getX(i);
         const y = pos.getY(i);
         
         const baseZ = Math.sin(x * 0.8) * 0.08 + Math.cos(y * 0.5) * 0.04;
         
         // normalizedY is 0 at the top hinge, 1 at the bottom edge
         const normalizedY = (height / 2 - y) / height; 
         
         // Morph the paper to curve towards the camera during the flip,
         // simulating the flexible droop of real paper.
         const foldZ = Math.pow(normalizedY, 2) * bendAmount * 2.5; 
         
         pos.setZ(i, baseZ + foldZ);
      }
      planeRef.current.computeVertexNormals();
      pos.needsUpdate = true;
    }
  });

  return (
    <a.group 
      ref={groupRef}
      // Pivot is exactly at the top edge of the page mesh. No sliding!
      position-x={0}
      position-y={height / 2}
      position-z={zPosition}
    >
      <mesh position={[0, -height / 2, 0]} castShadow receiveShadow frustumCulled={false}>
        <planeGeometry ref={planeRef} args={[width, height, 32, 32]} />
        <meshStandardMaterial 
          map={texture} 
          color="#ffffff"
          roughness={0.4} 
          metalness={0.1}
          side={THREE.DoubleSide} 
        />
      </mesh>
    </a.group>
  );
}

function ClipboardScene({ textureUrl, aspect, currentPage }: { textureUrl: string, aspect: number, currentPage: number }) {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const numPages = Math.max(1, Math.ceil(aspect / A4_ASPECT));
  const repeatY = A4_ASPECT / aspect; 

  const pageTextures = useMemo(() => {
    const textures = [];
    for (let i = 0; i < numPages; i++) {
      const t = texture.clone();
      t.needsUpdate = true;
      t.repeat.set(1, repeatY);
      t.offset.set(0, 1 - (i + 1) * repeatY);
      textures.push(t);
    }
    return textures;
  }, [texture, numPages, repeatY]);

  const width = 4.2;
  const height = width * A4_ASPECT;

  return (
    <group>
      {/* The board (clipboard backing) */}
      <RoundedBox 
        args={[width + 0.6, height + 0.8, 0.1]} 
        radius={0.1} 
        smoothness={4} 
        position={[0, 0, -0.2]} 
        castShadow 
        receiveShadow
      >
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} metalness={0.1} />
      </RoundedBox>

      {/* The metal clip at the top */}
      <group position={[0, height / 2 + 0.2, -0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width * 0.4, 0.3, 0.3]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.1, 0.1]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[width * 0.3, 0.4, 0.05]} />
          <meshStandardMaterial color="#a3a3a3" roughness={0.4} metalness={0.7} />
        </mesh>
      </group>

      {/* The Stack of Pages */}
      {pageTextures.map((tex, index) => (
        <PageMesh 
          key={index}
          texture={tex} 
          index={index} 
          currentPage={currentPage}
          totalPages={numPages}
          width={width} 
          height={height} 
        />
      ))}
    </group>
  );
}

export function ThreeDViewer({ textureUrl, aspect = 1.414 }: { textureUrl: string, aspect?: number }) {
  const [currentPage, setCurrentPage] = useState(0);
  const numPages = Math.max(1, Math.ceil(aspect / A4_ASPECT));

  if (!textureUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-foreground/50 text-sm">
        <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></span>
        Generating Document Texture...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
          <Environment preset="city" />
          
          <OrbitControls makeDefault minDistance={3} maxDistance={12} />
          
          <group position={[0, 0, 0]}>
            <ClipboardScene textureUrl={textureUrl} aspect={aspect} currentPage={currentPage} />
          </group>

          <ContactShadows position={[0, -3.5, 0]} opacity={0.3} scale={20} blur={2} far={4.5} />
        </Suspense>
      </Canvas>

      {/* 2D Pagination UI Overlay - Fixed to avoid camera drag interference */}
      {numPages > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-border shadow-2xl z-50">
          <button 
            className="text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold px-2 py-1"
            disabled={currentPage === 0} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            &larr; Prev
          </button>
          <span className="text-sm font-semibold tracking-wide min-w-[5rem] text-center">
            {currentPage + 1} / {numPages}
          </span>
          <button 
            className="text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold px-2 py-1"
            disabled={currentPage === numPages - 1} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
