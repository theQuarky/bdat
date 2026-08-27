// src/scenes/SummitScene.tsx
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group, Mesh } from 'three';
import { createConfettiPositions } from './sceneUtils';

const SPRINKLE_COLORS = ['#ff6b9d', '#7ab6ff', '#ffd93d', '#c77dff', '#ffffff'];
const SPRINKLE_COUNT = 10;

const SummitScene = () => {
  const confettiPositions = useMemo(() => createConfettiPositions(), []);
  const balloonGroup = useRef<Group>(null);
  const confettiGroup = useRef<Group>(null);
  const flameRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (balloonGroup.current) {
      balloonGroup.current.position.y = 1.7 + Math.sin(elapsed * 0.8) * 0.08;
    }
    if (confettiGroup.current) {
      confettiGroup.current.rotation.y = elapsed * 0.12;
    }
    if (flameRef.current) {
      const flicker = 1 + Math.sin(elapsed * 14) * 0.1 + Math.sin(elapsed * 27) * 0.05;
      flameRef.current.scale.set(flicker * 0.9, flicker * 1.15, flicker * 0.9);
      flameRef.current.rotation.z = Math.sin(elapsed * 9) * 0.18;
    }
  });

  return (
    <group>
      <mesh position={[0, -1.1, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 12, 1, 1]} />
        <meshBasicMaterial color="#f2e4cc" />
      </mesh>

      {/* Birthday cake: plate, two frosted tiers, sprinkles, candle + flame. */}
      <mesh position={[0, 0.28, -1.1]} scale={[1.35, 0.06, 1.35]}>
        <cylinderGeometry args={[1, 1, 1, 28]} />
        <meshBasicMaterial color="#f6efe2" />
      </mesh>

      <mesh position={[0, 0.56, -1.1]}>
        <cylinderGeometry args={[0.62, 0.68, 0.5, 28]} />
        <meshBasicMaterial color="#f8b4c6" />
      </mesh>
      <mesh position={[0, 0.82, -1.1]}>
        <cylinderGeometry args={[0.665, 0.665, 0.08, 28]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0, 1.06, -1.1]}>
        <cylinderGeometry args={[0.42, 0.47, 0.42, 28]} />
        <meshBasicMaterial color="#fff3e4" />
      </mesh>
      <mesh position={[0, 1.28, -1.1]}>
        <cylinderGeometry args={[0.45, 0.45, 0.06, 28]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {Array.from({ length: SPRINKLE_COUNT }, (_, index) => {
        const angle = (index / SPRINKLE_COUNT) * Math.PI * 2;
        const radius = 0.64;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * radius, 0.74 + (index % 2) * 0.05, -1.1 + Math.sin(angle) * radius]}
            scale={[0.035, 0.035, 0.035]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={SPRINKLE_COLORS[index % SPRINKLE_COLORS.length]} />
          </mesh>
        );
      })}

      <mesh position={[0, 1.46, -1.1]}>
        <cylinderGeometry args={[0.032, 0.032, 0.3, 8]} />
        <meshBasicMaterial color="#7ab6ff" />
      </mesh>

      <mesh ref={flameRef} position={[0, 1.68, -1.1]}>
        <coneGeometry args={[0.045, 0.13, 8]} />
        <meshBasicMaterial color="#ffcf5c" />
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
        position={[0, 2.2, -0.9]}
        fontSize={0.26}
        maxWidth={6}
        lineHeight={1.2}
        letterSpacing={0.02}
        textAlign="center"
        color="#272b3a"
        outlineWidth={0.01}
        outlineColor="#ffffff"
        outlineOpacity={0.8}
      >
        Happy Birthday Seby
      </Text>

      <Text
        position={[0, 1.87, -0.9]}
        fontSize={0.17}
        maxWidth={6}
        lineHeight={1.2}
        letterSpacing={0.03}
        textAlign="center"
        color="#4a3f2f"
        outlineWidth={0.006}
        outlineColor="#ffffff"
        outlineOpacity={0.7}
      >
        Have a great life ahead
      </Text>
    </group>
  );
};

export default SummitScene;