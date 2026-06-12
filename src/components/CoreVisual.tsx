import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const SHELL_RADIUS = 1.55;
const SHELL_DETAIL = 1;

/** Unique vertex positions of the outer icosahedron shell. */
function useShellVertices(): THREE.Vector3[] {
  return useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(SHELL_RADIUS, SHELL_DETAIL);
    const position = geometry.getAttribute('position');
    const seen = new Set<string>();
    const vertices: THREE.Vector3[] = [];
    for (let i = 0; i < position.count; i += 1) {
      const v = new THREE.Vector3().fromBufferAttribute(position, i);
      const key = `${v.x.toFixed(4)}|${v.y.toFixed(4)}|${v.z.toFixed(4)}`;
      if (!seen.has(key)) {
        seen.add(key);
        vertices.push(v);
      }
    }
    geometry.dispose();
    return vertices;
  }, []);
}

/** Small white node dots pinned to every vertex of the shell. */
function NodeDots() {
  const vertices = useShellVertices();
  const mesh = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    vertices.forEach((vertex, i) => {
      dummy.position.copy(vertex);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [vertices]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, vertices.length]}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
    </instancedMesh>
  );
}

/**
 * "Connected intelligent systems around a core": an outer wireframe
 * icosahedron lattice with white node dots, wrapped around a slowly
 * revolving chrome sphere.
 */
function Core() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.35;
    group.current.rotation.x += delta * 0.12;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={group}>
        {/* Outer wireframe lattice shell */}
        <mesh>
          <icosahedronGeometry args={[SHELL_RADIUS, SHELL_DETAIL]} />
          <meshBasicMaterial
            wireframe
            color="#ffffff"
            transparent
            opacity={0.3}
          />
        </mesh>
        {/* Inner chrome core */}
        <mesh>
          <sphereGeometry args={[0.92, 64, 64]} />
          <meshStandardMaterial
            color="#cfcfcf"
            metalness={1}
            roughness={0.18}
            envMapIntensity={1.2}
          />
        </mesh>
        <NodeDots />
      </group>
    </Float>
  );
}

/**
 * Self-contained monochrome chrome environment: white Lightformer panels
 * baked into a small env map (reflections only, no scene background).
 */
function ChromeEnvironment() {
  return (
    <Environment resolution={256}>
      {/* Large soft overhead panel */}
      <Lightformer
        intensity={2.2}
        color="white"
        position={[0, 5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
      />
      {/* Rim panels left / right */}
      <Lightformer
        intensity={1.6}
        color="white"
        position={[-5, 1, -1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[3, 8, 1]}
      />
      <Lightformer
        intensity={1.6}
        color="white"
        position={[5, -1, -1]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[3, 8, 1]}
      />
      {/* Faint gray front fill for gradient sheen */}
      <Lightformer
        intensity={0.6}
        color="#9a9a9a"
        position={[0, 0, 5]}
        scale={[8, 3, 1]}
      />
    </Environment>
  );
}

export default function CoreVisual() {
  return (
    <div className="h-[340px] w-full md:h-[460px]" aria-hidden="true">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 42 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <Core />
          <ChromeEnvironment />
        </Suspense>
      </Canvas>
    </div>
  );
}
