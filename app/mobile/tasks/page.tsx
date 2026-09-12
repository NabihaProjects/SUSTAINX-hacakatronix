'use client';

import React, { useState } from 'react';

export default function MobileTasksPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Inspect sensor NODE-047 in G047', priority: 'CRITICAL', status: 'OPEN', target: 'Grid F01-G047' },
    { id: 2, title: 'Review G048 elevated moisture alert', priority: 'HIGH', status: 'OPEN', target: 'Grid F01-G048' },
    { id: 3, title: 'Check chemical tank level for next pass', priority: 'MEDIUM', status: 'IN_PROGRESS', target: 'SPRAYER-01' },
    { id: 4, title: 'Calibrate flow meter pulse sensor', priority: 'LOW', status: 'COMPLETED', target: 'Equipment Barn' },
  ]);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'COMPLETED' ? 'OPEN' : 'COMPLETED' }
          : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-white">Operator Field Tasks</h1>
        <span className="text-xs text-slate-400">
          {tasks.filter((t) => t.status !== 'COMPLETED').length} Pending
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleTask(t.id)}
            className={`rounded-2xl border p-4 shadow cursor-pointer transition ${
              t.status === 'COMPLETED'
                ? 'border-slate-800/40 bg-slate-900/40 opacity-60'
                : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-white'}`}>
                  {t.title}
                </div>
                <div className="text-[10px] text-slate-400">Target: {t.target}</div>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                  t.priority === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : t.priority === 'HIGH'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {t.priority}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>Status: <strong className="text-slate-300">{t.status}</strong></span>
              <span className="text-emerald-400 font-semibold">Tap to toggle</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
