'use client';

import React, { useState } from 'react';

export default function MobileDemoPage() {
  const [step, setStep] = useState<number>(1);
  const [alertAck, setAlertAck] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 p-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            60-Second Field Workflow
          </span>
          <h1 className="text-base font-black text-white">Mobile Operator Demo</h1>
        </div>
        <button
          onClick={() => {
            setStep(1);
            setAlertAck(false);
          }}
          className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300"
        >
          Reset Demo
        </button>
      </div>

      {/* Interactive Step Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4 text-xs">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
          <span>Step {step} of 5</span>
          <span className="font-mono text-emerald-400">
            {step === 1 ? '1. Spatial Identification' :
             step === 2 ? '2. Prescription & Budget' :
             step === 3 ? '3. Machine Telemetry' :
             step === 4 ? '4. Weather Interlock' : '5. Field Observation'}
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
              <div className="text-slate-400">Active Location</div>
              <div className="text-base font-bold text-white">Green Valley Farm &bull; Field 3</div>
              <div className="text-emerald-400 font-semibold">Grid: F01-G047 (Rice - Tillering)</div>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Operator steps into the field. RTK-GNSS resolves exact spatial grid boundaries within 2.1cm.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow hover:bg-emerald-500"
            >
              Next: View Grid Prescription &rarr;
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Recommended Product</span>
                <span className="font-bold text-white">NPK 19-19-19 Liquid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Rate</span>
                <span className="font-bold text-emerald-400">42.0 kg/ha</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining N Budget</span>
                <span className="font-bold text-emerald-400">48.5 kg N</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Prescription verified against soil health and crop stage requirements.
            </p>
            <button
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow hover:bg-emerald-500"
            >
              Next: View Sprayer State &rarr;
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Sprayer Machine</span>
                <span className="font-bold text-white">SPRAYER-01 (Online)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Measured Flow</span>
                <span className="font-bold text-white">12.4 L/min (41.6 kg/ha)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Decision</span>
                <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-slate-950">
                  CONTINUE
                </span>
              </div>
            </div>
            <button
              onClick={() => setStep(4)}
              className="w-full rounded-xl bg-rose-600 py-2.5 font-bold text-white shadow hover:bg-rose-500"
            >
              Simulate Weather Event &rarr;
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="rounded-xl bg-rose-950/40 p-3 border border-rose-800/80 space-y-2">
              <div className="flex items-center justify-between text-rose-300 font-bold">
                <span>Rainfall Lockout Triggered</span>
                <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] text-white">STOP</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Rain probability increased to 82%. Valve shut off. Runoff prevention engaged.
              </p>
            </div>
            {!alertAck ? (
              <button
                onClick={() => setAlertAck(true)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2.5 font-bold text-slate-200"
              >
                Acknowledge Environmental Lockout
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-emerald-400 font-semibold text-center">✓ Alert Acknowledged by Operator</div>
                <button
                  onClick={() => setStep(5)}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow hover:bg-emerald-500"
                >
                  Next: Add Observation Note &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 text-center py-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-bold text-white">Demonstration Complete</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Field observation logged. Closed-loop control verified across spatial mapping, telemetry, weather lockout, and operator acknowledgement.
            </p>
            <div className="pt-2">
              <a
                href="/mobile"
                className="block w-full rounded-xl bg-slate-800 py-2.5 font-bold text-slate-200"
              >
                Return to Mobile Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
