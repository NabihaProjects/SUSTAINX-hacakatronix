'use client';

import React, { use } from 'react';

interface GridDetailPageProps {
  params: Promise<{ gridId: string }>;
}

export default function MobileGridDetailPage({ params }: GridDetailPageProps) {
  const resolvedParams = use(params);
  const gridCode = resolvedParams.gridId.toUpperCase();

  const gridData = {
    code: gridCode,
    crop: 'Rice (Oryza sativa)',
    stage: 'Tillering (V4)',
    soilType: 'Red Loam / Inceptisol',
    moisture: '42.1%',
    ph: '6.4',
    ec: '1.2 dS/m',
    targetRx: '42 kg/ha NPK 19-19-19',
    remainingBudget: '48.5 kg/ha N',
    consumedBudget: '51.5 kg/ha N (51.5%)',
    envStatus: 'SAFE (No runoff risk)',
    confidence: 'HIGH (95%)',
    lastUpdated: '14 seconds ago',
  };

  const timelineEvents = [
    {
      id: 1,
      time: 'Today 11:42 AM',
      type: 'APPLICATION',
      title: 'Variable Rate Sprayed',
      desc: '12.4 L/min applied by SPRAYER-01. Total 41.6 kg/ha delivered.',
      badge: 'MEASURED',
    },
    {
      id: 2,
      time: 'Today 09:15 AM',
      type: 'SENSOR',
      title: 'Soil Moisture Telemetry',
      desc: 'Probe NODE-047 reported 42.1% VWC at 15cm depth.',
      badge: 'LIVE',
    },
    {
      id: 3,
      time: 'Yesterday 04:30 PM',
      type: 'PRESCRIPTION',
      title: 'Growth-Stage Prescription Updated',
      desc: 'Shifted from Vegetative to Tillering NPK 19-19-19 target.',
      badge: 'ESTIMATED',
    },
    {
      id: 4,
      time: '2 days ago',
      type: 'NOTE',
      title: 'Field Observation',
      desc: 'Operator noted uniform emergence. No pest pressure observed.',
      badge: 'OPERATOR',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 p-4 space-y-4 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <a href="/mobile/map" className="text-slate-400 hover:text-white text-base">
            &larr;
          </a>
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-400">Green Valley &bull; Field 3</span>
            <h1 className="text-xl font-black text-white">Grid {gridData.code}</h1>
          </div>
        </div>
        <span className="rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold">
          OPTIMAL
        </span>
      </div>

      {/* Grid Quick View Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="text-slate-400">Agronomic Status</span>
          <span className="text-emerald-400 font-mono text-[10px]">{gridData.lastUpdated}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Crop / Variety</span>
            <div className="font-bold text-white mt-0.5">{gridData.crop}</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Growth Stage</span>
            <div className="font-bold text-emerald-400 mt-0.5">{gridData.stage}</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Soil Texture</span>
            <div className="font-bold text-slate-200 mt-0.5">{gridData.soilType}</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Soil pH / EC</span>
            <div className="font-bold text-slate-200 mt-0.5">{gridData.ph} / {gridData.ec}</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Active Prescription</span>
            <div className="font-bold text-emerald-300 mt-0.5">{gridData.targetRx}</div>
          </div>
          <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
            <span className="text-slate-400">Remaining Budget</span>
            <div className="font-bold text-emerald-400 mt-0.5">{gridData.remainingBudget}</div>
          </div>
        </div>
      </div>

      {/* Vertical History Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-white">Grid Event Timeline</h2>
          <span className="text-[10px] text-slate-400 font-mono">Multi-subsystem log</span>
        </div>

        <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-2">
          {timelineEvents.map((evt) => (
            <div key={evt.id} className="relative">
              {/* Timeline marker */}
              <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">{evt.time}</span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                  {evt.badge}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mt-0.5">{evt.title}</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{evt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={`/mobile/notes?grid=${gridData.code}`}
          className="flex-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 shadow"
        >
          📝 Record Field Note
        </a>
        <a
          href={`/mobile/monitoring`}
          className="flex-1 text-center rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-200 border border-slate-700"
        >
          🚜 Live Sprayer
        </a>
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
        <a href="/mobile/monitoring" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🚜</span>
          <span className="text-[10px]">Sprayer</span>
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
