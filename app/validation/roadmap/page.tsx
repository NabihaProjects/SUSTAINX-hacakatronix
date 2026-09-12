'use client';

import React from 'react';

export default function ValidationRoadmapPage() {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Simulation & Digital Twin Validation',
      timeline: 'Current Milestone (Completed)',
      objective: 'Verify closed-loop control logic, spatial grid resolution, and emergency stops using simulated telemetry.',
      metrics: '100% test pass rate across 41 intelligence cases and 15 safe failure modes.',
      status: 'COMPLETED',
    },
    {
      phase: 'Phase 2',
      title: 'Hardware Bench Testing with Real Sensors',
      timeline: 'Months 1–3 Post-Hackathon',
      objective: 'Connect physical RTK-GNSS receiver, electromagnetic flow meter, and LoRa gateway in laboratory bench setup.',
      metrics: 'Sub-350ms command latency and ±2.5 cm position accuracy verification.',
      status: 'PLANNED',
    },
    {
      phase: 'Phase 3',
      title: 'Controlled Plot A/B Trial',
      timeline: 'Months 4–7',
      objective: '1-acre split-plot trial comparing conventional uniform application vs. SOIL IQ variable application.',
      metrics: 'Measure pre- and post-application soil core nitrogen levels and crop biomass indices.',
      status: 'PROPOSED',
    },
    {
      phase: 'Phase 4',
      title: 'Farm Field Pilot (10–50 Acres)',
      timeline: 'Months 8–12',
      objective: 'Deploy edge controller onto tractor sprayer boom with real-time RTK positioning and section valves.',
      metrics: '15-20% chemical input reduction with zero crop yield penalty.',
      status: 'ROADMAP',
    },
    {
      phase: 'Phase 5',
      title: 'Multi-Season Agronomic Validation',
      timeline: 'Year 2',
      objective: 'Partner with agricultural universities across diverse soil types (Alluvial, Black, Red) and seasonal monsoon conditions.',
      metrics: 'Peer-reviewed agronomic publication and third-party certified sustainability ledger.',
      status: 'ROADMAP',
    },
    {
      phase: 'Phase 6',
      title: 'Commercial Multi-Farm SaaS Rollout',
      timeline: 'Year 3',
      objective: 'Scale to enterprise agricultural cooperatives and commercial precision spraying fleets.',
      metrics: 'Multi-tenant fleet management, automated compliance reporting, and certified carbon offsets.',
      status: 'FUTURE VISION',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Agronomic & Engineering Roadmap
            </span>
            <h1 className="text-2xl font-black text-white mt-1">6-Phase Real-World Validation Roadmap</h1>
            <p className="text-xs text-slate-400 mt-1">
              A transparent, disciplined path from hackathon software prototype to field trial validation and commercial deployment.
            </p>
          </div>
          <a
            href="/validation"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Back to Claims Matrix
          </a>
        </div>

        {/* Phase Cards */}
        <div className="space-y-4">
          {phases.map((p, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
                    {p.phase}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">({p.timeline})</span>
                </div>
                <h3 className="text-base font-bold text-white">{p.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{p.objective}</p>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-200">Success Metric: </strong>
                  {p.metrics}
                </div>
              </div>

              <div>
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    p.status === 'COMPLETED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Proposed Pilot Trial Design */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-2">
            Proposed Controlled Field Pilot Design (A/B Plot Trial)
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            To scientifically validate SOIL IQ chemical savings, we propose a split-plot randomized trial on a 10-acre parcel divided into two equal 5-acre zones with identical seed variety, planting dates, and irrigation:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-rose-900/40 bg-slate-950/70 p-4">
              <div className="font-bold text-rose-400 mb-1">Zone A: Conventional Blanket Control</div>
              <ul className="space-y-1 text-slate-400 list-disc list-inside">
                <li>Fixed uniform application rate (150 kg/ha NPK)</li>
                <li>Static calendar-based application schedule</li>
                <li>No spatial grid variation or runoff interlocks</li>
                <li>Baseline reference for chemical consumption and runoff</li>
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-800/40 bg-slate-950/70 p-4">
              <div className="font-bold text-emerald-400 mb-1">Zone B: SOIL IQ Precision Treatment</div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>Grid-specific dynamic prescription rates (80 to 140 kg/ha)</li>
                <li>RTK-GNSS variable rate machine throttling</li>
                <li>Automated weather-risk deferral during rainfall events</li>
                <li>Continuous soil moisture feedback from sensor nodes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
