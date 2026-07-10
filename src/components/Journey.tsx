// src/components/Journey.tsx
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { SceneSwitcher } from '../scenes/SceneSwitcher';
import { CameraRig } from './CameraRig';
import { sceneStageColors, scenePositions } from '../utils/constants';

interface JourneyProps {
  prefersReducedMotion: boolean;
  skipAnimation: boolean;
  onComplete: () => void;
}

const Journey = ({ prefersReducedMotion, skipAnimation, onComplete }: JourneyProps) => {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <Canvas
      camera={{ position: [0, -1.4, 14], fov: 35 }}
      dpr={[1, 1.5]}
      style={{
        width: '100vw',
        height: '100dvh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'block',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Initial values; CameraRig animates both every frame. */}
      <color attach="background" args={['#0b1220']} />
      <fog attach="fog" args={['#0b1220', 6, 28]} />
      <ambientLight intensity={0.65} />
      <directionalLight intensity={0.3} position={[6, 10, 6]} />

      <Suspense fallback={null}>
        <CameraRig
          stages={scenePositions}
          skyColors={sceneStageColors}
          prefersReducedMotion={prefersReducedMotion}
          skipAnimation={skipAnimation}
          onStageChange={setActiveStage}
          onComplete={onComplete}
        >
          <SceneSwitcher activeStage={activeStage} />
        </CameraRig>
      </Suspense>
    </Canvas>
  );
};

export default Journey;