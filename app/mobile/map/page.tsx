'use client';

import React, { useState, useEffect } from 'react';

interface GridCell {
  id: string;
  code: string;
  status: 'OPTIMAL' | 'CAUTION' | 'EXCESS_RISK' | 'BLOCKED';
  crop: string;
  rxRate: number;
  moisture: number;
  hasAlert?: boolean;
}

const DEMO_GRIDS: GridCell[] = [
  { id: 'g-01', code: 'G041', status: 'OPTIMAL', crop: 'Rice (Tillering)', rxRate: 40, moisture: 38 },
  { id: 'g-02', code: 'G042', status: 'OPTIMAL', crop: 'Rice (Tillering)', rxRate: 42, moisture: 40 },
  { id: 'g-03', code: 'G043', status: 'CAUTION', crop: 'Rice (Tillering)', rxRate: 36, moisture: 45 },
  { id: 'g-04', code: 'G044', status: 'OPTIMAL', crop: 'Rice (Tillering)', rxRate: 40, moisture: 39 },
  { id: 'g-05', code: 'G045', status: 'EXCESS_RISK', crop: 'Rice (Tillering)', rxRate: 25, moisture: 50, hasAlert: true },
  { id: 'g-06', code: 'G046', status: 'OPTIMAL', crop: 'Rice (Tillering)', rxRate: 44, moisture: 37 },
  { id: 'g-07', code: 'G047', status: 'OPTIMAL', crop: 'Rice (Tillering)', rxRate: 42, moisture: 42 },
  { id: 'g-08', code: 'G048', status: 'BLOCKED', crop: 'Riparian Buffer', rxRate: 0, moisture: 62, hasAlert: true },
  { id: 'g-09', code: 'G049', status: 'CAUTION', crop: 'Rice (Tillering)', rxRate: 35, moisture: 46 },
  { id: 'g-10', code: 'G050', status: 'OPTIMAL', crop: 'Rice (Tillering)', rxRate: 40, moisture: 41 },
];

export default function MobileMapPage() {
  const [selectedGrid, setSelectedGrid] = useState<GridCell>(DEMO_GRIDS[6]); // G047 default
  const [locating, setLocating] = useState<boolean>(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Tap "Use GPS" to detect current field');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setLocationStatus('Acquiring RTK/GNSS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationStatus(`Locked: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} (±${Math.round(pos.coords.accuracy)}m)`);
        // In real use, calls backend spatial resolution to match grid
        setSelectedGrid(DEMO_GRIDS[6]); // G047
      },
      (err) => {
        setLocating(false);
        setLocationStatus(`GPS permission denied or unavailable (${err.message}). Showing manual grid selection.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getStatusColor = (status: GridCell['status']) => {
    switch (status) {
      case 'OPTIMAL':
        return 'fill-emerald-600/60 stroke-emerald-400';
      case 'CAUTION':
        return 'fill-amber-600/60 stroke-amber-400';
      case 'EXCESS_RISK':
        return 'fill-orange-600/60 stroke-orange-400';
      case 'BLOCKED':
        return 'fill-rose-700/70 stroke-rose-500';
      default:
        return 'fill-slate-700/60 stroke-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 p-4 space-y-4 max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Green Valley Farm</span>
          <h1 className="text-base font-black text-white">Spatial Field Map</h1>
        </div>
        <button
          onClick={handleGetLocation}
          disabled={locating}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-slate-950 shadow flex items-center gap-1.5"
        >
          <span>📍</span>
          <span>{locating ? 'Acquiring...' : 'Use GPS'}</span>
        </button>
      </div>

      {/* GPS Status pill */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-300 flex items-center justify-between">
        <span className="truncate">{locationStatus}</span>
        {userLoc && <span className="rounded bg-emerald-950 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5">ACTIVE FIX</span>}
      </div>

      {/* Mobile SVG Field Map */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>Field 3 &mdash; 10 Spatial Grids</span>
          <span className="text-slate-500">Tap grid to inspect</span>
        </div>

        <div className="relative aspect-square w-full bg-slate-950/80 rounded-xl border border-slate-800 p-2 overflow-hidden">
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {/* Riparian buffer zone indicator at bottom */}
            <rect x="10" y="235" width="280" height="55" rx="8" fill="#4c0519" stroke="#9f1239" strokeWidth="1" strokeDasharray="3 2" />
            <text x="20" y="270" fill="#fda4af" fontSize="10" fontWeight="bold">Riparian Waterway Buffer Zone</text>

            {/* Grid Cells: 2 rows of 5 */}
            {DEMO_GRIDS.map((g, idx) => {
              const row = Math.floor(idx / 5);
              const col = idx % 5;
              const x = 15 + col * 55;
              const y = 20 + row * 105;
              const isSelected = selectedGrid.id === g.id;

              return (
                <g key={g.id} onClick={() => setSelectedGrid(g)} className="cursor-pointer">
                  <rect
                    x={x}
                    y={y}
                    width="48"
                    height="95"
                    rx="6"
                    className={`${getStatusColor(g.status)} transition-all`}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    stroke={isSelected ? '#ffffff' : undefined}
                  />
                  <text
                    x={x + 24}
                    y={y + 35}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {g.code}
                  </text>
                  <text
                    x={x + 24}
                    y={y + 55}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontWeight="medium"
                  >
                    {g.rxRate > 0 ? `${g.rxRate}kg` : '0kg'}
                  </text>

                  {/* Alert marker badge */}
                  {g.hasAlert && (
                    <circle cx={x + 40} cy={y + 12} r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                  )}

                  {/* Machine marker on G047 */}
                  {g.code === 'G047' && (
                    <g transform={`translate(${x + 16}, ${y + 68})`}>
                      <circle cx="8" cy="8" r="7" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="8" y="11" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">🚜</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Optimal</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Caution</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Excess</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-600" /> Blocked</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> 🚜 Sprayer</span>
        </div>
      </div>

      {/* Selected Grid Card */}
      {selectedGrid && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] uppercase text-slate-400">Selected Grid</span>
              <div className="text-xl font-black text-white">{selectedGrid.code}</div>
            </div>
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              selectedGrid.status === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
              selectedGrid.status === 'BLOCKED' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
              'bg-amber-950 text-amber-300 border border-amber-700'
            }`}>
              {selectedGrid.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <span className="text-slate-400">Crop / Variety</span>
              <div className="font-semibold text-white mt-0.5">{selectedGrid.crop}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <span className="text-slate-400">Target Rx</span>
              <div className="font-semibold text-emerald-400 mt-0.5">{selectedGrid.rxRate} kg/ha</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <span className="text-slate-400">Soil Moisture</span>
              <div className="font-semibold text-slate-200 mt-0.5">{selectedGrid.moisture}%</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <span className="text-slate-400">Confidence</span>
              <div className="font-semibold text-emerald-400 mt-0.5">HIGH (95%)</div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <a
              href={`/mobile/grids/${selectedGrid.code}`}
              className="flex-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-slate-950"
            >
              Inspect Grid Details &rarr;
            </a>
            <a
              href={`/mobile/notes?grid=${selectedGrid.code}`}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 border border-slate-700"
            >
              Add Note
            </a>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 py-2 px-4 backdrop-blur flex justify-around text-center text-xs">
        <a href="/mobile" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🏠</span>
          <span className="text-[10px]">Home</span>
        </a>
        <a href="/mobile/map" className="text-emerald-400 font-bold flex flex-col items-center">
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
