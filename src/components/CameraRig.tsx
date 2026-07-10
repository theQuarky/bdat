import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Color } from 'three';
import type { SceneStagePosition } from '../utils/constants';

interface CameraRigProps {
  children: ReactNode;
  stages: readonly SceneStagePosition[];
  skyColors: readonly { r: number; g: number; b: number }[];
  prefersReducedMotion: boolean;
  skipAnimation: boolean;
  onComplete: () => void;
}

type CameraTarget = {
  x: number;
  y: number;
  z: number;
};

const CameraRig = ({ children, stages, skyColors, prefersReducedMotion, skipAnimation, onComplete }: CameraRigProps) => {
  const { camera, scene } = useThree();
  const skyTarget = useRef({ r: skyColors[0].r, g: skyColors[0].g, b: skyColors[0].b });

  const targetPositions = useMemo<CameraTarget[]>(
    () => stages.map((position) => ({ x: position[0], y: position[1], z: position[2] })),
    [stages]
  );

  useEffect(() => {
    const setBackground = (color: { r: number; g: number; b: number }) => {
      scene.background = new Color(color.r, color.g, color.b);
    };

    if (prefersReducedMotion || skipAnimation) {
      const finalTarget = targetPositions[targetPositions.length - 1];
      camera.position.set(finalTarget.x, finalTarget.y, finalTarget.z);
      setBackground(skyColors[skyColors.length - 1]);
      onComplete();
      return;
    }

    const timeline = gsap.timeline({ defaults: { duration: 2.8, ease: 'power2.out' }, onComplete });

    targetPositions.forEach((target, index) => {
      const skyColor = skyColors[index];
      timeline.to(camera.position, { x: target.x, y: target.y, z: target.z }, index * 2.8);
      timeline.to(skyTarget.current, { r: skyColor.r, g: skyColor.g, b: skyColor.b }, index * 2.8);
      timeline.add(() => {
        scene.background = new Color(skyTarget.current.r, skyTarget.current.g, skyTarget.current.b);
      }, index * 2.8);
    });

    return () => {
      timeline.kill();
    };
  }, [camera, onComplete, prefersReducedMotion, scene, skipAnimation, skyColors, targetPositions]);

  useFrame(() => {
    camera.lookAt(0, 0.2, -4);
  });

  return <>{children}</>;
};

export { CameraRig };
