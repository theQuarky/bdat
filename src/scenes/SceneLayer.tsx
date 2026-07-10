// src/scenes/SceneLayer.tsx
import { ReactNode, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Material, MathUtils, Mesh } from 'three';

interface SceneLayerProps {
  index: number;
  activeStage: number;
  children: ReactNode;
}

// Higher = snappier crossfade.
const FADE_LAMBDA = 3.5;

/**
 * Wraps a scene and fades all of its materials in/out based on whether this
 * layer is the active stage. Each material's *designed* opacity is captured
 * once (so translucent things like water/clouds keep their intended look),
 * and the group is hidden entirely once fully faded to avoid z-fighting and
 * wasted draws.
 */
const SceneLayer = ({ index, activeStage, children }: SceneLayerProps) => {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const isActive = index === activeStage;
    let maxOpacity = 0;

    group.traverse((object) => {
      const mesh = object as Mesh;
      // Crossfading materials are all `transparent`, and three.js sorts transparent
      // objects by bounding-sphere distance rather than per-pixel depth — unreliable
      // for large overlapping ground planes, so the outgoing scene can flicker in
      // front of the incoming one. Pin a stable draw order instead: later stages
      // always composite on top of earlier ones. renderOrder isn't inherited from
      // the group, so every descendant needs it set directly.
      object.renderOrder = index;

      if (!mesh.material) return;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material: Material) => {
        // Capture the intended opacity the first time we see this material.
        if (material.userData.baseOpacity === undefined) {
          material.userData.baseOpacity = material.opacity;
          material.transparent = true;
          if (!isActive) material.opacity = 0; // start hidden, no first-frame flash
        }

        const base = material.userData.baseOpacity as number;
        const target = isActive ? base : 0;
        material.opacity = MathUtils.damp(material.opacity, target, FADE_LAMBDA, delta);
        maxOpacity = Math.max(maxOpacity, material.opacity);
      });
    });

    // Skip rendering completely once invisible.
    group.visible = isActive || maxOpacity > 0.01;
  });

  return <group ref={groupRef}>{children}</group>;
};

export default SceneLayer;
