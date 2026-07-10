import { useMemo, useState } from 'react';
import Journey from './components/Journey';
import MuteButton from './components/controls/MuteButton';
import SkipButton from './components/controls/SkipButton';
import useAmbientAudio from './hooks/useAmbientAudio';
import useReducedMotion from './hooks/useReducedMotion';

const App = () => {
  const prefersReducedMotion = useReducedMotion();
  const { muted, toggleMuted, ensureAudio } = useAmbientAudio();
  const [skipAnimation, setSkipAnimation] = useState(false);

  const bannerText = useMemo(() => {
    return skipAnimation
      ? 'The summit awaits — animation complete.'
      : 'A cinematic mountain ascent for a memorable birthday.';
  }, [skipAnimation]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-night text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-night/95 to-transparent" />
      <div className="absolute inset-x-0 top-6 z-20 flex items-center justify-between px-4 sm:px-8">
        <SkipButton
          onSkip={() => {
            ensureAudio();
            setSkipAnimation(true);
          }}
          disabled={skipAnimation}
        />
        <MuteButton
          muted={muted}
          onToggle={() => {
            ensureAudio();
            toggleMuted();
          }}
        />
      </div>

      <main className="relative min-h-screen">
        <Journey prefersReducedMotion={prefersReducedMotion} skipAnimation={skipAnimation} onComplete={() => setSkipAnimation(true)} />

        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center px-4 text-center">
          <div className="max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/20 px-5 py-4 backdrop-blur-xl sm:px-7">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">{bannerText}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
