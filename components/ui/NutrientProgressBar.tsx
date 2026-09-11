import React from 'react';

interface NutrientProgressBarProps {
  nutrient: 'N' | 'P' | 'K' | string;
  consumed: number;
  recommended: number;
  remaining: number;
  excess?: number;
  unit?: string;
}

export function NutrientProgressBar({
  nutrient,
  consumed,
  recommended,
  remaining,
  excess = 0,
  unit = 'kg/ha',
}: NutrientProgressBarProps) {
  const pct = recommended > 0 ? Math.min(150, Math.round((consumed / recommended) * 100)) : 0;

  const names: Record<string, string> = {
    N: 'Nitrogen (N)',
    P: 'Phosphorus (P)',
    K: 'Potassium (K)',
  };

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-400';
  if (pct >= 100 || excess > 0) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-400';
  } else if (pct >= 80) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  const fillWidth = Math.min(100, pct);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-emerald-100">{names[nutrient] || nutrient}</span>
        <span className={`font-mono font-semibold ${textColor}`}>
          {pct}% <span className="text-[#718d78] font-normal">({consumed} / {recommended} {unit})</span>
        </span>
      </div>

      <div className="relative w-full h-2.5 bg-[#18261c] rounded-full overflow-hidden border border-[#233829]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${fillWidth}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-[#718d78]">
        <span>
          Remaining: <strong className="text-emerald-200 font-mono">{remaining} {unit}</strong>
        </span>
        {excess > 0 && (
          <span className="text-rose-400 font-medium">
            Excess: +{excess} {unit}
          </span>
        )}
      </div>
    </div>
  );
}
