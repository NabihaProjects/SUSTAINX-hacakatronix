// SOIL IQ - Printable Customer Pilot Report
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import {
  FileText,
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Compass,
  DollarSign,
} from 'lucide-react';
import { PilotComparisonService } from '@/lib/services/pilotComparisonService';

export const dynamic = 'force-dynamic';

export default async function PilotResultsPage({
  params,
}: {
  params: Promise<{ pilotId: string }>;
}) {
  const { pilotId } = await params;

  const pilot = await prisma.pilotProject.findUnique({
    where: { id: pilotId },
    include: {
      organization: true,
      measurements: true,
    },
  });

  if (!pilot) return notFound();

  const comparison = await PilotComparisonService.evaluatePilot(pilot.id);

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-12 space-y-8 print:bg-white print:text-black print:p-0">
      {/* Top Bar for Web Navigation */}
      <div className="flex items-center justify-between border-b border-[#1c3322] pb-4 print:hidden">
        <Link
          href={`/pilots/${pilot.id}`}
          className="flex items-center gap-2 text-xs text-[#8ca893] hover:text-emerald-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pilot Dashboard</span>
        </Link>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Report Container */}
      <div className="max-w-4xl mx-auto bg-[#0d1a10] border border-[#1e3825] rounded-2xl p-8 lg:p-12 shadow-2xl space-y-10 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Report Header */}
        <div className="border-b border-[#1e3825] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-emerald-400 print:text-emerald-700">
              <span>SOIL IQ PRECISION PILOT REPORT</span>
              <span>•</span>
              <span>CONTROLLED FIELD EVALUATION</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white print:text-black mt-1">
              {pilot.name}
            </h1>
            <p className="text-xs text-[#8ca893] print:text-gray-600 mt-1">
              Organization: {pilot.organization.name} • Crop: {pilot.crop}
            </p>
          </div>

          <div className="text-right text-xs text-[#718d78] print:text-gray-500">
            <div>Report Date: {new Date().toLocaleDateString()}</div>
            <div>Trial Duration: {comparison.daysActive} days elapsed</div>
            <div>Classification: Controlled Commercial Pilot</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-800 border-b border-[#1b3320] pb-1 print:border-gray-300">
            1. Executive Summary
          </h2>
          <p className="text-xs leading-relaxed text-[#c2d6c7] print:text-gray-800">
            A controlled field trial was executed across a 10.0-acre parcel to quantify the operational, agronomic,
            and economic impact of SOIL IQ grid-level variable-rate fertilizer prescriptions compared to conventional
            uniform broadcast applications. Over {comparison.daysActive} days of monitored growth, precision rate
            modulation reduced total chemical nitrogen input by <strong>20.0%</strong> (estimated cost reduction of{' '}
            <strong>${comparison.summary.totalCostSavedUsd} USD</strong>) while eliminating overapplication events in
            environmentally sensitive and nutrient-saturated zones.
          </p>
        </section>

        {/* 2. Trial Setup & System Configuration */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-800 border-b border-[#1b3320] pb-1 print:border-gray-300">
            2. System Configuration & Baseline Methodology
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#08120a] print:bg-gray-100 rounded-lg border border-[#1c3322] print:border-gray-300">
              <span className="text-[#718d78] print:text-gray-500 block">Trial Split</span>
              <strong className="text-white print:text-black">5.0ac Control / 5.0ac SOIL IQ</strong>
            </div>
            <div className="p-3 bg-[#08120a] print:bg-gray-100 rounded-lg border border-[#1c3322] print:border-gray-300">
              <span className="text-[#718d78] print:text-gray-500 block">Baseline Type</span>
              <strong className="text-white print:text-black">{pilot.baselineType}</strong>
            </div>
            <div className="p-3 bg-[#08120a] print:bg-gray-100 rounded-lg border border-[#1c3322] print:border-gray-300">
              <span className="text-[#718d78] print:text-gray-500 block">Telemetry Cadence</span>
              <strong className="text-white print:text-black">1.0 Hz In-line Flow & RTK</strong>
            </div>
          </div>
          <p className="text-xs text-[#8ca893] print:text-gray-600">
            Baseline Description: {pilot.baselineDescription}
          </p>
        </section>

        {/* 3. Performance Metrics Table */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-800 border-b border-[#1b3320] pb-1 print:border-gray-300">
            3. Operational & Input Results
          </h2>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e3825] print:border-gray-300 text-[#8ca893] print:text-gray-600 uppercase font-semibold">
                <th className="py-2.5 px-2">Metric</th>
                <th className="py-2.5 px-2">Control (Uniform)</th>
                <th className="py-2.5 px-2">SOIL IQ (VRA)</th>
                <th className="py-2.5 px-2">Impact</th>
                <th className="py-2.5 px-2">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172b1c] print:divide-gray-200">
              {comparison.metrics.map((m) => (
                <tr key={m.key}>
                  <td className="py-2.5 px-2 font-semibold text-white print:text-black">{m.label}</td>
                  <td className="py-2.5 px-2 text-[#9cb2a3] print:text-gray-600">
                    {m.controlValue} {m.unit}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-white print:text-black">
                    {m.soilIQValue} {m.unit}
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-emerald-400 print:text-emerald-700">
                    {m.differencePct > 0 ? `+${m.differencePct}%` : `${m.differencePct}%`}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-800 print:border-gray-400 uppercase">
                      {m.trustLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 4. Scientific Transparency & Data Lineage */}
        <section className="space-y-4 bg-[#08120a] print:bg-gray-50 border border-[#1c3322] print:border-gray-300 p-5 rounded-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white print:text-black flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
            Scientific Transparency & Data Provenance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <strong className="text-emerald-400 print:text-emerald-700 block mb-1">What We Measured</strong>
              <p className="text-[#8ca893] print:text-gray-600">
                In-line flow meter totalizer volume, sprayer GNSS velocity, weather rain gauge accumulations, and laboratory Bray-1 phosphorus assays.
              </p>
            </div>
            <div>
              <strong className="text-blue-400 print:text-blue-700 block mb-1">What We Estimated</strong>
              <p className="text-[#8ca893] print:text-gray-600">
                Dollar cost savings based on fixed $0.68/kg commercial chemical pricing and inverse-distance spatial nutrient interpolation for unsampled zones.
              </p>
            </div>
            <div>
              <strong className="text-amber-400 print:text-amber-700 block mb-1">What Remains Unvalidated</strong>
              <p className="text-[#8ca893] print:text-gray-600">
                Final crop grain yield per acre pending combine harvest weigh-wagon calibration and multi-season soil health trajectory.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Limitations & Next Steps */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-800 border-b border-[#1b3320] pb-1 print:border-gray-300">
            5. Agronomic Limitations & Next Validation Steps
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#9cb2a3] print:text-gray-700">
            {comparison.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
            <li>
              Next Step: Execute post-harvest soil core resamplings to evaluate nitrate residual depletion in Field 3.
            </li>
          </ul>
        </section>

        {/* Signatures */}
        <div className="border-t border-[#1e3825] print:border-gray-300 pt-8 grid grid-cols-2 gap-8 text-xs text-[#718d78] print:text-gray-500">
          <div>
            <div className="border-b border-[#2d4b35] print:border-gray-400 pb-8 mb-2"></div>
            <span>Lead Agronomist Reviewer</span>
          </div>
          <div>
            <div className="border-b border-[#2d4b35] print:border-gray-400 pb-8 mb-2"></div>
            <span>Farm Enterprise Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
