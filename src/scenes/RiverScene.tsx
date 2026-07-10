import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BufferGeometry, Mesh } from 'three';
import { createRiverRockPositions } from './sceneUtils';

const RiverScene = () => {
  const rockPositions = useMemo(() => createRiverRockPositions(), []);
  const waterRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (waterRef.current) {
      const geometry = waterRef.current.geometry as BufferGeometry;
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i += 1) {
        const y = Math.sin(i * 0.3 + elapsed * 1.2) * 0.05;
        position.setY(i, y);
      }
      position.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh position={[0, -1.45, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 6, 16, 16]} />
        <meshStandardMaterial color="#2a3f67" roughness={0.4} metalness={0.1} />
      </mesh>

      <mesh position={[0, -1.15, -0.9]} rotation={[-Math.PI / 2, 0, 0]} ref={waterRef}>
        <planeGeometry args={[8, 3.3, 18, 18]} />
        <meshStandardMaterial color="#70a3c9" transparent opacity={0.82} roughness={0.23} metalness={0.2} />
      </mesh>

      <mesh position={[0, -0.33, 1.5]} scale={[4.2, 0.15, 0.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6b5b42" />
      </mesh>
      <mesh position={[-1.5, -0.33, 1.5]} scale={[0.4, 0.15, 0.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6b5b42" />
      </mesh>
      <mesh position={[1.5, -0.33, 1.5]} scale={[0.4, 0.15, 0.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6b5b42" />
      </mesh>

      <mesh position={[2.95, -0.45, -0.2]} rotation={[0, 0.12, 0]} scale={[0.55, 0.55, 0.45]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#324358" />
      </mesh>
      <mesh position={[-2.55, -0.45, -0.1]} rotation={[0, -0.1, 0]} scale={[0.6, 0.6, 0.35]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#324358" />
      </mesh>

      {rockPositions.map((position, index) => (
        <mesh key={index} position={[position[0], -0.9, position[2]]} scale={[0.18, 0.16, 0.18]}>
          <dodecahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#506e86" />
        </mesh>
      ))}

      <mesh position={[0, -0.2, -1.8]} scale={[0.38, 0.05, 2.4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#b88e6d" />
      </mesh>
      <mesh position={[0, -0.15, -1.8]} scale={[0.42, 0.07, 2.6]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d1b7a0" />
      </mesh>
    </group>
  );
};

export default RiverScene;
