'use client';

import React, { useState } from 'react';

interface SensorNode {
  id: string;
  name: string;
  type: string;
  gridCode: string;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  batteryPct: number;
  signalDbm: number;
  moisturePct: number;
  tempC: number;
  ecDsM: number;
  freshness: string;
  calibrationDate: string;
}

const SENSORS: SensorNode[] = [
  {
    id: 's-01',
    name: 'NODE-047',
    type: 'Soil Moisture & EC Probe',
    gridCode: 'G047',
    status: 'ONLINE',
    batteryPct: 94,
    signalDbm: -68,
    moisturePct: 42.1,
    tempC: 24.2,
    ecDsM: 1.2,
    freshness: '14 sec ago',
    calibrationDate: '2026-08-15',
  },
  {
    id: 's-02',
    name: 'NODE-048',
    type: 'Riparian Sentry Node',
    gridCode: 'G048',
    status: 'WARNING',
    batteryPct: 62,
    signalDbm: -84,
    moisturePct: 62.4,
    tempC: 22.8,
    ecDsM: 2.4,
    freshness: '45 sec ago',
    calibrationDate: '2026-08-15',
  },
  {
    id: 's-03',
    name: 'NODE-045',
    type: 'In-Situ Nutrient Probe',
    gridCode: 'G045',
    status: 'ONLINE',
    batteryPct: 88,
    signalDbm: -72,
    moisturePct: 50.2,
    tempC: 25.1,
    ecDsM: 1.6,
    freshness: '2 min ago',
    calibrationDate: '2026-08-10',
  },
  {
    id: 's-04',
    name: 'WEATHER-01',
    type: 'Microclimate Weather Station',
    gridCode: 'F03-STATION',
    status: 'ONLINE',
    batteryPct: 100,
    signalDbm: -55,
    moisturePct: 0,
    tempC: 26.5,
    ecDsM: 0,
    freshness: '5 sec ago',
    calibrationDate: '2026-08-01',
  },
];

export default function MobileSensorsPage() {
  const [selectedSensor, setSelectedSensor] = useState<SensorNode | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 p-4 space-y-4 max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">IoT Sensor Network</span>
          <h1 className="text-base font-black text-white">Assigned Sensor Fleet</h1>
        </div>
        <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 text-xs font-bold">
          4 Active Nodes
        </span>
      </div>

      {/* Sensor List */}
      <div className="space-y-3">
        {SENSORS.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedSensor(selectedSensor?.id === s.id ? null : s)}
            className={`rounded-2xl border p-4 shadow-xl transition cursor-pointer ${
              s.status === 'WARNING'
                ? 'border-amber-800/60 bg-slate-900/90'
                : 'border-slate-800 bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    s.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <span className="font-extrabold text-white text-sm">{s.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.type} &bull; {s.gridCode}</div>
              </div>
              <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                s.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {s.status}
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="rounded-xl bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">Moisture</span>
                <div className="font-bold text-white mt-0.5">
                  {s.moisturePct > 0 ? `${s.moisturePct}%` : 'N/A'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">Battery</span>
                <div className="font-bold text-emerald-400 mt-0.5">{s.batteryPct}%</div>
              </div>
              <div className="rounded-xl bg-slate-950 p-2 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">Signal</span>
                <div className="font-bold text-slate-200 mt-0.5">{s.signalDbm} dBm</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
              <span>Freshness: <strong className="text-emerald-400">{s.freshness}</strong></span>
              <span className="text-slate-500">Tap to {selectedSensor?.id === s.id ? 'collapse' : 'inspect'} &rarr;</span>
            </div>

            {/* Expanded details */}
            {selectedSensor?.id === s.id && (
              <div className="pt-3 border-t border-slate-800/80 text-xs space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-950 p-2">
                    <span className="text-slate-400 text-[10px]">Temperature</span>
                    <div className="font-semibold text-white">{s.tempC} &deg;C</div>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2">
                    <span className="text-slate-400 text-[10px]">Electrical Conductivity</span>
                    <div className="font-semibold text-white">{s.ecDsM} dS/m</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400">
                  Last Factory Calibrated: <strong className="text-slate-200">{s.calibrationDate}</strong> (ISO 17025)
                </div>
                <a
                  href={`/mobile/grids/${s.gridCode}`}
                  className="block text-center rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-slate-950 mt-2"
                >
                  View Grid {s.gridCode} &rarr;
                </a>
              </div>
            )}
          </div>
        ))}
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
        <a href="/mobile/sensors" className="text-emerald-400 font-bold flex flex-col items-center">
          <span className="text-base">📡</span>
          <span className="text-[10px]">Sensors</span>
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
