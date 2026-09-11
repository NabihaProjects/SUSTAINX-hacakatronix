import React from 'react';

interface ConfidenceBadgeProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  score?: number;
}

export function ConfidenceBadge({ level, score }: ConfidenceBadgeProps) {
  const norm = (level || 'MEDIUM').toUpperCase();

  let badgeColor = 'bg-blue-950/70 text-blue-300 border-blue-800/60';
  if (norm === 'HIGH') {
    badgeColor = 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
  } else if (norm === 'LOW') {
    badgeColor = 'bg-amber-950/70 text-amber-300 border-amber-800/60';
  }

  return (
    <div className={`inline-flex items-center gap-2 border px-2.5 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
      <span className="uppercase tracking-wider font-semibold">{norm} CONFIDENCE</span>
      {score !== undefined && (
        <span className="font-mono text-[11px] opacity-80">
          ({Math.round(score * 100)}%)
        </span>
      )}
    </div>
  );
}
