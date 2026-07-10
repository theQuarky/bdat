import { useEffect, useRef, useState } from 'react';

const useAmbientAudio = () => {
  const [muted, setMuted] = useState(true);
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const initializedRef = useRef(false);

  const initializeAudio = () => {
    if (typeof window === 'undefined' || initializedRef.current) {
      return;
    }

    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gain = context.createGain();
    gain.gain.value = muted ? 0 : 0.32;
    gain.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 110;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 540;
    oscillator.connect(filter);
    filter.connect(gain);

    oscillator.start();

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 800;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(gain);

    noiseSource.start();
    contextRef.current = context;
    gainRef.current = gain;
    initializedRef.current = true;
  };

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(muted ? 0 : 0.32, contextRef.current?.currentTime ?? 0, 0.02);
    }
  }, [muted]);

  const toggleMuted = () => setMuted((value) => !value);

  const ensureAudio = () => {
    if (typeof window === 'undefined') {
      return;
    }
    initializeAudio();
    if (contextRef.current?.state === 'suspended') {
      contextRef.current.resume().catch(() => undefined);
    }
  };

  return { muted, toggleMuted, ensureAudio };
};

export default useAmbientAudio;
