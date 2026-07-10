// src/components/CameraRig.tsx
import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { Color, PerspectiveCamera } from 'three';
import type { SceneStagePosition } from '../utils/constants';

interface CameraRigProps {
  children: ReactNode;
  stages: readonly SceneStagePosition[];
  skyColors: readonly { r: number; g: number; b: number }[];
  prefersReducedMotion: boolean;
  skipAnimation: boolean;
  onStageChange: (index: number) => void;
  onComplete: () => void;
}

const STAGE_DURATION = 3.6;
// Shorter than STAGE_DURATION so the sky settles well before each stage ends
// and holds its designed color, instead of still drifting toward it when the
// next stage begins. Slower than before so the night → day sunrise color
// shift (paired with NightScene's rising text) reads as a gradual dawn.
const SKY_TRANSITION_DURATION = 2.4;

// The Forest sky (index 1) starts brightening early — during Night's rising-
// text sunrise animation — rather than waiting for the Night→Forest stage
// boundary, so the sky visibly dawns behind the mountains instead of
// snapping to daylight the instant Forest's geometry fades in.
const SKY_START_OVERRIDES: Record<number, number> = { 1: 1.2 };

// The scene was composed for a landscape aspect ratio. On narrower (portrait
// phone) viewports a fixed vertical FOV crops the sides hard — mountains,
// text, and props run off-frame. Widen the FOV as the aspect ratio narrows so
// mobile sees a comparable amount of the scene, capped so it never fisheyes.
const BASE_FOV = 35;
const REFERENCE_ASPECT = 1280 / 800;
const MAX_MOBILE_FOV = 58;

const responsiveFov = (aspect: number) => {
  if (aspect >= REFERENCE_ASPECT) return BASE_FOV;
  const widened = BASE_FOV * Math.sqrt(REFERENCE_ASPECT / aspect);
  return Math.min(MAX_MOBILE_FOV, widened);
};

const CameraRig = ({
  children,
  stages,
  skyColors,
  prefersReducedMotion,
  skipAnimation,
  onStageChange,
  onComplete,
}: CameraRigProps) => {
  const { camera, scene, size } = useThree();

  // Keep the latest callbacks in refs so the timeline effect never rebuilds
  // just because App passed a fresh inline arrow (this is what caused the
  // "mute restarts the flythrough" bug).
  const onCompleteRef = useRef(onComplete);
  const onStageChangeRef = useRef(onStageChange);
  onCompleteRef.current = onComplete;
  onStageChangeRef.current = onStageChange;

  const hasCompleted = useRef(false);

  // The single Color object we mutate every frame. GSAP tweens its r/g/b,
  // useFrame copies it into scene.background and scene.fog.color.
  const skyTarget = useRef(new Color(skyColors[0].r, skyColors[0].g, skyColors[0].b));

  const targetPositions = useMemo(
    () => stages.map((p) => ({ x: p[0], y: p[1], z: p[2] })),
    [stages]
  );

  useEffect(() => {
    const complete = () => {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      onCompleteRef.current();
    };

    // Reduced motion or skip: jump straight to the summit.
    if (prefersReducedMotion || skipAnimation) {
      const final = targetPositions[targetPositions.length - 1];
      camera.position.set(final.x, final.y, final.z);

      const finalSky = skyColors[skyColors.length - 1];
      skyTarget.current.setRGB(finalSky.r, finalSky.g, finalSky.b);

      onStageChangeRef.current(targetPositions.length - 1);
      complete();
      return;
    }

    const timeline = gsap.timeline({
      defaults: { duration: STAGE_DURATION, ease: 'power2.inOut' },
      onComplete: complete,
    });

    targetPositions.forEach((target, index) => {
      const sky = skyColors[index];
      const at = index * STAGE_DURATION;
      const skyAt = SKY_START_OVERRIDES[index] ?? at;

      // Reveal this scene and move the camera + sky toward it at the same time.
      timeline.add(() => onStageChangeRef.current(index), at);
      timeline.to(camera.position, { x: target.x, y: target.y, z: target.z }, at);
      timeline.to(
        skyTarget.current,
        { r: sky.r, g: sky.g, b: sky.b, duration: SKY_TRANSITION_DURATION },
        skyAt
      );
    });

    return () => {
      timeline.kill();
    };
    // Deliberately NOT depending on onComplete / onStageChange — see refs above.
  }, [camera, prefersReducedMotion, skipAnimation, skyColors, targetPositions]);

  useFrame(() => {
    camera.lookAt(0, 0.2, -4);

    // Drive background + fog from the (smoothly tweened) sky target every frame.
    if (scene.background instanceof Color) {
      scene.background.copy(skyTarget.current);
    }
    if (scene.fog) {
      scene.fog.color.copy(skyTarget.current);
    }

    if (camera instanceof PerspectiveCamera) {
      const fov = responsiveFov(size.width / size.height);
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
  });

  return <>{children}</>;
};

export { CameraRig };