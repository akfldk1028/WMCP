'use client';

interface ScoreBarProps {
  score: number;
  max?: number;
  label?: string;
  color?: string;
}

const COLOR_MAP: Record<string, { bg: string; fill: string; text: string }> = {
  blue: { bg: 'bg-blue-100', fill: 'bg-blue-500', text: 'text-blue-700' },
  green: { bg: 'bg-green-100', fill: 'bg-green-500', text: 'text-green-700' },
  red: { bg: 'bg-red-100', fill: 'bg-red-500', text: 'text-red-700' },
  yellow: {
    bg: 'bg-yellow-100',
    fill: 'bg-yellow-500',
    text: 'text-yellow-700',
  },
  purple: {
    bg: 'bg-purple-100',
    fill: 'bg-purple-500',
    text: 'text-purple-700',
  },
  orange: {
    bg: 'bg-orange-100',
    fill: 'bg-orange-500',
    text: 'text-orange-700',
  },
};

export default function ScoreBar({
  score,
  max = 5,
  label,
  color = 'blue',
}: ScoreBarProps) {
  const pct = Math.min(Math.max((score / max) * 100, 0), 100);
  const colors = COLOR_MAP[color] ?? COLOR_MAP.blue;

  return (
    <div className="flex items-center gap-3 w-full">
      {label && (
        <span className="text-sm font-medium text-gray-700 w-28 shrink-0 truncate">
          {label}
        </span>
      )}
      <div className={`flex-1 h-5 rounded-full ${colors.bg} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colors.fill} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-semibold ${colors.text} w-12 text-right shrink-0`}>
        {score}/{max}
      </span>
    </div>
  );
}
