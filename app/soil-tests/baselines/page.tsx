'use client';

import React, { useState } from 'react';

export default function SoilBaselinesAndConflictsPage() {
  const [conflictResolved, setConflictResolved] = useState<string | null>(null);

  const baselines = [
    {
      id: 'bl-01',
      gridCode: 'G047',
      field: 'Field 3 (Rice)',
      version: 'v1.0',
      effectiveDate: '2026-08-30',
      source: 'LAB_SOIL_TEST',
      n: 188,
      p: 44,
      k: 212,
      ph: 6.4,
      ec: 1.2,
      status: 'ACTIVE',
      quality: 'HIGH',
      confidence: '95%',
      approvedAt: '2026-08-30 18:00',
    },
    {
      id: 'bl-02',
      gridCode: 'G048',
      field: 'Field 3 (Rice)',
      version: 'v1.0',
      effectiveDate: '2026-08-30',
      source: 'LAB_SOIL_TEST',
      n: 210,
      p: 32,
      k: 195,
      ph: 6.8,
      ec: 2.1,
      status: 'ACTIVE',
      quality: 'HIGH',
      confidence: '95%',
      approvedAt: '2026-08-30 18:00',
    },
    {
      id: 'bl-03',
      gridCode: 'G045',
      field: 'Field 3 (Rice)',
      version: 'v1.0',
      effectiveDate: '2026-08-30',
      source: 'ESTIMATED',
      n: 180,
      p: 38,
      k: 208,
      ph: 6.4,
      ec: 1.2,
      status: 'ACTIVE',
      quality: 'MEDIUM',
      confidence: '78%',
      approvedAt: '2026-08-30 18:00',
    },
    {
      id: 'bl-04',
      gridCode: 'G041',
      field: 'Field 3 (Rice)',
      version: 'v1.0',
      effectiveDate: '2026-08-30',
      source: 'LAB_SOIL_TEST',
      n: 185,
      p: 42,
      k: 210,
      ph: 6.4,
      ec: 1.1,
      status: 'ACTIVE',
      quality: 'HIGH',
      confidence: '95%',
      approvedAt: '2026-08-30 18:00',
    },
  ];

  const handleResolveConflict = (strategy: string) => {
    setConflictResolved(`Conflict resolved by Agronomist: Applied "${strategy}". Ledger baseline locked to Lab Assay (44.0 ppm). Event logged.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Nutrient Baseline Engine
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Active Baselines & Conflict Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Authoritative nutrient baselines feeding the prescription engine. Conflict detection between lab assays and sensors.
            </p>
          </div>
          <a
            href="/soil-tests"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Soil Dashboard
          </a>
        </div>

        {/* Section 13: Data Conflict Detection Box */}
        <div className="rounded-2xl border border-amber-800/60 bg-amber-950/20 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-sm">⚠️ Parameter Conflict Detected</span>
              <span className="rounded bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 text-[10px] font-mono">
                Grid G047 &bull; Phosphorus
              </span>
            </div>
            <span className="text-xs text-amber-400 font-bold">Discrepancy: 47.0%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800 space-y-1">
              <div className="font-bold text-emerald-400 uppercase text-[10px]">Source A: Validated Lab Assay</div>
              <div className="text-xl font-black text-white">44.0 ppm P</div>
              <p className="text-[11px] text-slate-400">
                Report SR-2026-00412 (Bray-1 P). Certified by National Ag Analytical Labs.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800 space-y-1">
              <div className="font-bold text-amber-400 uppercase text-[10px]">Source B: Continuous Sensor / Estimate</div>
              <div className="text-xl font-black text-white">71.0 ppm P</div>
              <p className="text-[11px] text-slate-400">
                Derived from optical in-situ probe spectral reflectance. High potential for organic matter interference.
              </p>
            </div>
          </div>

          {conflictResolved ? (
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-700 p-3 text-xs text-emerald-300">
              {conflictResolved}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-400">
                Rule: Validated laboratory tests supersede uncalibrated sensor estimates unless overridden.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResolveConflict('Prefer Lab Assay (Recommended)')}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow"
                >
                  Prefer Lab Assay (44 ppm)
                </button>
                <button
                  onClick={() => handleResolveConflict('Prefer Sensor Estimate')}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  Prefer Sensor (71 ppm)
                </button>
                <button
                  onClick={() => handleResolveConflict('Flag for Laboratory Re-test')}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  Request Re-test
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Baselines Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Approved Field & Grid Nutrient Baselines</h2>
              <span className="text-xs text-slate-400">Current active versions consumed by prescription engine</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono">100% Versioned & Audited</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-sans">
                <tr>
                  <th className="p-3.5">Spatial Grid</th>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">Effective Date</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">N (kg/ha)</th>
                  <th className="p-3.5">P (ppm)</th>
                  <th className="p-3.5">K (ppm)</th>
                  <th className="p-3.5">pH / EC</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {baselines.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-850/40">
                    <td className="p-3.5 font-bold text-white font-sans">{b.gridCode}</td>
                    <td className="p-3.5 text-slate-400">{b.version}</td>
                    <td className="p-3.5 text-slate-400">{b.effectiveDate}</td>
                    <td className="p-3.5 font-sans">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {b.source}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-200">{b.n}</td>
                    <td className="p-3.5 text-emerald-300 font-bold">{b.p}</td>
                    <td className="p-3.5 text-slate-200">{b.k}</td>
                    <td className="p-3.5 text-slate-300">{b.ph} / {b.ec}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{b.confidence}</td>
                    <td className="p-3.5 font-sans">
                      <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
