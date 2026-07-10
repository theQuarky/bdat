import NightScene from './NightScene';
import ForestScene from './ForestScene';
import RiverScene from './RiverScene';
import TrailScene from './TrailScene';
import SummitScene from './SummitScene';

const SceneSwitcher = () => {
  return (
    <>
      <NightScene />
      <ForestScene />
      <RiverScene />
      <TrailScene />
      <SummitScene />
    </>
  );
};

export { SceneSwitcher };
