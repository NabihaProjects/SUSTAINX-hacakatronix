'use client';

import React from 'react';

interface ApplicationMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowRateLpm?: number;
  speedKmh?: number;
  swathWidthM?: number;
  fertilizerName?: string;
  nPercent?: number;
  pPercent?: number;
  kPercent?: number;
}

export function ApplicationMathModal({
  isOpen,
  onClose,
  flowRateLpm = 12.4,
  speedKmh = 8.5,
  swathWidthM = 12.0,
  fertilizerName = 'NPK 19-19-19 Liquid',
  nPercent = 19.0,
  pPercent = 19.0,
  kPercent = 19.0,
}: ApplicationMathModalProps) {
  if (!isOpen) return null;

  // Agricultural spray equation:
  // Application Rate (L/ha) = (Flow Rate (L/min) * 600) / (Speed (km/h) * Swath Width (m))
  const calculatedRateLpha =
    speedKmh > 0 && swathWidthM > 0
      ? Number(((flowRateLpm * 600) / (speedKmh * swathWidthM)).toFixed(2))
      : 0;

  // Mass to nutrient calculation:
  // Pure N (kg/ha) = Application Rate (kg/ha) * (N% / 100)
  const pureN = Number(((calculatedRateLpha * nPercent) / 100).toFixed(2));
  const pureP = Number(((calculatedRateLpha * pPercent) / 100).toFixed(2));
  const pureK = Number(((calculatedRateLpha * kPercent) / 100).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-emerald-700/50 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Agronomic Physics Transparency
            </span>
            <h3 className="text-lg font-bold text-white">
              Application Math & Physical Spray Equations
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono">
            <div className="text-xs text-slate-400">Canonical Agricultural Spray Equation:</div>
            <div className="mt-2 text-emerald-300">
              Application Rate (L/ha) = [ Flow Rate (L/min) × 600 ] ÷ [ Speed (km/h) × Swath Width (m) ]
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Current telemetry substitution:
            </div>
            <div className="mt-1 text-slate-200">
              = [ {flowRateLpm.toFixed(1)} L/min × 600 ] ÷ [ {speedKmh.toFixed(1)} km/h × {swathWidthM.toFixed(1)} m ]
            </div>
            <div className="mt-2 border-t border-slate-800 pt-2 text-base font-bold text-emerald-400">
              = {calculatedRateLpha} L/ha
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono">
            <div className="text-xs text-slate-400">
              Product Mass vs. Active Elemental Nutrient Separation ({fertilizerName}):
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                <div className="text-slate-400">Pure Nitrogen (N)</div>
                <div className="text-emerald-400 text-sm font-bold mt-1">{pureN} kg/ha</div>
                <div className="text-[10px] text-slate-500">({nPercent}% formulation)</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                <div className="text-slate-400">Pure Phosphorus (P)</div>
                <div className="text-emerald-400 text-sm font-bold mt-1">{pureP} kg/ha</div>
                <div className="text-[10px] text-slate-500">({pPercent}% formulation)</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-2 border border-slate-800">
                <div className="text-slate-400">Pure Potassium (K)</div>
                <div className="text-emerald-400 text-sm font-bold mt-1">{pureK} kg/ha</div>
                <div className="text-[10px] text-slate-500">({kPercent}% formulation)</div>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-amber-300/90 italic">
              * Critical Principle: SOIL IQ never conflates physical fertilizer product weight with active elemental nutrient absorption.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
          >
            Close Math Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
