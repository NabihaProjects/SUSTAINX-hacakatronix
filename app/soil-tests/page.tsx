'use client';

import React, { useState } from 'react';

export default function SoilTestsDashboardPage() {
  const [qualityFilter, setQualityFilter] = useState<string>('ALL');

  const stats = {
    totalReports: 4,
    totalSamples: 12,
    activeBaselines: 10,
    freshnessPct: 92, // Measured within 30 days
    conflictsCount: 1,
    unsampledGrids: 2,
    dataQualityScore: 88,
    freshnessScore: 92,
    coverageScore: 80,
    sourceQualityScore: 95,
    consistencyScore: 85,
  };

  const reports = [
    {
      id: 'sr-01',
      reportNumber: 'SR-2026-00412',
      laboratory: 'National Ag Analytical Laboratories (NABL #1042)',
      field: 'Field 3 (Rice)',
      collectionDate: '2026-08-28',
      testDate: '2026-08-30',
      samplesCount: 4,
      status: 'VALIDATED',
      source: 'LAB_SOIL_TEST',
      quality: 'HIGH',
      pAverage: '43.2 ppm',
      nAverage: '186 kg/ha',
    },
    {
      id: 'sr-02',
      reportNumber: 'SR-2026-00388',
      laboratory: 'State Soil Testing Center',
      field: 'Field 1 (Wheat)',
      collectionDate: '2026-07-15',
      testDate: '2026-07-18',
      samplesCount: 3,
      status: 'VALIDATED',
      source: 'LAB_SOIL_TEST',
      quality: 'HIGH',
      pAverage: '38.0 ppm',
      nAverage: '175 kg/ha',
    },
    {
      id: 'sr-03',
      reportNumber: 'SR-2026-00405',
      laboratory: 'Regional Extension Lab',
      field: 'Field 2 (Corn)',
      collectionDate: '2026-08-10',
      testDate: '2026-08-12',
      samplesCount: 3,
      status: 'VALIDATED',
      source: 'GOVERNMENT_SOIL_REPORT',
      quality: 'MEDIUM',
      pAverage: '41.5 ppm',
      nAverage: '192 kg/ha',
    },
    {
      id: 'sr-04',
      reportNumber: 'IMPORT-2026-0901',
      laboratory: 'On-Farm Mobile Photometer',
      field: 'Field 3 (Rice)',
      collectionDate: '2026-09-02',
      testDate: '2026-09-02',
      samplesCount: 2,
      status: 'DRAFT',
      source: 'FARMER_ENTRY',
      quality: 'MEDIUM',
      pAverage: '46.0 ppm',
      nAverage: '180 kg/ha',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Milestone 14 &bull; Soil Intelligence & Baseline Layer
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Soil Data & Baseline Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Establishing trustworthy, validated baseline soil chemistry separated from continuous sensor telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href="/soil-tests/import"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 font-bold text-slate-950 shadow flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Import Lab CSV</span>
            </a>
            <a
              href="/soil-tests/new"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-slate-200 border border-slate-700 font-semibold"
            >
              Farmer Entry
            </a>
            <a
              href="/soil-tests/map"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-slate-200 border border-slate-700 font-semibold"
            >
              Sample Map
            </a>
            <a
              href="/soil-tests/baselines"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-slate-200 border border-slate-700 font-semibold"
            >
              Baselines & Conflicts
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Lab Reports</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalReports}</div>
            <span className="text-[10px] text-emerald-400 font-mono">100% NABL / Certified</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Samples Analyzed</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalSamples}</div>
            <span className="text-[10px] text-slate-400">0-15cm Depth</span>
          </div>
          <div className="rounded-2xl border border-emerald-800/40 bg-slate-900/80 p-3.5 shadow">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Baselines</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.activeBaselines}</div>
            <span className="text-[10px] text-emerald-300">10 Grids Covered</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Data Freshness</span>
            <div className="text-2xl font-black text-white mt-1">{stats.freshnessPct}%</div>
            <span className="text-[10px] text-emerald-400 font-mono">&lt; 30 Days Old</span>
          </div>
          <div className="rounded-2xl border border-amber-800/40 bg-slate-900/80 p-3.5 shadow">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Data Conflicts</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{stats.conflictsCount}</div>
            <span className="text-[10px] text-amber-300 font-mono">G047 (Lab vs Sensor)</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Unsampled Grids</span>
            <div className="text-2xl font-black text-slate-300 mt-1">{stats.unsampledGrids}</div>
            <span className="text-[10px] text-slate-400">Spatial Interpolated</span>
          </div>
        </div>

        {/* Quality Score Breakdown & Scientific Principle Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-800/40 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Soil Data Quality Score</span>
              <span className="text-xl font-black text-emerald-400">{stats.dataQualityScore} / 100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Composite index measuring trustworthiness and spatial completeness of soil inputs (distinct from soil-health score).
            </p>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                  <span>Data Freshness</span>
                  <span className="font-mono font-bold text-emerald-400">{stats.freshnessScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.freshnessScore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                  <span>Spatial Coverage (Direct Core Samples)</span>
                  <span className="font-mono font-bold text-emerald-400">{stats.coverageScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.coverageScore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                  <span>Source Verification (Accredited Labs)</span>
                  <span className="font-mono font-bold text-emerald-400">{stats.sourceQualityScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.sourceQualityScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Agronomic Principle & Separation of Data Sources
              </span>
              <span className="rounded bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
                Core Architectural Rule
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              SOIL IQ connects laboratory nutrient assays with real-time field context without conflating their distinct physical limits:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
                <div className="font-bold text-emerald-400 mb-0.5">1. Certified Lab Soil Test (Baseline)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Establishes the chemical capacity: available nitrogen, Bray-1 phosphorus, exchangeable potassium, and soil pH.
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800/80">
                <div className="font-bold text-emerald-400 mb-0.5">2. Continuous Telemetry (Context)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Measures volumetric water content, soil temperature, and electrical conductivity to modulate dynamic dissolution and application rate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Soil Reports Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Soil Test Reports & Baseline Provenance</h2>
              <span className="text-xs text-slate-400">Authorized laboratory assays and farmer imports</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">Showing {reports.length} Reports</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Report #</th>
                  <th className="p-3.5">Testing Laboratory</th>
                  <th className="p-3.5">Field</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Source Type</th>
                  <th className="p-3.5">Avg P</th>
                  <th className="p-3.5">Avg N</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/40 transition">
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{r.reportNumber}</td>
                    <td className="p-3.5 font-semibold text-white max-w-xs truncate">{r.laboratory}</td>
                    <td className="p-3.5 text-slate-300">{r.field}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{r.collectionDate}</td>
                    <td className="p-3.5">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        {r.source}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-200">{r.pAverage}</td>
                    <td className="p-3.5 font-mono text-slate-200">{r.nAverage}</td>
                    <td className="p-3.5">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        r.status === 'VALIDATED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <a
                        href={`/soil-tests/${r.id}`}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 border border-slate-700"
                      >
                        Inspect &rarr;
                      </a>
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
