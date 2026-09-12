'use client';

import React from 'react';

export default function MobileFarmsPage() {
  const farm = {
    name: 'Green Valley Farm',
    totalAreaAcres: 10.0,
    fieldsCount: 3,
    activeGridsCount: 10,
    activeSprayer: 'SPRAYER-01 (Active)',
    sensorCoveragePct: 100,
    criticalAlertsCount: 1,
    environmentalStatus: 'SAFE (Rain probability < 20%)',
    openTasksCount: 3,
  };

  const fields = [
    { id: 'f-01', name: 'Field 1 (Wheat)', area: '3.2 ac', grids: 3, crop: 'Spring Wheat', status: 'OPTIMAL' },
    { id: 'f-02', name: 'Field 2 (Corn)', area: '3.4 ac', grids: 3, crop: 'Dent Corn', status: 'CAUTION' },
    { id: 'f-03', name: 'Field 3 (Rice)', area: '3.4 ac', grids: 4, crop: 'Paddy Rice', status: 'OPTIMAL' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 p-4 space-y-4 max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Farm Overview</span>
          <h1 className="text-base font-black text-white">{farm.name}</h1>
        </div>
        <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 text-xs font-bold">
          {farm.totalAreaAcres} Acres
        </span>
      </div>

      {/* Farm Metrics Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Total Fields / Grids</span>
            <div className="font-extrabold text-white mt-0.5">{farm.fieldsCount} Fields &bull; {farm.activeGridsCount} Grids</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Active Fleet</span>
            <div className="font-extrabold text-emerald-400 mt-0.5">{farm.activeSprayer}</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Sensor Coverage</span>
            <div className="font-extrabold text-emerald-300 mt-0.5">{farm.sensorCoveragePct}% (4 Nodes)</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Critical Alerts</span>
            <div className="font-extrabold text-rose-400 mt-0.5">{farm.criticalAlertsCount} Alert Active</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-xs flex items-center justify-between">
          <span className="text-slate-400">Environmental Risk:</span>
          <span className="font-bold text-emerald-400">{farm.environmentalStatus}</span>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-bold uppercase tracking-wider text-[10px]">Managed Fields</span>
          <span>{fields.length} Enrolled</span>
        </div>

        {fields.map((f) => (
          <div key={f.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm">{f.name}</h3>
                <span className="text-[11px] text-slate-400">{f.crop} &bull; {f.area}</span>
              </div>
              <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                f.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {f.status}
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href="/mobile/map"
                className="flex-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-slate-950"
              >
                View On Map &rarr;
              </a>
              <a
                href="/mobile/prescriptions"
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                Prescriptions
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 py-2 px-4 backdrop-blur flex justify-around text-center text-xs">
        <a href="/mobile" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🏠</span>
          <span className="text-[10px]">Home</span>
        </a>
        <a href="/mobile/farms" className="text-emerald-400 font-bold flex flex-col items-center">
          <span className="text-base">🌾</span>
          <span className="text-[10px]">Farms</span>
        </a>
        <a href="/mobile/map" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🗺️</span>
          <span className="text-[10px]">Map</span>
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
