'use client';

import React, { use, useState } from 'react';

interface ReportDetailProps {
  params: Promise<{ reportId: string }>;
}

export default function SoilTestReportDetailPage({ params }: ReportDetailProps) {
  const resolvedParams = use(params);
  const reportId = resolvedParams.reportId;

  const [correctionModalOpen, setCorrectionModalOpen] = useState<boolean>(false);
  const [correctedValue, setCorrectedValue] = useState<string>('48.0');
  const [correctionReason, setCorrectionReason] = useState<string>('Lab re-test spectrophotometer recalibration');
  const [correctionSuccess, setCorrectionSuccess] = useState<string | null>(null);

  const report = {
    id: reportId,
    reportNumber: 'SR-2026-00412',
    labName: 'National Ag Analytical Laboratories (NABL Accr. #1042)',
    field: 'Field 3 (Rice)',
    collectionDate: '2026-08-28 09:30 AM',
    testDate: '2026-08-30 02:15 PM',
    receivedDate: '2026-08-31 10:00 AM',
    status: 'VALIDATED',
    version: 'v1.0',
    docRef: 'DOC-LAB-CERT-2026-00412.pdf',
    notes: 'Pre-season composite core samples taken at 0-15cm depth across Field 3. Analysis via Bray-1 for P and Flame Photometer for K.',
  };

  const samples = [
    { code: 'SMP-G041-01', grid: 'G041', depth: '15 cm', n: 185, p: 42, k: 210, ph: 6.4, ec: 1.1, oc: 0.82 },
    { code: 'SMP-G042-01', grid: 'G042', depth: '15 cm', n: 190, p: 44, k: 215, ph: 6.5, ec: 1.2, oc: 0.85 },
    { code: 'SMP-G046-01', grid: 'G046', depth: '15 cm', n: 192, p: 45, k: 220, ph: 6.5, ec: 1.2, oc: 0.88 },
    { code: 'SMP-G047-01', grid: 'G047', depth: '15 cm', n: 188, p: 44, k: 212, ph: 6.4, ec: 1.2, oc: 0.85 },
    { code: 'SMP-G048-01', grid: 'G048', depth: '15 cm', n: 210, p: 32, k: 195, ph: 6.8, ec: 2.1, oc: 1.10 },
  ];

  const handleApplyCorrection = () => {
    setCorrectionModalOpen(false);
    setCorrectionSuccess(`Correction logged: Grid G047 Phosphorus updated from 44.0 to ${correctedValue} ppm. Reason: "${correctionReason}"`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Laboratory Soil Test Report
            </span>
            <h1 className="text-2xl font-black text-white mt-1">{report.reportNumber}</h1>
            <p className="text-xs text-slate-400 mt-1">{report.labName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCorrectionModalOpen(true)}
              className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow"
            >
              ✎ Log Data Correction
            </button>
            <a
              href="/soil-tests"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs text-slate-200 border border-slate-700"
            >
              &larr; Soil Dashboard
            </a>
          </div>
        </div>

        {/* Success Banner */}
        {correctionSuccess && (
          <div className="rounded-xl border border-emerald-700 bg-emerald-950/60 p-4 text-xs text-emerald-200 flex items-center gap-2">
            <span>✓</span>
            <span>{correctionSuccess}</span>
          </div>
        )}

        {/* Metadata Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Report Integrity</span>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Validation Status:</span>
              <span className="font-bold text-emerald-400">{report.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Baseline Version:</span>
              <span className="font-mono text-white">{report.version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Document Ref:</span>
              <span className="font-mono text-emerald-300 text-[11px] underline cursor-pointer">{report.docRef}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Chain of Custody</span>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Collected:</span>
              <span className="font-mono text-slate-200">{report.collectionDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Tested:</span>
              <span className="font-mono text-slate-200">{report.testDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Received by SOIL IQ:</span>
              <span className="font-mono text-slate-200">{report.receivedDate}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Agronomic Notes</span>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">{report.notes}</p>
          </div>
        </div>

        {/* Samples Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Analyzed Soil Samples & Nutrient Concentrations</h2>
            <span className="text-xs text-slate-500 font-mono">{samples.length} Samples</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-sans">
                <tr>
                  <th className="p-3.5">Sample ID</th>
                  <th className="p-3.5">Spatial Grid</th>
                  <th className="p-3.5">Core Depth</th>
                  <th className="p-3.5">Avail N (kg/ha)</th>
                  <th className="p-3.5">Bray-1 P (ppm)</th>
                  <th className="p-3.5">Exch K (ppm)</th>
                  <th className="p-3.5">pH</th>
                  <th className="p-3.5">EC (dS/m)</th>
                  <th className="p-3.5">Organic Carbon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {samples.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/40">
                    <td className="p-3.5 font-bold text-white">{s.code}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{s.grid}</td>
                    <td className="p-3.5 text-slate-400 font-sans">{s.depth}</td>
                    <td className="p-3.5 text-slate-200">{s.n}</td>
                    <td className="p-3.5 text-emerald-300 font-bold">{s.p}</td>
                    <td className="p-3.5 text-slate-200">{s.k}</td>
                    <td className="p-3.5 text-slate-300">{s.ph}</td>
                    <td className="p-3.5 text-slate-300">{s.ec}</td>
                    <td className="p-3.5 text-slate-300">{s.oc}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Correction Modal */}
        {correctionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-w-md w-full space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-base font-bold text-white">Log Auditable Soil Data Correction</h3>
                <button onClick={() => setCorrectionModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Target Sample & Parameter:</span>
                  <div className="font-bold text-white mt-0.5">SMP-G047-01 &bull; Phosphorus (ppm)</div>
                </div>
                <div>
                  <span className="text-slate-400">Original Value:</span>
                  <div className="font-mono text-slate-400">44.0 ppm</div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Corrected Value (ppm):</label>
                  <input
                    type="number"
                    value={correctedValue}
                    onChange={(e) => setCorrectedValue(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mandatory Audit Reason:</label>
                  <textarea
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white text-xs"
                    placeholder="Provide specific reason for modification..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setCorrectionModalOpen(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCorrection}
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950"
                >
                  Commit Correction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
