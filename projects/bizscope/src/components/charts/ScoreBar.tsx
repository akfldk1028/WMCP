'use client';

interface ScoreBarProps {
  score: number;
  max?: number;
  label?: string;
  color?: string;
}

export default function ScoreBar({
  score,
  max = 5,
  label,
}: ScoreBarProps) {
  const pct = Math.min(Math.max((score / max) * 100, 0), 100);

  return (
    <div className="flex items-center gap-3 w-full">
      {label && (
        <span className="text-sm font-medium text-foreground w-28 shrink-0 truncate">
          {label}
        </span>
      )}
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums text-indigo-600 w-10 text-right shrink-0">
        {score}/{max}
      </span>
    </div>
  );
}
