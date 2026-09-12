'use client';

import React, { useState } from 'react';

interface PrescriptionItem {
  id: string;
  gridCode: string;
  field: string;
  crop: string;
  stage: string;
  product: string;
  targetRateKgHa: number;
  minRateKgHa: number;
  maxRateKgHa: number;
  status: 'ACTIVE' | 'READY' | 'DRAFT';
  confidence: 'HIGH' | 'MEDIUM' | 'ESTIMATED';
  reasons: string[];
}

const PRESCRIPTIONS: PrescriptionItem[] = [
  {
    id: 'rx-01',
    gridCode: 'G047',
    field: 'Field 3 (Rice)',
    crop: 'Rice (Oryza sativa)',
    stage: 'Tillering (V4)',
    product: 'NPK 19-19-19 (Water Soluble)',
    targetRateKgHa: 42.0,
    minRateKgHa: 38.0,
    maxRateKgHa: 45.0,
    status: 'ACTIVE',
    confidence: 'HIGH',
    reasons: [
      'Crop stage (Tillering) requires rapid vegetative nitrogen uptake.',
      'Pre-season soil test confirmed moderate residual phosphorus (24 ppm).',
      'Continuous sensor telemetry indicates optimal 42% moisture for granular dissolution.',
    ],
  },
  {
    id: 'rx-02',
    gridCode: 'G048',
    field: 'Field 3 (Rice)',
    crop: 'Riparian Buffer Zone',
    stage: 'Ecological Buffer',
    product: 'RESTRICTED (No chemical application)',
    targetRateKgHa: 0,
    minRateKgHa: 0,
    maxRateKgHa: 0,
    status: 'ACTIVE',
    confidence: 'HIGH',
    reasons: [
      'Geofenced 30-meter buffer strip bordering surface drainage waterway.',
      'Zero application limit enforced to prevent agricultural runoff.',
    ],
  },
  {
    id: 'rx-03',
    gridCode: 'G045',
    field: 'Field 3 (Rice)',
    crop: 'Rice (Oryza sativa)',
    stage: 'Tillering (V4)',
    product: 'NPK 19-19-19',
    targetRateKgHa: 25.0,
    minRateKgHa: 20.0,
    maxRateKgHa: 30.0,
    status: 'READY',
    confidence: 'MEDIUM',
    reasons: [
      'Historical nitrogen accumulation is approaching 80% seasonal budget.',
      'Reduced rate recommended to prevent localized nitrogen toxicity.',
    ],
  },
];

export default function MobilePrescriptionsPage() {
  const [selectedRx, setSelectedRx] = useState<string>('rx-01');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 p-4 space-y-4 max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Green Valley Farm</span>
          <h1 className="text-base font-black text-white">Field Prescriptions</h1>
        </div>
        <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300">
          {PRESCRIPTIONS.length} Active
        </span>
      </div>

      {/* Prescription Cards */}
      <div className="space-y-4">
        {PRESCRIPTIONS.map((rx) => (
          <div
            key={rx.id}
            className={`rounded-2xl border p-4 shadow-xl transition space-y-3 ${
              rx.targetRateKgHa === 0
                ? 'border-rose-800/50 bg-slate-900/90'
                : 'border-emerald-800/40 bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{rx.field}</span>
                <div className="text-xl font-black text-white">Grid {rx.gridCode}</div>
              </div>
              <div className="text-right">
                <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                  rx.targetRateKgHa === 0
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}>
                  {rx.status}
                </span>
                <div className="text-[10px] text-slate-400 mt-1">
                  Confidence: <strong className="text-emerald-400">{rx.confidence}</strong>
                </div>
              </div>
            </div>

            {/* Target Rate Banner */}
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Formulated Product</span>
                <div className="text-xs font-bold text-white mt-0.5">{rx.product}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Rate</span>
                <div className="text-base font-black text-emerald-400">
                  {rx.targetRateKgHa > 0 ? `${rx.targetRateKgHa} kg/ha` : '0 kg/ha'}
                </div>
                {rx.targetRateKgHa > 0 && (
                  <span className="text-[10px] text-slate-400">Range: {rx.minRateKgHa}–{rx.maxRateKgHa} kg/ha</span>
                )}
              </div>
            </div>

            {/* Why Bullets */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Agronomic Rationale (Why):</span>
              <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                {rx.reasons.map((r, i) => (
                  <li key={i} className="leading-tight">{r}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`/mobile/grids/${rx.gridCode}`}
                className="flex-1 text-center rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                Inspect Grid &rarr;
              </a>
              <a
                href={`/mobile/monitoring`}
                className="flex-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-slate-950"
              >
                View Machine State
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Scientific Credibility Disclaimer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400 flex items-start gap-2">
        <span className="text-emerald-400">ℹ</span>
        <div>
          <strong className="text-slate-300">Field-Specific Recommendation: </strong>
          SOIL IQ prescriptions are dynamic agronomic budgets tailored to spatial grid conditions. They do not constitute a universal toxicological limit.
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 py-2 px-4 backdrop-blur flex justify-around text-center text-xs">
        <a href="/mobile" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🏠</span>
          <span className="text-[10px]">Home</span>
        </a>
        <a href="/mobile/map" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🗺️</span>
          <span className="text-[10px]">Map</span>
        </a>
        <a href="/mobile/prescriptions" className="text-emerald-400 font-bold flex flex-col items-center">
          <span className="text-base">💊</span>
          <span className="text-[10px]">Prescriptions</span>
        </a>
        <a href="/mobile/alerts" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🔔</span>
          <span className="text-[10px]">Alerts</span>
        </a>
        <a href="/mobile/tasks" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">📋</span>
          <span className="text-[10px]">Tasks</span>
        </a>
      </nav>
    </div>
  );
}
