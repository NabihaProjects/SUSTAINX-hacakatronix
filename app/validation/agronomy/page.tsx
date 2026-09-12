'use client';

import React from 'react';

interface AgronomicSpec {
  crop: string;
  stage: string;
  nReqKgHa: number;
  pReqKgHa: number;
  kReqKgHa: number;
  sourceType: 'AUTHORITATIVE' | 'RESEARCH' | 'PROTOTYPE';
  sourceName: string;
  version: string;
  status: 'VALIDATED' | 'PROTOTYPE_ESTIMATE';
}

const AGRONOMIC_SPECS: AgronomicSpec[] = [
  {
    crop: 'Rice (Oryza sativa)',
    stage: 'Tillering',
    nReqKgHa: 45.0,
    pReqKgHa: 20.0,
    kReqKgHa: 25.0,
    sourceType: 'AUTHORITATIVE',
    sourceName: 'ICAR National Rice Research Institute Technical Bulletin 2023',
    version: 'v1.4',
    status: 'VALIDATED',
  },
  {
    crop: 'Rice (Oryza sativa)',
    stage: 'Panicle Initiation',
    nReqKgHa: 40.0,
    pReqKgHa: 10.0,
    kReqKgHa: 20.0,
    sourceType: 'AUTHORITATIVE',
    sourceName: 'ICAR Rice Advisory 2023',
    version: 'v1.4',
    status: 'VALIDATED',
  },
  {
    crop: 'Wheat (Triticum aestivum)',
    stage: 'Crown Root Initiation (CRI)',
    nReqKgHa: 50.0,
    pReqKgHa: 25.0,
    kReqKgHa: 20.0,
    sourceType: 'RESEARCH',
    sourceName: 'Punjab Agricultural University Wheat Guidelines',
    version: 'v2.1',
    status: 'VALIDATED',
  },
  {
    crop: 'Corn / Maize (Zea mays)',
    stage: 'V6 (Six Leaf Collar)',
    nReqKgHa: 60.0,
    pReqKgHa: 30.0,
    kReqKgHa: 35.0,
    sourceType: 'PROTOTYPE',
    sourceName: 'Corn Split-Nitrogen Prototype Calibration (Requires Trial)',
    version: 'v0.9-demo',
    status: 'PROTOTYPE_ESTIMATE',
  },
  {
    crop: 'Cotton (Gossypium hirsutum)',
    stage: 'Squaring / Early Bloom',
    nReqKgHa: 35.0,
    pReqKgHa: 15.0,
    kReqKgHa: 30.0,
    sourceType: 'PROTOTYPE',
    sourceName: 'Cotton Nutrient Prototype Baseline',
    version: 'v0.8-demo',
    status: 'PROTOTYPE_ESTIMATE',
  },
];

export default function AgronomicValidationPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Agronomic Data Provenance
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Agronomic Validation Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Traceability and source provenance for crop growth stages, N-P-K nutrient uptake models, and prototype calibrations.
            </p>
          </div>
          <a
            href="/validation"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Back to Claims Matrix
          </a>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Crop</th>
                <th className="p-3.5">Growth Stage</th>
                <th className="p-3.5 text-center">N Req (kg/ha)</th>
                <th className="p-3.5 text-center">P Req (kg/ha)</th>
                <th className="p-3.5 text-center">K Req (kg/ha)</th>
                <th className="p-3.5">Authoritative Source</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {AGRONOMIC_SPECS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-bold text-white">{row.crop}</td>
                  <td className="p-3.5 font-mono text-emerald-300">{row.stage}</td>
                  <td className="p-3.5 text-center font-bold text-slate-200">{row.nReqKgHa}</td>
                  <td className="p-3.5 text-center font-bold text-slate-200">{row.pReqKgHa}</td>
                  <td className="p-3.5 text-center font-bold text-slate-200">{row.kReqKgHa}</td>
                  <td className="p-3.5 text-slate-300 max-w-xs">
                    <div>{row.sourceName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Version: {row.version}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        row.status === 'VALIDATED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
          <strong className="text-slate-200">Data Architecture Readiness: </strong>
          SOIL IQ separates the agronomic data layer from application code. As agricultural extension services and universities publish localized soil testing guidance, updated parameters can be ingested via versioned JSON schemas without rebuilding the software.
        </div>
      </div>
    </div>
  );
}
