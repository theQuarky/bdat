import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group } from 'three';
import { createCloudPositions } from './sceneUtils';

const TrailScene = () => {
  const cloudPositions = useMemo(() => createCloudPositions(), []);
  const cloudGroup = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (cloudGroup.current) {
      cloudGroup.current.position.x = Math.sin(elapsed * 0.4) * 0.35;
    }
  });

  return (
    <group>
      <mesh position={[0, -1.2, 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 12, 1, 1]} />
        <meshStandardMaterial color="#171f39" />
      </mesh>

      <mesh position={[0, -0.35, 0.4]} rotation={[0, 0.18, 0]} scale={[4.4, 0.22, 1.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4b4d70" />
      </mesh>
      <mesh position={[0.3, -0.25, -0.7]} rotation={[0, 0.2, 0]} scale={[3.3, 0.18, 1.25]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6c5f5d" />
      </mesh>
      <mesh position={[-0.2, -0.1, -2.7]} rotation={[0, 0.1, 0]} scale={[2.5, 0.14, 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#7f6d5a" />
      </mesh>

      <group ref={cloudGroup}>
        {cloudPositions.map((position, index) => (
          <mesh key={index} position={[position[0], position[1], position[2]]} scale={[1.5, 0.4, 0.65]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial color="#d9dce4" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 0.8, -3.4]} scale={[3.6, 0.03, 1.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d2be9b" />
      </mesh>
    </group>
  );
};

export default TrailScene;
