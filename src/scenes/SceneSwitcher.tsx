// src/scenes/SceneSwitcher.tsx
import NightScene from './NightScene';
import ForestScene from './ForestScene';
import SummitScene from './SummitScene';
import SceneLayer from './SceneLayer';

interface SceneSwitcherProps {
  activeStage: number;
}

// Order MUST match scenePositions / sceneStageColors in constants.ts.
const SCENES = [NightScene, ForestScene, SummitScene];

const SceneSwitcher = ({ activeStage }: SceneSwitcherProps) => {
  return (
    <>
      {SCENES.map((Scene, index) => (
        <SceneLayer key={index} index={index} activeStage={activeStage}>
          <Scene />
        </SceneLayer>
      ))}
    </>
  );
};

export { SceneSwitcher };