'use client';

import React from 'react';

export default function MobileMonitoringPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white">Live Field Machine Telemetry</h1>
        <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 text-[10px] font-bold">
          RTK FIXED
        </span>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Sprayer</span>
          <span className="font-bold text-white text-sm">SPRAYER-01</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Active Grid</span>
          <span className="font-bold text-emerald-400 text-sm">F01-G047</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Flow Output</span>
          <span className="font-bold text-white text-sm">12.4 L/min (41.6 kg/ha)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Prescription Target</span>
          <span className="font-bold text-white text-sm">42.0 kg/ha</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Chemical Tank</span>
          <span className="font-bold text-slate-200 text-sm">68% (408L)</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-800 pt-2">
          <span className="text-xs text-slate-400">Closed-Loop Decision</span>
          <span className="rounded bg-emerald-500 px-2.5 py-0.5 text-xs font-black text-slate-950">
            CONTINUE
          </span>
        </div>
      </div>

      {/* Safety Interlock Explanation */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300 space-y-1">
        <div className="font-bold text-white">Machine Safety Status</div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Physical boom valves are operating under deterministic automation. Manual override switch is disengaged. No weather lockout detected.
        </p>
      </div>

      <div className="pt-2">
        <a
          href="/mobile"
          className="block w-full text-center rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200"
        >
          &larr; Return to Dashboard
        </a>
      </div>
    </div>
  );
}
