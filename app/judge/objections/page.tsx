'use client';

import React from 'react';

export default function JudgeObjectionsPage() {
  const objections = [
    {
      q: 'How do you know N/P/K if low-cost sensors cannot directly measure laboratory-grade ionic nutrients?',
      a: 'SOIL IQ strictly separates continuous in-situ sensor telemetry (soil moisture, temperature, EC, ambient climate) from laboratory soil test data. The architecture imports calibrated baseline soil assays, then computes dynamic depletion and availability using agronomic models. We never claim a generic probe measures pure N directly in real-time.',
    },
    {
      q: 'What happens if GPS has high drift or loses fix in dense tree canopies?',
      a: 'Position confidence is explicitly tracked. SOIL IQ requires RTK_FIXED (<5cm accuracy) or RTK_FLOAT (<50cm) for automated variable application. If the GNSS receiver enters NO_FIX or accuracy degrades >5m, the machine immediately executes a deterministic safe stop.',
    },
    {
      q: 'What happens if cellular connectivity drops in rural field conditions?',
      a: 'SOIL IQ incorporates an Edge Controller architecture (EdgeGateway). The approved prescription, grid boundaries, and safety policies are cached locally in edge memory before the sprayer starts. The edge controller executes local decisions and buffers telemetry offline, synchronizing idempotently with the cloud upon reconnection.',
    },
    {
      q: 'Is this just another fertilizer recommendation calculator?',
      a: 'No. Traditional calculators recommend a static, uniform blanket dosage based on static inputs. SOIL IQ closes the physical-to-digital loop: field-specific spatial grids + real-time RTK machine tracking + flow totalizer measuring actual chemical output + environmental risk lockouts + automated machine throttle control.',
    },
    {
      q: 'Is an AI model autonomously actuating agricultural valves and machinery?',
      a: 'No. Safety-critical machine control is 100% deterministic, rule-based, and auditable. AI and LLM agents are strictly limited to explanation generation, anomaly detection, and decision support. The control engine cannot be overridden by AI.',
    },
    {
      q: 'Are your sustainability savings and cost numbers validated field trial results?',
      a: 'Prototype numbers are calculated from deterministic simulations comparing prescribed application vs. conventional blanket practice ($0.68/kg NPK baseline). We explicitly label all metrics as SIMULATED or ESTIMATED until multi-season controlled field trials are conducted according to our 6-phase roadmap.',
    },
    {
      q: 'Why not wait for full robotic autonomy?',
      a: 'Retrofitting existing ISOBUS sprayers with edge controllers and solenoid section valves provides immediate 15-20% chemical reduction today without requiring multi-million dollar autonomous tractor replacements.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Skeptical Judge Defense
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Judge Objection Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Honest, scientifically grounded answers to the toughest technical, agronomic, and operational inquiries.
            </p>
          </div>
          <a
            href="/judge"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Back to Judge Mode
          </a>
        </div>

        <div className="space-y-4">
          {objections.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow"
            >
              <h3 className="text-sm font-bold text-emerald-300 flex items-start gap-2">
                <span className="text-slate-500 font-mono">Q{idx + 1}.</span>
                {item.q}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300 border-t border-slate-800/80 pt-2 pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
