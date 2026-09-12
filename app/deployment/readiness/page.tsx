'use client';

import React, { useState } from 'react';

interface ChecklistItem {
  id: number;
  label: string;
  category: 'FARM' | 'SENSORS' | 'SPRAYER' | 'PRESCRIPTION' | 'SAFETY';
  isReady: boolean;
  blockerNotes?: string;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 1, label: 'Organization configured with multi-tenant isolation', category: 'FARM', isReady: true },
  { id: 2, label: 'Farm boundaries & acreage declared', category: 'FARM', isReady: true },
  { id: 3, label: 'Fields mapped with GeoJSON spatial polygons', category: 'FARM', isReady: true },
  { id: 4, label: 'Centimeter spatial grids generated with N-P-K ledgers', category: 'FARM', isReady: true },
  { id: 5, label: 'Soil sensor nodes provisioned & mapped to grids', category: 'SENSORS', isReady: true },
  { id: 6, label: 'Sprayer profile & machine swath width calibrated', category: 'SPRAYER', isReady: true },
  { id: 7, label: 'RTK-GNSS receiver verified with RTK_FIXED fix state', category: 'SPRAYER', isReady: true },
  { id: 8, label: 'Flow meter totalizer pulse calibration validated', category: 'SPRAYER', isReady: true },
  { id: 9, label: 'Chemical tank hydrostatic level threshold configured', category: 'SPRAYER', isReady: true },
  { id: 10, label: 'Edge Gateway connected with active prescription cache', category: 'SAFETY', isReady: true },
  { id: 11, label: 'Agronomic prescription approved by agronomist', category: 'PRESCRIPTION', isReady: true },
  { id: 12, label: 'Environmental weather lockout policy active (80% rain threshold)', category: 'SAFETY', isReady: true },
  { id: 13, label: 'Hardware Safety Gate verified (PHYSICAL_CONTROL_ENABLED safety check)', category: 'SAFETY', isReady: true },
  { id: 14, label: 'Idempotency and audit logging active on all commands', category: 'SAFETY', isReady: true },
];

export default function DeploymentReadinessPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  const readyCount = checklist.filter((i) => i.isReady).length;
  const readinessScore = Math.round((readyCount / checklist.length) * 100);

  const toggleItem = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, isReady: !item.isReady } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Pre-Operation Safety Verification
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Deployment Readiness Checklist</h1>
            <p className="text-xs text-slate-400 mt-1">
              14-point hardware, spatial, agronomic, and safety verification prior to field machine deployment.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Prototype Readiness Score</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {readinessScore}/100
            </div>
          </div>
        </div>

        {/* Readiness Status Banner */}
        <div
          className={`rounded-2xl p-5 border flex items-center justify-between ${
            readinessScore === 100
              ? 'border-emerald-700 bg-emerald-950/40 text-emerald-200'
              : 'border-amber-700 bg-amber-950/40 text-amber-200'
          }`}
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider">System State</span>
            <div className="text-lg font-bold text-white">
              {readinessScore === 100 ? 'READY FOR CONTROLLED DEMO OPERATION' : 'OPERATION BLOCKED — SAFETY INTERLOCKS PENDING'}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {readyCount} of {checklist.length} safety and hardware preconditions verified.
            </p>
          </div>
          <span
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider ${
              readinessScore === 100
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-slate-950'
            }`}
          >
            {readinessScore === 100 ? 'READY' : 'NOT READY'}
          </span>
        </div>

        {/* 14 Checklist Items */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-3 text-xs">
          <h2 className="text-sm font-bold text-white mb-2">Pre-Operation Verification Items</h2>
          <div className="divide-y divide-slate-800/60">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.isReady}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    item.isReady
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                      : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                  }`}
                >
                  {item.isReady ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] text-slate-400">
          <strong className="text-slate-300">Agricultural Safety Disclaimer: </strong>
          SOIL IQ is a software decision-support and control architecture prototype. Physical machinery deployment requires hardware validation, fail-safe testing, regulatory compliance, and qualified operator oversight.
        </div>
      </div>
    </div>
  );
}
