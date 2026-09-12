'use client';

import React, { useState } from 'react';

interface ClaimItem {
  id: string;
  category: 'AGRONOMY' | 'CONTROL' | 'SUSTAINABILITY' | 'HARDWARE' | 'AI';
  claim: string;
  evidence: string;
  status: 'SIMULATED' | 'ESTIMATED' | 'MEASURED' | 'PROJECTED';
  limitation: string;
  futureValidation: string;
}

const CLAIMS: ClaimItem[] = [
  {
    id: 'C1',
    category: 'SUSTAINABILITY',
    claim: 'SOIL IQ reduces unnecessary fertilizer application by 15-20% in variable soils.',
    evidence: 'Closed-loop simulation comparing spatial prescription application against conventional uniform blanket application across Green Valley Farm.',
    status: 'SIMULATED',
    limitation: 'No multi-season controlled field trial conducted yet.',
    futureValidation: 'Phase 4 Field Pilot: Side-by-side A/B plot testing with identical seed and climate variables.',
  },
  {
    id: 'C2',
    category: 'CONTROL',
    claim: 'Sprayer automatically shuts off flow within 350ms upon entering a riparian buffer zone or high rain event.',
    evidence: 'Deterministic control engine unit tests and Hardware-In-The-Loop (HIL) simulation test harness.',
    status: 'MEASURED',
    limitation: 'Physical solenoid valve latency depends on machine hydraulic response time (typically 200-400ms).',
    futureValidation: 'Phase 2 Bench Testing: Oscilloscope measurement of pulse-width modulated solenoid actuation.',
  },
  {
    id: 'C3',
    category: 'AGRONOMY',
    claim: 'Grid-specific nutrient budgets prevent localized nitrogen overaccumulation.',
    evidence: 'Mathematical ledger debits tracking pure elemental N-P-K against crop growth-stage capacity.',
    status: 'ESTIMATED',
    limitation: 'Soil mineralization rates vary with temperature, microbial activity, and unmodeled drainage gradients.',
    futureValidation: 'Phase 3 Controlled Plot: Pre- and post-harvest core soil sampling analyzed in certified soil laboratory.',
  },
  {
    id: 'C4',
    category: 'HARDWARE',
    claim: 'Position accuracy achieves ±2.4 cm using RTK-GNSS fix states.',
    evidence: 'NMEA 0183 GGA sentence parsing and simulated dual-frequency multi-constellation RTK telemetry.',
    status: 'SIMULATED',
    limitation: 'Requires base-station correction link (NTRIP or LoRa 868/915 MHz) within 15 km baseline.',
    futureValidation: 'Phase 2 Bench Testing: Stationary RTK receiver test over survey marker with 24-hour circular error probable (CEP).',
  },
  {
    id: 'C5',
    category: 'AI',
    claim: 'AI farm assistant explains control decisions without hallucination or unauthorized machine override.',
    evidence: 'Strict schema validation, prompt boundaries, read-only tools, and deterministic safety interlocks.',
    status: 'MEASURED',
    limitation: 'LLM responses rely on accuracy of underlying structured facts stored in relational database.',
    futureValidation: 'Automated regression benchmark comparing generated explanations against agronomic truth sets.',
  },
  {
    id: 'C6',
    category: 'SUSTAINABILITY',
    claim: 'Reduces chemical leaching into local groundwater aquifers during rainfall events.',
    evidence: 'Environmental lockout automatically defers spraying when 2-hour rain probability exceeds 75% on saturated topsoil.',
    status: 'SIMULATED',
    limitation: 'Groundwater transport depends on unmodeled soil stratigraphy and sub-surface tile drainage.',
    futureValidation: 'Phase 5 Multi-Season Trial: Lysimeter soil leachate sampling at 1-meter depth.',
  },
];

export default function ValidationClaimsPage() {
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = filter === 'ALL' ? CLAIMS : CLAIMS.filter((c) => c.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Scientific Credibility & Red-Team Audit
            </span>
            <h1 className="text-2xl font-black text-white mt-1">System Claims Validation Matrix</h1>
            <p className="text-xs text-slate-400 mt-1">
              Transparent, rigorous accounting of every system claim, evidence type, limitation, and future validation path.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <a
              href="/validation/agronomy"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
            >
              Agronomic Provenance
            </a>
            <a
              href="/validation/roadmap"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
            >
              Validation Roadmap
            </a>
            <a
              href="/trust"
              className="rounded-lg bg-emerald-800/80 hover:bg-emerald-700 px-3 py-1.5 text-white font-semibold"
            >
              User Trust Center
            </a>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['ALL', 'AGRONOMY', 'CONTROL', 'SUSTAINABILITY', 'HARDWARE', 'AI'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                filter === cat
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Claims Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Claim</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Supporting Evidence</th>
                <th className="p-3.5">Current Limitation</th>
                <th className="p-3.5">Future Field Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-semibold text-white max-w-xs">{item.claim}</td>
                  <td className="p-3.5">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        item.status === 'MEASURED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : item.status === 'SIMULATED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-xs">{item.evidence}</td>
                  <td className="p-3.5 text-slate-400 max-w-xs">{item.limitation}</td>
                  <td className="p-3.5 text-emerald-400/90 max-w-xs">{item.futureValidation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scientific Honesty Disclaimer Banner */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 flex items-start gap-3">
          <span className="text-emerald-400 text-base">ℹ</span>
          <div>
            <strong className="text-slate-200">Scientific Integrity Principle: </strong>
            SOIL IQ is an agricultural decision-support and control architecture. We strictly distinguish prototype simulation outcomes from controlled field trials. No universal toxicological threshold or guaranteed yield is ever promised without authoritative agronomic validation.
          </div>
        </div>
      </div>
    </div>
  );
}
