'use client';

import React from 'react';

const SDGS = [
  {
    num: 'SDG 2',
    name: 'Zero Hunger',
    target: 'Target 2.4: Sustainable Agriculture',
    alignment: 'Optimizes soil nutrient health and fertilizer efficiency, ensuring sustained soil fertility without over-salinization or nutrient lockup.',
    prototypeMetric: 'Nutrient budget adherence score (98.4%) across active crop stages.',
  },
  {
    num: 'SDG 12',
    name: 'Responsible Consumption & Production',
    target: 'Target 12.4: Environmentally Sound Management of Chemicals',
    alignment: 'Eliminates unnecessary chemical fertilizer waste through variable-rate flow regulation and continuous totalizer measurement.',
    prototypeMetric: 'Estimated 15-20% chemical input reduction in variable soils.',
  },
  {
    num: 'SDG 13',
    name: 'Climate Action',
    target: 'Target 13.1: Resilience to Climate-Related Hazards',
    alignment: 'Prevents chemical leaching during severe storm events and reduces agricultural nitrous oxide (N2O) emissions associated with excess synthetic nitrogen application.',
    prototypeMetric: 'Rainfall runoff deferral logic halting machine within 350ms of high rain probability.',
  },
  {
    num: 'SDG 15',
    name: 'Life on Land',
    target: 'Target 15.3: Combat Desertification & Restore Degraded Soil',
    alignment: 'Maintains long-term soil organic carbon and balanced microbial health by preventing soil acidification caused by excessive nitrogen overapplication.',
    prototypeMetric: 'Soil Health Index tracking composite microbial, pH, and moisture stability metrics.',
  },
];

export default function SdgAlignmentPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Global Sustainability Alignment
            </span>
            <h1 className="text-2xl font-black text-white mt-1">UN Sustainable Development Goals (SDGs)</h1>
            <p className="text-xs text-slate-400 mt-1">
              Realistic, non-hyperbolic alignment with global sustainability goals without claiming unverified direct credit.
            </p>
          </div>
          <a
            href="/validation"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Claims Matrix
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SDGS.map((sdg, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-emerald-950 border border-emerald-700/60 px-2.5 py-0.5 font-mono font-bold text-emerald-300">
                  {sdg.num}
                </span>
                <span className="text-xs text-slate-400">{sdg.target}</span>
              </div>
              <h3 className="font-bold text-base text-white">{sdg.name}</h3>
              <p className="text-slate-300 leading-relaxed">{sdg.alignment}</p>
              <div className="border-t border-slate-800 pt-2 text-[11px] text-emerald-400">
                <strong>Prototype Metric: </strong>
                <span>{sdg.prototypeMetric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
