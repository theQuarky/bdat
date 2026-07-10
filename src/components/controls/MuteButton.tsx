interface MuteButtonProps {
  muted: boolean;
  onToggle: () => void;
}

const MuteButton = ({ muted, onToggle }: MuteButtonProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      className="rounded-full border border-white/15 bg-slate-950/65 px-4 py-2 text-sm text-white transition hover:border-white/30 hover:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-slate-300/40"
    >
      {muted ? 'Unmute' : 'Mute'}
    </button>
  );
};

export default MuteButton;
