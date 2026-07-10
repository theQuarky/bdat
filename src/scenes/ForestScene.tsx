import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useLayoutEffect } from 'react';
import { Group, InstancedMesh, Matrix4 } from 'three';
import { createTreePositions } from './sceneUtils';

const ForestScene = () => {
  const treePositions = useMemo(() => createTreePositions(), []);
  const birdGroup = useRef<Group>(null);
  const trunkMesh = useRef<InstancedMesh>(null);
  const canopyMesh = useRef<InstancedMesh>(null);

  const trunkMatrices = useMemo(
    () =>
      treePositions.map((position) => {
        const matrix = new Matrix4();
        matrix.makeTranslation(position[0], 0.2, position[2]);
        return matrix;
      }),
    [treePositions]
  );

  const canopyMatrices = useMemo(
    () =>
      treePositions.map((position) => {
        const matrix = new Matrix4();
        matrix.makeTranslation(position[0], 0.75, position[2]);
        return matrix;
      }),
    [treePositions]
  );

  useLayoutEffect(() => {
    if (trunkMesh.current) {
      trunkMatrices.forEach((matrix, index) => trunkMesh.current!.setMatrixAt(index, matrix));
      trunkMesh.current.instanceMatrix.needsUpdate = true;
    }

    if (canopyMesh.current) {
      canopyMatrices.forEach((matrix, index) => canopyMesh.current!.setMatrixAt(index, matrix));
      canopyMesh.current.instanceMatrix.needsUpdate = true;
    }
  }, [trunkMatrices, canopyMatrices]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (birdGroup.current) {
      birdGroup.current.position.x = Math.sin(t * 0.75) * 0.3;
      birdGroup.current.position.y = 1.5 + Math.sin(t * 1.2) * 0.08;
      birdGroup.current.position.z = -5 + Math.cos(t * 0.65) * 0.2;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, -2]}>
        <planeGeometry args={[22, 16, 1, 1]} />
        <meshStandardMaterial color="#111822" />
      </mesh>

      <instancedMesh ref={trunkMesh} args={[undefined, undefined, treePositions.length]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 6]} />
        <meshStandardMaterial color="#4a473c" />
      </instancedMesh>

      <instancedMesh ref={canopyMesh} args={[undefined, undefined, treePositions.length]} castShadow={false} receiveShadow={false}>
        <coneGeometry args={[0.8, 1.8, 8]} />
        <meshStandardMaterial color="#3d4c6d" />
      </instancedMesh>

      <group ref={birdGroup}>
        <mesh position={[-1.4, 1.4, -5.2]} scale={[0.22, 0.12, 0.12]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f3e8d8" />
        </mesh>
        <mesh position={[-0.5, 1.35, -5]} scale={[0.18, 0.1, 0.1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f3e8d8" />
        </mesh>
        <mesh position={[0.3, 1.5, -4.8]} scale={[0.16, 0.08, 0.08]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f3e8d8" />
        </mesh>
      </group>
    </group>
  );
};

export default ForestScene;
