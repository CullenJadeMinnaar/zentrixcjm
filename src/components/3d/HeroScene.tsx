import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Stars, Text3D, Center, Environment } from "@react-three/drei";
import * as THREE from "three";

function HexagonRing({ radius = 3, count = 6, speed = 0.3 }: { radius?: number; count?: number; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * speed;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
  });

  const hexPositions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number];
    });
  }, [radius, count]);

  return (
    <group ref={groupRef}>
      {hexPositions.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.4, 0.4, 0.08, 6]} />
          <meshStandardMaterial
            color="hsl(174, 72%, 46%)"
            emissive="hsl(174, 72%, 46%)"
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
            wireframe
          />
        </mesh>
      ))}
      {/* Connecting lines */}
      {hexPositions.map((pos, i) => {
        const next = hexPositions[(i + 1) % count];
        const points = [new THREE.Vector3(...pos), new THREE.Vector3(...next)];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`line-${i}`} geometry={geometry}>
            <lineBasicMaterial color="hsl(174, 72%, 46%)" transparent opacity={0.2} />
          </line>
        );
      })}
    </group>
  );
}

function CoreOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 4]} />
        <MeshDistortMaterial
          color="hsl(174, 72%, 30%)"
          emissive="hsl(174, 72%, 46%)"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Inner glow */}
      <mesh scale={0.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="hsl(40, 95%, 60%)"
          emissive="hsl(40, 95%, 60%)"
          emissiveIntensity={0.8}
          transparent
          opacity={0.3}
        />
      </mesh>
    </Float>
  );
}

function DataStreams() {
  const count = 200;
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 6;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    const posArray = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= delta * (0.5 + Math.random() * 0.5);
      if (posArray[i * 3 + 1] < -4) posArray[i * 3 + 1] = 4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color="hsl(174, 72%, 56%)"
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function OrbitingZLetter() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} floatIntensity={0.5}>
        <group position={[0, 0, 0]} scale={0.6}>
          {/* Z shape using boxes */}
          {/* Top bar */}
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.15]} />
            <meshStandardMaterial
              color="hsl(174, 72%, 52%)"
              emissive="hsl(174, 72%, 46%)"
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Diagonal */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.atan2(1.2, 1.2)]}>
            <boxGeometry args={[1.7, 0.12, 0.12]} />
            <meshStandardMaterial
              color="hsl(174, 72%, 52%)"
              emissive="hsl(174, 72%, 46%)"
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Bottom bar */}
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.15]} />
            <meshStandardMaterial
              color="hsl(174, 72%, 52%)"
              emissive="hsl(174, 72%, 46%)"
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Accent dot */}
          <mesh position={[0, -1, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="hsl(40, 95%, 60%)"
              emissive="hsl(40, 95%, 60%)"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="hsl(174, 72%, 56%)" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="hsl(40, 95%, 60%)" />
        <pointLight position={[0, 3, -5]} intensity={0.3} color="hsl(200, 80%, 50%)" />

        <CoreOrb />
        <HexagonRing />
        <HexagonRing radius={5} count={8} speed={-0.15} />
        <DataStreams />
        <OrbitingZLetter />

        <Stars radius={20} depth={50} count={1000} factor={3} saturation={0} fade speed={1} />
        <Sparkles count={60} size={2} speed={0.4} opacity={0.4} scale={12} color="hsl(174, 72%, 56%)" />
      </Canvas>
    </div>
  );
}
