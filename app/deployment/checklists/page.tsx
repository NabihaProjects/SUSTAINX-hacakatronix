'use client';

// SOIL IQ - 13-Point Field Deployment Checklist
import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Save,
} from 'lucide-react';

export default function DeploymentChecklistsPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'Field boundary verified via RTK coordinates', status: 'PASSED' },
    { id: 2, name: 'Spatial grid mesh generated and indexed', status: 'PASSED' },
    { id: 3, name: 'Laboratory soil baseline validated and approved', status: 'PASSED' },
    { id: 4, name: 'In-situ capacitance soil probes installed in root zone', status: 'PASSED' },
    { id: 5, name: 'Telemetry link verified on MQTT broker', status: 'PASSED' },
    { id: 6, name: 'Dual-band RTK GNSS centimeter fix confirmed (<= 5cm)', status: 'PASSED' },
    { id: 7, name: 'In-line flow meter pulse calibration tested (L/min)', status: 'PASSED' },
    { id: 8, name: 'Hydrostatic tank level sensor zero-calibrated', status: 'PASSED' },
    { id: 9, name: 'Edge gateway local SQLite offline buffering verified', status: 'PASSED' },
    { id: 10, name: 'Prescription matrix signed off by certified agronomist', status: 'PASSED' },
    { id: 11, name: 'Wind drift and rain deferral policy configured', status: 'PASSED' },
    { id: 12, name: 'Closed-loop machine safety stop gate verified', status: 'PASSED' },
    { id: 13, name: 'Field operator trained on mobile offline PWA runbook', status: 'PASSED' },
  ]);

  const [saved, setSaved] = useState(false);

  const toggleStatus = (id: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next =
            item.status === 'PASSED'
              ? 'FAILED'
              : item.status === 'FAILED'
              ? 'PENDING'
              : 'PASSED';
          return { ...item, status: next };
        }
        return item;
      })
    );
  };

  const passedCount = items.filter((i) => i.status === 'PASSED').length;
  const readinessPct = Math.round((passedCount / items.length) * 100);
  const isReady = readinessPct === 100;

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/deployment/readiness" className="hover:text-emerald-400">Deployment</Link>
            <span>/</span>
            <span>Checklists</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-emerald-400" />
            Field Deployment Checklist
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Physical hardware, telemetry integrity, and agronomic sign-off verification before field machine dispatch.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0f1d13] border border-[#1e3825] px-5 py-3 rounded-xl text-xs">
          <div>
            <span className="text-[#718d78] block">Readiness Score</span>
            <strong className="text-xl font-bold text-white">{readinessPct}%</strong>
          </div>
          <div className="border-l border-[#1e3825] pl-4">
            <span className="text-[#718d78] block">Sign-off Status</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase block mt-0.5 ${
                isReady
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {isReady ? 'READY FOR FIELD PILOT' : 'NOT READY'}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1b3320] pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            13 Pre-Flight Engineering Gates
          </span>
          <span className="text-xs text-[#718d78]">
            Click any row badge to toggle status (PASSED / FAILED / PENDING)
          </span>
        </div>

        <div className="divide-y divide-[#162b1b]">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-[#122316]/50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#5a7461] font-mono text-[11px] w-6">#{item.id}</span>
                <span className="text-white font-medium">{item.name}</span>
              </div>

              <button
                onClick={() => toggleStatus(item.id)}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all border ${
                  item.status === 'PASSED'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900/80'
                    : item.status === 'FAILED'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900/80'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                }`}
              >
                {item.status}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#1b3320] pt-4 mt-4 text-xs">
          <span className="text-[#718d78]">
            {passedCount} of {items.length} items validated.
          </span>
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-md transition-all"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved Checklist</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Inspection State</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
