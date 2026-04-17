import type { SquatPhase } from '../types/pose';

interface RepCounterProps {
  repCount: number;
  phase: SquatPhase;
  kneeAngle: number;
}

const phaseLabels: Record<SquatPhase, string> = {
  standing: 'Standing',
  descending: 'Going Down',
  bottom: 'At Depth',
  ascending: 'Coming Up',
};

const phaseColors: Record<SquatPhase, string> = {
  standing: 'text-emerald-400',
  descending: 'text-amber-400',
  bottom: 'text-cyan-400',
  ascending: 'text-violet-400',
};

export function RepCounter({ repCount, phase, kneeAngle }: RepCounterProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Rep count — big and bold */}
      <div className="relative">
        <div className="text-8xl font-black tabular-nums tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          {repCount}
        </div>
        <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl -z-10" />
      </div>
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">
        Reps
      </div>

      {/* Phase and angle badges */}
      <div className="flex items-center gap-3 mt-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 backdrop-blur-sm border border-white/10 ${phaseColors[phase]}`}>
          {phaseLabels[phase]}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold text-white/50 bg-white/5 backdrop-blur-sm border border-white/10">
          {kneeAngle}°
        </span>
      </div>
    </div>
  );
}
