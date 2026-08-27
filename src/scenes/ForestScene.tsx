import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useLayoutEffect } from 'react';
import { DoubleSide, Group, InstancedMesh, MathUtils, Matrix4, Mesh, Quaternion, Vector3 } from 'three';
import { createTreePositions, createFlowerPositions, createButterflyPositions, randomRange, Float3 } from './sceneUtils';

const FLOWER_COLORS = ['#ff6b9d', '#ffd93d', '#c77dff', '#ff9f43'];
const BUTTERFLY_COLORS = ['#ff9f43', '#7ab6ff', '#ffd93d'];

// Ground sits at world y = -1.55 (see the ground plane below); trees are
// grounded against that, not floating at some arbitrary local height.
const GROUND_Y = -1.55;
const TRUNK_RADIUS_TOP = 0.09;
const TRUNK_RADIUS_BOTTOM = 0.14;
const TRUNK_BASE_HEIGHT = 1.0;
const CANOPY_BASE_RADIUS = 0.62;
const CANOPY_BASE_HEIGHT = 1.5;
// How far the canopy's base sinks below the trunk top, so the join looks
// planted rather than balanced — but still leaves most of the trunk visible.
const CANOPY_TRUNK_OVERLAP = 0.16;

interface ButterflyProps {
  origin: Float3;
  color: string;
  phase: number;
}

const Butterfly = ({ origin, color, phase }: ButterflyProps) => {
  const group = useRef<Group>(null);
  const leftWing = useRef<Mesh>(null);
  const rightWing = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    const flap = Math.sin(t * 10) * 0.5 + 0.5;
    if (leftWing.current) leftWing.current.rotation.y = MathUtils.lerp(0.25, 1.4, flap);
    if (rightWing.current) rightWing.current.rotation.y = MathUtils.lerp(-0.25, -1.4, flap);
    if (group.current) {
      group.current.position.x = origin[0] + Math.sin(t * 0.6) * 0.7;
      group.current.position.y = origin[1] + Math.sin(t * 1.5) * 0.18;
      group.current.position.z = origin[2] + Math.cos(t * 0.5) * 0.5;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={leftWing} position={[-0.015, 0, 0]}>
        <planeGeometry args={[0.14, 0.1]} />
        <meshBasicMaterial color={color} side={DoubleSide} />
      </mesh>
      <mesh ref={rightWing} position={[0.015, 0, 0]}>
        <planeGeometry args={[0.14, 0.1]} />
        <meshBasicMaterial color={color} side={DoubleSide} />
      </mesh>
    </group>
  );
};

const ForestScene = () => {
  const treePositions = useMemo(() => createTreePositions(), []);
  const flowerPositions = useMemo(() => createFlowerPositions(), []);
  const butterflyPositions = useMemo(() => createButterflyPositions(), []);
  const birdGroup = useRef<Group>(null);
  const trunkMesh = useRef<InstancedMesh>(null);
  const canopyMesh = useRef<InstancedMesh>(null);

  // Per-tree random variation so the forest doesn't read as one shape copy-pasted.
  const treeVariants = useMemo(
    () =>
      treePositions.map(() => ({
        heightScale: randomRange(0.82, 1.28),
        girthScale: randomRange(0.9, 1.15),
        canopyScale: randomRange(0.82, 1.22),
      })),
    [treePositions]
  );

  const trunkMatrices = useMemo(
    () =>
      treePositions.map((position, index) => {
        const { heightScale, girthScale } = treeVariants[index];
        const height = TRUNK_BASE_HEIGHT * heightScale;
        const matrix = new Matrix4();
        matrix.compose(
          new Vector3(position[0], GROUND_Y + height / 2, position[2]),
          new Quaternion(),
          new Vector3(girthScale, heightScale, girthScale)
        );
        return matrix;
      }),
    [treePositions, treeVariants]
  );

  const canopyMatrices = useMemo(
    () =>
      treePositions.map((position, index) => {
        const { heightScale, canopyScale } = treeVariants[index];
        const trunkHeight = TRUNK_BASE_HEIGHT * heightScale;
        const canopyHeight = CANOPY_BASE_HEIGHT * canopyScale;
        const canopyBaseY = GROUND_Y + trunkHeight - CANOPY_TRUNK_OVERLAP;
        const matrix = new Matrix4();
        matrix.compose(
          new Vector3(position[0], canopyBaseY + canopyHeight / 2, position[2]),
          new Quaternion(),
          new Vector3(canopyScale, canopyScale, canopyScale)
        );
        return matrix;
      }),
    [treePositions, treeVariants]
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
        <meshBasicMaterial color="#6cc25c" />
      </mesh>

      <instancedMesh ref={trunkMesh} args={[undefined, undefined, treePositions.length]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[TRUNK_RADIUS_TOP, TRUNK_RADIUS_BOTTOM, TRUNK_BASE_HEIGHT, 8]} />
        <meshBasicMaterial color="#4a2f1c" />
      </instancedMesh>

      <instancedMesh ref={canopyMesh} args={[undefined, undefined, treePositions.length]} castShadow={false} receiveShadow={false}>
        <coneGeometry args={[CANOPY_BASE_RADIUS, CANOPY_BASE_HEIGHT, 8]} />
        <meshBasicMaterial color="#3fa64a" />
      </instancedMesh>

      {flowerPositions.map((position, index) => (
        <group key={index} position={[position[0], -1.55, position[2]]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.16, 5]} />
            <meshBasicMaterial color="#4a8f3c" />
          </mesh>
          <mesh position={[0, 0.17, 0]} scale={[0.09, 0.06, 0.09]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color={FLOWER_COLORS[index % FLOWER_COLORS.length]} />
          </mesh>
        </group>
      ))}

      {butterflyPositions.map((position, index) => (
        <Butterfly
          key={index}
          origin={position}
          color={BUTTERFLY_COLORS[index % BUTTERFLY_COLORS.length]}
          phase={index * 1.7}
        />
      ))}

      <group ref={birdGroup}>
        <mesh position={[-1.4, 1.4, -5.2]} scale={[0.22, 0.12, 0.12]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#f3e8d8" />
        </mesh>
        <mesh position={[-0.5, 1.35, -5]} scale={[0.18, 0.1, 0.1]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#f3e8d8" />
        </mesh>
        <mesh position={[0.3, 1.5, -4.8]} scale={[0.16, 0.08, 0.08]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#f3e8d8" />
        </mesh>
      </group>

      <Text
        position={[0, 2.1, 2]}
        fontSize={0.38}
        maxWidth={7}
        lineHeight={1.2}
        letterSpacing={0.02}
        textAlign="center"
        color="#20361f"
        outlineWidth={0.012}
        outlineColor="#ffffff"
        outlineOpacity={0.85}
      >
        Happy Birthday Seby
      </Text>
    </group>
  );
};

export default ForestScene;
