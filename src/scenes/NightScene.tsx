import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useLayoutEffect } from 'react';
import { InstancedMesh, Matrix4, Mesh } from 'three';
import { createStarField } from './sceneUtils';

const NightScene = () => {
  const stars = useMemo(() => createStarField(), []);
  const moonRef = useRef<Mesh>(null);
  const starGroup = useRef<InstancedMesh>(null);
  const starMatrices = useMemo(
    () =>
      stars.map((position) => {
        const matrix = new Matrix4();
        matrix.makeTranslation(position[0], position[1], position[2]);
        return matrix;
      }),
    [stars]
  );

  useLayoutEffect(() => {
    if (!starGroup.current) {
      return;
    }

    starMatrices.forEach((matrix, index) => {
      starGroup.current!.setMatrixAt(index, matrix);
    });
    starGroup.current.instanceMatrix.needsUpdate = true;
  }, [starMatrices]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (moonRef.current) {
      moonRef.current.position.y = 2.4 + Math.sin(time * 0.25) * 0.08;
    }
    if (starGroup.current) {
      starGroup.current.rotation.y = Math.sin(time * 0.04) * 0.02;
    }
  });

  return (
    <group>
      <instancedMesh ref={starGroup} args={[undefined, undefined, stars.length]} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#fafafa" toneMapped={false} />
      </instancedMesh>

      <mesh ref={moonRef} position={[2.8, 2.5, -6]}>
        <sphereGeometry args={[1.1, 20, 20]} />
        <meshStandardMaterial color="#dfe9f8" emissive="#a9c6ff" emissiveIntensity={0.8} roughness={0.3} metalness={0.2} />
      </mesh>

      <group position={[0, -1.7, -2]}>
        <mesh position={[-3.2, 0, -1]} scale={[3.8, 0.5, 1.8]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#101725" />
        </mesh>
        <mesh position={[2.8, 0, -3]} scale={[3.2, 0.5, 2.4]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#101e2f" />
        </mesh>
      </group>
    </group>
  );
};

export default NightScene;
