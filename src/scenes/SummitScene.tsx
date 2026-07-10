import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group } from 'three';
import { createCloudPositions, createConfettiPositions } from './sceneUtils';

const SummitScene = () => {
  const cloudPositions = useMemo(() => createCloudPositions(), []);
  const confettiPositions = useMemo(() => createConfettiPositions(), []);
  const balloonGroup = useRef<Group>(null);
  const confettiGroup = useRef<Group>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (balloonGroup.current) {
      balloonGroup.current.position.y = 1.7 + Math.sin(elapsed * 0.8) * 0.08;
    }
    if (confettiGroup.current) {
      confettiGroup.current.rotation.y = elapsed * 0.12;
    }
  });

  return (
    <group>
      <mesh position={[0, -1.1, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 12, 1, 1]} />
        <meshStandardMaterial color="#f2e4cc" />
      </mesh>

      <mesh position={[0, 0.38, -1.1]} scale={[1.2, 0.22, 0.8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#a88f6c" />
      </mesh>
      <mesh position={[0, 0.72, -1.1]} scale={[1, 0.24, 0.7]}>
        <cylinderGeometry args={[0.85, 0.85, 0.46, 20]} />
        <meshStandardMaterial color="#f6d7b1" />
      </mesh>
      <mesh position={[0, 1.1, -1.1]} scale={[0.3, 0.4, 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#d9b284" />
      </mesh>

      <group ref={balloonGroup}>
        {['#f6b26b', '#d88ecb', '#7ab6ff'].map((color, index) => (
          <group key={index} position={[-1 + index * 1, 1.6, -0.2]}>
            <mesh position={[0, 0.2, 0]} scale={[0.35, 0.45, 0.35]}>
              <sphereGeometry args={[0.7, 18, 18]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
            </mesh>
            <mesh position={[0, -0.18, 0]} scale={[0.04, 0.24, 0.04]}>
              <cylinderGeometry args={[1, 1, 1, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      <group ref={confettiGroup}>
        {confettiPositions.map((position, index) => (
          <mesh key={index} position={position} scale={[0.04, 0.04, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={index % 3 === 0 ? '#d89f59' : index % 3 === 1 ? '#7ab6ff' : '#c294d4'} />
          </mesh>
        ))}
      </group>

      <Text
        position={[0, 1.75, -1.0]}
        fontSize={0.32}
        maxWidth={3}
        lineHeight={1.2}
        letterSpacing={0.05}
        textAlign="center"
        color="#272b3a"
      >
        Happy Birthday
      </Text>
    </group>
  );
};

export default SummitScene;
