'use client';

import React from 'react';

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Transparency & Data Integrity
            </span>
            <h1 className="text-2xl font-black text-white mt-1">SOIL IQ User Trust Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Transparent explanations of how our platform operates, what is measured versus simulated, and our strict safety boundaries.
            </p>
          </div>
          <a
            href="/validation"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Claims Matrix
          </a>
        </div>

        {/* What SOIL IQ Does NOT Do Card */}
        <div className="rounded-2xl border border-rose-800/50 bg-rose-950/20 p-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-rose-900/40 pb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-bold">
              ✕
            </span>
            <h2 className="text-lg font-bold text-rose-400">
              What SOIL IQ Does NOT Do (Boundaries of Scope)
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800">
              <strong className="text-white block mb-1">1. Does NOT replace laboratory soil testing</strong>
              <p className="text-slate-400 leading-relaxed">
                Chemical soil assays are the gold standard. SOIL IQ imports lab test results to establish initial grid baselines rather than pretending inexpensive IoT probes measure atomic N-P-K.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800">
              <strong className="text-white block mb-1">2. Does NOT guarantee agricultural crop yields</strong>
              <p className="text-slate-400 leading-relaxed">
                Harvest yields depend on hundreds of biological, climatic, and pest factors outside fertilizer application. We optimize input efficiency, not crop guarantees.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800">
              <strong className="text-white block mb-1">3. Does NOT set universal toxicological limits</strong>
              <p className="text-slate-400 leading-relaxed">
                Budgets are agronomic recommendations customized to specific field histories and crop stages, not universal statutory thresholds.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800">
              <strong className="text-white block mb-1">4. Does NOT autonomously operate uncertified machinery</strong>
              <p className="text-slate-400 leading-relaxed">
                Physical machine actuation remains gated behind safety checklists. In prototype mode, all physical machine control remains simulated.
              </p>
            </div>
          </div>
        </div>

        {/* How The Architecture Works Section */}
        <div className="space-y-4 text-xs">
          <h2 className="text-base font-bold text-white">How SOIL IQ Works: Core Architecture</h2>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="font-bold text-emerald-400 text-sm mb-1">How Measurements Work</h3>
            <p className="text-slate-300 leading-relaxed">
              We ingest soil moisture, temperature, and electrical conductivity from in-situ probes, combine them with imported laboratory nutrient tests, and compute instantaneous moisture stability and nutrient availability scores.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="font-bold text-emerald-400 text-sm mb-1">How Prescriptions Work</h3>
            <p className="text-slate-300 leading-relaxed">
              Each grid receives a field-specific fertilizer recommendation derived from crop growth stage nutrient requirements, historical fertilizer applications recorded in the nutrient ledger, and baseline soil state.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="font-bold text-emerald-400 text-sm mb-1">How Control Works</h3>
            <p className="text-slate-300 leading-relaxed">
              The smart sprayer tracks RTK-GNSS coordinates, identifies its spatial grid, and reads the active prescription. If flow deviates &gt;15%, the budget is approached (&gt;80%), or rainfall threatens, the deterministic engine automatically throttles or halts application.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h3 className="font-bold text-emerald-400 text-sm mb-1">How AI Is Constrained</h3>
            <p className="text-slate-300 leading-relaxed">
              AI models are read-only tools used exclusively for explaining control decisions, summarizing farm telemetry, and answering operator questions. AI never has authority to activate machine valves or alter nutrient ledgers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
