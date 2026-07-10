interface SkipButtonProps {
  onSkip: () => void;
  disabled?: boolean;
}

const SkipButton = ({ onSkip, disabled }: SkipButtonProps) => {
  return (
    <button
      type="button"
      onClick={onSkip}
      disabled={disabled}
      className="rounded-full border border-white/15 bg-slate-950/65 px-4 py-2 text-sm text-white transition hover:border-white/30 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-300/40"
    >
      Skip Animation
    </button>
  );
};

export default SkipButton;
