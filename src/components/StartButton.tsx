interface StartButtonProps {
  isStreaming: boolean;
  isModelLoaded: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function StartButton({ isStreaming, isModelLoaded, onStart, onStop }: StartButtonProps) {
  if (isStreaming) {
    return (
      <button
        onClick={onStop}
        className="group relative px-8 py-3 rounded-full font-bold text-sm uppercase tracking-[0.15em]
          bg-white/5 border border-white/10 text-white/60
          hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-300
          transition-all duration-300 cursor-pointer"
      >
        <span className="relative z-10">End Session</span>
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      disabled={!isModelLoaded}
      className="group relative px-10 py-4 rounded-full font-bold text-base uppercase tracking-[0.15em]
        text-white overflow-hidden cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        background: isModelLoaded
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)'
          : 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Animated glow */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
          filter: 'blur(8px)',
        }}
      />
      <span className="relative z-10">
        {isModelLoaded ? 'Start Workout' : 'Loading Model...'}
      </span>
    </button>
  );
}
