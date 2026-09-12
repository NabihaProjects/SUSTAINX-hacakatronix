'use client';

import React, { useState } from 'react';

interface SessionDetailProps {
  params: Promise<{ sessionId: string }>;
}

export default function SessionDetailPage({ params }: SessionDetailProps) {
  const unwrappedParams = React.use(params);
  const sessionId = unwrappedParams.sessionId;

  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'MAP' | 'METRICS' | 'AUDIT'>('TIMELINE');

  // Unified session timeline mock data representing the end-to-end operation
  const timelineEvents = [
    { time: '12:30:01', type: 'SESSION_STARTED', text: 'Session OP-2026-00047 started by Operator' },
    { time: '12:30:15', type: 'RTK_FIX_CHANGED', text: 'RTK fix acquired (RTK_FIXED, ±2.1cm)' },
    { time: '12:30:20', type: 'GRID_ENTERED', text: 'Entered F01-G001 (Rice - Tillering)' },
    { time: '12:30:21', type: 'PRESCRIPTION_LOADED', text: 'Prescription P-104 activated (Target: 42.0 kg/ha NPK)' },
    { time: '12:30:23', type: 'FLOW_STARTED', text: 'Spraying started. Flow rate 12.4 L/min (41.6 kg/ha)' },
    { time: '12:31:02', type: 'GRID_ENTERED', text: 'Transitioned across boundary into F01-G002' },
    { time: '12:31:05', type: 'APPLICATION_RATE_CHANGED', text: 'Prescription rate adjusted to 36.0 kg/ha. Valve throttled.' },
    { time: '12:31:18', type: 'ENVIRONMENT_CHANGED', text: 'Weather radar detected 82% rain probability within 2 hours' },
    { time: '12:31:20', type: 'APPLICATION_DEFERRED', text: 'Closed-loop runoff lockout triggered: DEFER' },
    { time: '12:31:21', type: 'VALVE_CLOSED', text: 'Solenoid boom valve closed. Zero chemical dispensed.' },
    { time: '12:34:10', type: 'SESSION_COMPLETED', text: 'Operation session completed. Audit ledger finalized.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/60">
                OP-2026-00047
              </span>
              <span className="text-xs text-slate-400">| Session ID: {sessionId}</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">Application Session Summary</h1>
            <p className="text-xs text-slate-300 mt-1">
              Green Valley Farm &bull; Field 3 &bull; Sprayer: <strong>SPRAYER-01</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <a
              href="/judge"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
            >
              &larr; Judge Mode
            </a>
          </div>
        </div>

        {/* Headline KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <div className="text-slate-400">Duration</div>
            <div className="text-lg font-bold text-white mt-0.5">34 minutes</div>
            <div className="text-[10px] text-slate-500">1.6 Hectares Covered</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <div className="text-slate-400">Actual Fertilizer Applied</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">98.2 kg</div>
            <div className="text-[10px] text-emerald-300">MEASURED by Totalizer</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <div className="text-slate-400">Estimated Excess Avoided</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">38.0 kg</div>
            <div className="text-[10px] text-slate-400">ESTIMATED vs Blanket</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
            <div className="text-slate-400">Estimated Cost Impact</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">$25.84</div>
            <div className="text-[10px] text-slate-400">ESTIMATED ($0.68/kg NPK)</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 text-xs">
          {(['TIMELINE', 'METRICS', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 font-bold transition border-b-2 ${
                activeTab === tab
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'TIMELINE' ? 'Unified Operation Timeline' : tab === 'METRICS' ? 'Prescription & Ledgers' : 'Audit Trace'}
            </button>
          ))}
        </div>

        {/* Unified Timeline Tab */}
        {activeTab === 'TIMELINE' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Multi-Subsystem Operational Event Log</h3>
            <div className="space-y-3 font-mono text-xs">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start gap-4 p-2 rounded hover:bg-slate-800/40 transition">
                  <span className="text-slate-500 w-20 flex-shrink-0">{evt.time}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold w-44 flex-shrink-0 text-center ${
                      evt.type.includes('DEFERRED') || evt.type.includes('CLOSED')
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        : evt.type.includes('STARTED') || evt.type.includes('FIXED')
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {evt.type}
                  </span>
                  <span className="text-slate-200">{evt.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'METRICS' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Spatial Grid Ledger Transition Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800">
                <div className="font-bold text-emerald-400 text-sm">F01-G001 (Treated)</div>
                <div className="mt-2 space-y-1 text-slate-300">
                  <div>Prescribed Target: 42.0 kg/ha</div>
                  <div>Actual Applied: 41.6 kg/ha (99.0% adherence)</div>
                  <div>Elemental N Consumed: 7.9 kg</div>
                  <div>Status: OPTIMAL</div>
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800">
                <div className="font-bold text-amber-400 text-sm">F01-G002 (Deferred / Stopped)</div>
                <div className="mt-2 space-y-1 text-slate-300">
                  <div>Prescribed Target: 36.0 kg/ha</div>
                  <div>Actual Applied: 21.6 kg/ha (Application halted)</div>
                  <div>Rainfall Lockout: Rain Risk 82%</div>
                  <div>Status: CAUTION / DEFERRED</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'AUDIT' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white">Cryptographic Audit Ledger</h3>
            <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-slate-400 space-y-2">
              <div>Session Correlation ID: <span className="text-white">OP-2026-00047</span></div>
              <div>Organization Slug: <span className="text-white">green-valley</span></div>
              <div>Sprayer UUID: <span className="text-white">sprayer_cuid_001</span></div>
              <div>Verification Hash: <span className="text-emerald-400">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                * Tamper-evident ledger: All discrete telemetry slices and control actions permanently recorded.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
