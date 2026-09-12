'use client';

import React, { useState, useEffect } from 'react';

export default function MobileOperatorDashboard() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [currentGrid] = useState({
    code: 'G047',
    field: 'Field 3 (Rice)',
    farm: 'Green Valley Farm',
    status: 'OPTIMAL',
    targetRx: '42 kg/ha NPK',
    nRemaining: '48.5 kg',
    moisture: '38.2%',
    soilHealth: '88/100',
    freshness: 'Updated 12 sec ago',
  });

  const [machine] = useState({
    name: 'SPRAYER-01',
    rtk: 'RTK FIXED (2.1cm)',
    flow: '12.4 L/min',
    tank: '68% (408L)',
    decision: 'CONTINUE',
    env: 'SAFE',
  });

  const [tasks] = useState([
    { id: 1, title: 'Inspect sensor NODE-047 in G047', priority: 'CRITICAL', status: 'OPEN' },
    { id: 2, title: 'Review G048 elevated moisture alert', priority: 'HIGH', status: 'OPEN' },
    { id: 3, title: 'Check chemical tank level for next pass', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  ]);

  const [installPromptDismissed, setInstallPromptDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 select-none">
      {/* Mobile Top Header with Connection Indicator */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 px-4 py-3 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="font-extrabold text-base tracking-tight text-white">
            SOIL IQ <span className="text-emerald-400 font-normal">FIELD</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              isOnline
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-amber-950 text-amber-300 border border-amber-700/60 animate-pulse'
            }`}
          >
            {isOnline ? '● LIVE (Synced)' : '○ OFFLINE CACHE'}
          </span>
          <a
            href="/mobile/profile"
            className="rounded-full bg-slate-800 p-1 text-slate-300 hover:text-white"
            title="Profile & Settings"
          >
            ⚙️
          </a>
        </div>
      </header>

      {/* Non-intrusive PWA Install Banner */}
      {!installPromptDismissed && (
        <div className="bg-emerald-950/70 border-b border-emerald-800/80 px-4 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span>📲</span>
            <span>Install SOIL IQ for offline field operation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert('PWA install prompt triggered. Follow browser prompt to add to home screen.');
                setInstallPromptDismissed(true);
              }}
              className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-slate-950"
            >
              Install
            </button>
            <button
              onClick={() => setInstallPromptDismissed(true)}
              className="text-emerald-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Operator Content */}
      <main className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Farm & Location Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Current Farm & Field</span>
            <span className="text-[10px] text-emerald-400 font-mono">{currentGrid.freshness}</span>
          </div>
          <div className="text-base font-bold text-white">{currentGrid.farm}</div>
          <div className="text-xs text-slate-300">{currentGrid.field}</div>
        </div>

        {/* Current Grid Card */}
        <div className="rounded-2xl border border-emerald-800/40 bg-slate-900/90 p-4 shadow">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Current Grid</span>
              <div className="text-2xl font-black text-emerald-400">{currentGrid.code}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-950 border border-emerald-700 px-3 py-1 text-xs font-bold text-emerald-300">
                {currentGrid.status}
              </span>
              <a
                href={`/mobile/grids/${currentGrid.code}`}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 font-semibold border border-slate-700"
              >
                Inspect &rarr;
              </a>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Recommended Rx</div>
              <div className="text-sm font-bold text-white mt-0.5">{currentGrid.targetRx}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Remaining Budget</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{currentGrid.nRemaining} N</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Topsoil Moisture</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">{currentGrid.moisture}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Soil Health Score</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{currentGrid.soilHealth}</div>
            </div>
          </div>
        </div>

        {/* Live Machine State Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Machine Fleet</span>
              <div className="text-base font-bold text-white">{machine.name}</div>
            </div>
            <span className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-black text-slate-950 uppercase tracking-wide">
              {machine.decision}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Positioning</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">{machine.rtk}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Flow Output</div>
              <div className="text-xs font-bold text-white mt-0.5">{machine.flow}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Tank Volume</div>
              <div className="text-xs font-bold text-slate-200 mt-0.5">{machine.tank}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800/80">
              <div className="text-slate-400">Environment</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">{machine.env}</div>
            </div>
          </div>
        </div>

        {/* Quick Module Grid */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <a
            href="/mobile/map"
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 hover:border-emerald-500 transition flex flex-col items-center"
          >
            <span className="text-lg">🗺️</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">Field Map</span>
          </a>
          <a
            href="/mobile/prescriptions"
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 hover:border-emerald-500 transition flex flex-col items-center"
          >
            <span className="text-lg">💊</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">Prescriptions</span>
          </a>
          <a
            href="/mobile/sensors"
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 hover:border-emerald-500 transition flex flex-col items-center"
          >
            <span className="text-lg">📡</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">Sensors</span>
          </a>
          <a
            href="/mobile/notes"
            className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 hover:border-emerald-500 transition flex flex-col items-center"
          >
            <span className="text-lg">📝</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">Notes</span>
          </a>
        </div>

        {/* Operator Tasks */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">Assigned Operator Tasks</span>
            <a href="/mobile/tasks" className="text-emerald-400 font-medium">View All &rarr;</a>
          </div>

          <div className="space-y-2 text-xs">
            {tasks.map((t) => (
              <div key={t.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{t.title}</div>
                  <span className={`text-[9px] font-bold uppercase mt-0.5 inline-block ${
                    t.priority === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <button className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white">
                  Done
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 py-2 px-4 backdrop-blur flex justify-around text-center text-xs">
        <a href="/mobile" className="text-emerald-400 font-bold flex flex-col items-center">
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
        <a href="/mobile/profile" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">⚙️</span>
          <span className="text-[10px]">Profile</span>
        </a>
      </nav>
    </div>
  );
}
