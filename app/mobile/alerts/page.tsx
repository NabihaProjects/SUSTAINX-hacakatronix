'use client';

import React, { useState } from 'react';

export default function MobileAlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: 'A1',
      title: 'Heavy Rainfall Risk (82% Prob)',
      severity: 'CRITICAL',
      category: 'ENVIRONMENT',
      message: 'Imminent rainfall detected. Sprayer in G048 deferred to prevent fertilizer runoff into drainage ditch.',
      time: '4 min ago',
      status: 'OPEN',
    },
    {
      id: 'A2',
      title: 'Nutrient Budget Caution Threshold',
      severity: 'WARNING',
      category: 'BUDGET',
      message: 'Grid G047 has consumed 82% of seasonal nitrogen allocation. Application rate throttled to 60%.',
      time: '18 min ago',
      status: 'OPEN',
    },
    {
      id: 'A3',
      title: 'Sensor Communication Restored',
      severity: 'INFO',
      category: 'HARDWARE',
      message: 'Node NODE-047 reconnected with 98% battery and normal soil moisture reading.',
      time: '1 hr ago',
      status: 'ACKNOWLEDGED',
    },
  ]);

  const handleAcknowledge = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white">Operator Alert Inbox</h1>
        <span className="text-xs text-slate-400">
          {alerts.filter((a) => a.status === 'OPEN').length} Active
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl border p-4 shadow space-y-2 ${
              a.status === 'ACKNOWLEDGED'
                ? 'border-slate-850 bg-slate-900/50 opacity-75'
                : a.severity === 'CRITICAL'
                ? 'border-rose-800/60 bg-rose-950/20'
                : 'border-amber-800/60 bg-amber-950/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                    a.severity === 'CRITICAL'
                      ? 'bg-rose-900 text-rose-200'
                      : a.severity === 'WARNING'
                      ? 'bg-amber-900 text-amber-200'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {a.severity}
                </span>
                <h3 className="font-bold text-white text-sm mt-1">{a.title}</h3>
              </div>
              <span className="text-[10px] text-slate-500">{a.time}</span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">{a.message}</p>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Status: <strong className="text-white">{a.status}</strong></span>
              {a.status === 'OPEN' && (
                <button
                  onClick={() => handleAcknowledge(a.id)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
