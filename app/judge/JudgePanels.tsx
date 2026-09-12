'use client';

import React from 'react';
import { JudgeScene } from '@/lib/services/JudgeSceneEngine';

export function JudgeHeaderBanner() {
  return (
    <div className="border-b border-emerald-800/40 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              SOIL IQ <span className="text-emerald-400 font-normal">| Hackathon Judge Mode</span>
            </h1>
            <span className="rounded bg-emerald-950 border border-emerald-700/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              SIMULATED DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Grid-Level Precision Fertilizer Management &bull;{' '}
            <span className="text-emerald-300 font-medium">
              “SOIL IQ connects what the soil needs with what the machine actually applies.”
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <a
            href="/judge/record"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
          >
            Clean Recording Mode
          </a>
          <a
            href="/judge/objections"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
          >
            Judge Objections FAQ
          </a>
          <a
            href="/judge/architecture"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
          >
            Architecture
          </a>
          <a
            href="/validation"
            className="rounded-lg bg-emerald-800/80 hover:bg-emerald-700 px-3 py-1.5 text-white font-semibold"
          >
            Claims Matrix
          </a>
        </div>
      </div>
    </div>
  );
}

export function JudgeMachineCard({ scene }: { scene: JudgeScene }) {
  const { sprayer } = scene;
  const decisionColors = {
    CONTINUE: 'bg-emerald-500 text-slate-950',
    REDUCE: 'bg-amber-500 text-slate-950',
    DEFER: 'bg-rose-500 text-white',
    STOP: 'bg-rose-600 text-white',
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-slate-100 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-white">{sprayer.name}</span>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
            Grid: <strong className="text-emerald-400">{sprayer.gridCode}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-semibold text-emerald-400">
            {sprayer.rtkStatus} (±{sprayer.accuracyCm}cm)
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Target Prescription</div>
          <div className="text-sm font-bold text-white mt-0.5">{sprayer.prescriptionKgHa} kg/ha</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Actual Flow Telemetry</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {sprayer.actualRateKgHa} kg/ha <span className="text-[10px] text-slate-400">({sprayer.actualFlowLpm} L/min)</span>
          </div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Chemical Tank</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">{sprayer.tankPct}% (408L)</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Environment State</div>
          <div className={`text-sm font-bold mt-0.5 ${sprayer.environment === 'SAFE' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {sprayer.environment}
          </div>
        </div>
      </div>

      {/* Decision Banner */}
      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-950 p-2.5 border border-slate-800">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Live Closed-Loop Decision</div>
          <div className="text-xs font-medium text-slate-300 truncate max-w-[220px]">
            {sprayer.decisionReason}
          </div>
        </div>
        <span className={`rounded px-3 py-1 text-xs font-black tracking-wide ${decisionColors[sprayer.decision]}`}>
          {sprayer.decision}
        </span>
      </div>
    </div>
  );
}

export function JudgeGridIntelligence({ scene }: { scene: JudgeScene }) {
  const { grid } = scene;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-slate-100 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Spatial Grid State</span>
          <h3 className="text-sm font-bold text-white">{grid.code} &bull; {grid.crop}</h3>
        </div>
        <span className="rounded bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
          Confidence: {grid.confidence}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Remaining N</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{grid.nRemaining} kg/ha</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Remaining P</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{grid.pRemaining} kg/ha</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Remaining K</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{grid.kRemaining} kg/ha</div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Topsoil Moisture</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">{grid.moisturePct}% (Probe In-Situ)</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
          <div className="text-slate-400">Soil pH</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">{grid.ph} (Optimal Neutral)</div>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-slate-950/70 p-2.5 border border-slate-800 text-xs">
        <span className="text-slate-400">Recommended Product: </span>
        <span className="font-bold text-white">{grid.prescriptionProduct}</span>
      </div>
    </div>
  );
}

export function JudgeImpactPanel({ scene }: { scene: JudgeScene }) {
  const { impact } = scene;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-slate-100 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Verified Sustainability Impact
        </span>
        <span className="text-[10px] text-emerald-400 font-mono">
          $0.68/kg NPK Price
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <div className="text-slate-400">Fertilizer Applied</div>
          <div className="text-lg font-bold text-white mt-0.5">{impact.appliedKg} kg</div>
          <div className="text-[10px] text-slate-400">MEASURED by Totalizer</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <div className="text-slate-400">Excess Avoided</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{impact.avoidedKg} kg</div>
          <div className="text-[10px] text-emerald-300">ESTIMATED vs Blanket</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <div className="text-slate-400">Cost Savings</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">${impact.costSavingsUsd}</div>
          <div className="text-[10px] text-slate-400">ESTIMATED ($0.68/kg)</div>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <div className="text-slate-400">Application Accuracy</div>
          <div className="text-lg font-bold text-white mt-0.5">{impact.accuracyPct}%</div>
          <div className="text-[10px] text-slate-400">MEASURED Prescription Match</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-950/80 p-2 border border-slate-800 text-xs">
        <span className="text-slate-400">Environmental Deferrals:</span>
        <span className="font-bold text-rose-400">{impact.deferralsCount} Rainfall Stops</span>
      </div>
    </div>
  );
}

export function JudgeComparisonCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-xs text-slate-300 shadow-lg">
      <h4 className="font-bold text-white text-sm mb-2">Why Not Just a Fertilizer Calculator?</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-950/60 p-3 border border-rose-900/30">
          <div className="font-bold text-rose-400 mb-1">Traditional Open-Loop</div>
          <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
            <li>Generalized field-wide average</li>
            <li>Zero real-time machine tracking</li>
            <li>Blind uniform application</li>
            <li>No rainfall runoff protection</li>
            <li>Unverified outcomes</li>
          </ul>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-3 border border-emerald-800/40">
          <div className="font-bold text-emerald-400 mb-1">SOIL IQ Closed-Loop</div>
          <ul className="space-y-1 text-[11px] text-slate-200 list-disc list-inside">
            <li>Grid-specific spatial prescriptions</li>
            <li>RTK-GNSS sub-meter positioning</li>
            <li>Flow totalizer verifies actual output</li>
            <li>Automatic rainfall/drift deferrals</li>
            <li>Traceable nutrient ledger & impact</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
