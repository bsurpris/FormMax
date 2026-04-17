import { useEffect, useState } from 'react';
import type { FormFeedback } from '../types/pose';

interface FeedbackPanelProps {
  feedback: FormFeedback[];
}

const typeStyles: Record<FormFeedback['type'], string> = {
  good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const [visible, setVisible] = useState(false);

  // Animate in on feedback change
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, [feedback]);

  return (
    <div className="flex flex-col gap-2 min-h-[100px]">
      {feedback.map((fb, i) => (
        <div
          key={`${fb.message}-${i}`}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md
            transition-all duration-300 ease-out
            ${typeStyles[fb.type]}
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}
          style={{ transitionDelay: `${i * 60}ms` }}
        >
          <span className="text-xl flex-shrink-0">{fb.icon}</span>
          <span className="font-semibold text-sm tracking-wide">{fb.message}</span>
        </div>
      ))}
    </div>
  );
}
