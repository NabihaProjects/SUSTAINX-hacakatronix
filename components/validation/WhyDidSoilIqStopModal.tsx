'use client';

import React from 'react';

interface WhyDidSoilIqStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  gridCode?: string;
  prescriptionRateKgHa?: number;
  remainingBudgetKgHa?: number;
  rainProbabilityPct?: number;
  decision?: 'STOP' | 'DEFER' | 'REDUCE' | 'CONTINUE';
  reason?: string;
  timestamp?: string;
}

export function WhyDidSoilIqStopModal({
  isOpen,
  onClose,
  gridCode = 'F01-G002',
  prescriptionRateKgHa = 36.0,
  remainingBudgetKgHa = 7.2,
  rainProbabilityPct = 82,
  decision = 'DEFER',
  reason = 'Heavy rainfall forecast (82% probability) with saturated soil would cause severe chemical runoff into adjacent watershed.',
  timestamp = new Date().toLocaleTimeString(),
}: WhyDidSoilIqStopModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-2xl border border-rose-700/50 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold">
              !
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Deterministic Decision Transparency
              </span>
              <h3 className="text-xl font-bold text-white">
                Why Did SOIL IQ Intervene?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Decision Headline Card */}
          <div className="flex items-center justify-between rounded-xl border border-rose-800/40 bg-rose-950/30 p-4">
            <div>
              <div className="text-xs text-slate-400">FINAL CONTROL ACTION</div>
              <div className="text-2xl font-black tracking-tight text-rose-400">
                {decision}: APPLICATION HALTED
              </div>
              <div className="mt-1 text-xs text-slate-300">
                Grid: <span className="font-semibold text-white">{gridCode}</span> &bull; Timestamp: <span className="text-white">{timestamp}</span>
              </div>
            </div>
            <div className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold uppercase text-white shadow">
              Valve Closed
            </div>
          </div>

          {/* Causal Event Graph */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Deterministic Causal Audit Chain
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-slate-400">1. Spatial Grid</div>
                <div className="font-bold text-emerald-400 mt-0.5">{gridCode}</div>
              </div>
              <span className="text-slate-600 font-bold">&rarr;</span>
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-slate-400">2. Active Rx</div>
                <div className="font-bold text-emerald-400 mt-0.5">{prescriptionRateKgHa} kg/ha</div>
              </div>
              <span className="text-slate-600 font-bold">&rarr;</span>
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
                <div className="text-slate-400">3. Remaining Budget</div>
                <div className="font-bold text-amber-400 mt-0.5">{remainingBudgetKgHa} kg N rem</div>
              </div>
              <span className="text-slate-600 font-bold">&rarr;</span>
              <div className="rounded-lg border border-rose-900/50 bg-rose-950/50 p-2.5">
                <div className="text-rose-300">4. Environmental Trigger</div>
                <div className="font-bold text-rose-400 mt-0.5">Rain Prob {rainProbabilityPct}%</div>
              </div>
              <span className="text-slate-600 font-bold">&rarr;</span>
              <div className="rounded-lg border border-rose-500 bg-rose-900/80 p-2.5 text-white">
                <div className="text-[10px] uppercase font-bold text-rose-200">5. Machine Actuation</div>
                <div className="font-black text-white mt-0.5">{decision}</div>
              </div>
            </div>
          </div>

          {/* Plain Text Causal Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs leading-relaxed text-slate-300">
            <div className="font-bold text-slate-200">Deterministic Justification:</div>
            <p className="mt-1">{reason}</p>
            <div className="mt-3 border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
              * Safety Note: This decision was derived by the deterministic rule engine. No probabilistic AI model has authority to override safety or environmental lockouts.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
