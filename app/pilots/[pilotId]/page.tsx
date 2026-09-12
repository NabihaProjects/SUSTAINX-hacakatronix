// SOIL IQ - Pilot Status Dashboard
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  TrendingDown,
  Activity,
  Radio,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { PilotComparisonService } from '@/lib/services/pilotComparisonService';

export const dynamic = 'force-dynamic';

export default async function PilotDetailPage({
  params,
}: {
  params: Promise<{ pilotId: string }>;
}) {
  const { pilotId } = await params;

  const pilot = await prisma.pilotProject.findUnique({
    where: { id: pilotId },
    include: {
      measurements: true,
      organization: true,
    },
  });

  if (!pilot) {
    return notFound();
  }

  const comparison = await PilotComparisonService.evaluatePilot(pilot.id);
  const successCriteria = JSON.parse(pilot.successCriteriaJson || '[]');

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/workspace" className="hover:text-emerald-400">
              Workspace
            </Link>
            <span>/</span>
            <span>Pilots</span>
            <span>/</span>
            <span className="text-[#9cb2a3]">{pilot.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              <Compass className="w-7 h-7 text-emerald-400" />
              {pilot.name}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 uppercase">
              {pilot.status}
            </span>
          </div>
          <p className="text-xs text-[#8ca893] mt-1">{pilot.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/pilots/${pilot.id}/measurements`}
            className="flex items-center gap-2 px-4 py-2 bg-[#122417] hover:bg-[#1a3321] text-emerald-300 border border-[#23422a] rounded-lg text-xs font-semibold transition-all"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Data Collection ({comparison.dataCoveragePct}%)</span>
          </Link>
          <Link
            href={`/pilots/${pilot.id}/results`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-950"
          >
            <Printer className="w-4 h-4" />
            <span>Customer Report</span>
          </Link>
        </div>
      </div>

      {/* Trial Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] font-semibold text-[#718d78] uppercase block">Days Elapsed</span>
          <span className="text-2xl font-bold text-white mt-1 block">{comparison.daysActive} days</span>
          <span className="text-[11px] text-emerald-400">Active trial</span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] font-semibold text-[#718d78] uppercase block">Crop Variety</span>
          <span className="text-base font-bold text-white mt-1 block truncate">{pilot.crop}</span>
          <span className="text-[11px] text-[#8ca893]">Field Corn</span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] font-semibold text-[#718d78] uppercase block">Total Area</span>
          <span className="text-2xl font-bold text-white mt-1 block">{pilot.area} ac</span>
          <span className="text-[11px] text-[#8ca893]">{(pilot.area / 2.471).toFixed(1)} hectares</span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] font-semibold text-[#718d78] uppercase block">Control Area</span>
          <span className="text-2xl font-bold text-amber-300 mt-1 block">{pilot.controlArea} ac</span>
          <span className="text-[11px] text-[#8ca893]">Uniform broadcast</span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] font-semibold text-[#718d78] uppercase block">SOIL IQ Area</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{pilot.soilIQArea} ac</span>
          <span className="text-[11px] text-[#8ca893]">Closed-loop VRA</span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] font-semibold text-[#718d78] uppercase block">Data Quality</span>
          <span className="text-2xl font-bold text-white mt-1 block">{comparison.dataQuality}</span>
          <span className="text-[11px] text-emerald-400">{comparison.dataCoveragePct}% coverage</span>
        </div>
      </div>

      {/* Control vs SOIL IQ Side-by-Side Comparison Section */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c3322] pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Pilot Comparison: Control Area vs SOIL IQ Precision
            </h2>
            <p className="text-xs text-[#8ca893]">
              Deterministic trial measurements comparing uniform regional broadcast practice against closed-loop prescription spraying.
            </p>
          </div>
          <span className="text-xs text-[#718d78] italic">
            Classified per scientific transparency standards
          </span>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e3825] text-[#8ca893] uppercase font-semibold">
                <th className="py-3 px-3">Metric</th>
                <th className="py-3 px-3">Control Area (Uniform)</th>
                <th className="py-3 px-3">SOIL IQ Area (VRA)</th>
                <th className="py-3 px-3">Measured Variance</th>
                <th className="py-3 px-3">Trust Level</th>
                <th className="py-3 px-3">Scientific Evidence Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172b1c]">
              {comparison.metrics.map((m) => (
                <tr key={m.key} className="hover:bg-[#132418]/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{m.label}</td>
                  <td className="py-3 px-3 text-[#9cb2a3]">
                    {m.controlValue} {m.unit}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {m.soilIQValue} {m.unit}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        m.differencePct < 0 ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {m.differencePct > 0 ? `+${m.differencePct}%` : `${m.differencePct}%`}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        m.trustLabel === 'MEASURED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                          : m.trustLabel === 'ESTIMATED'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      }`}
                    >
                      {m.trustLabel}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#718d78] text-[11px] max-w-xs">{m.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Criteria Progress */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Customer Defined Success Criteria Progress
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {successCriteria.map((c: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#08120a] border border-[#1c3322] flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-white block text-sm">{c.metric}</strong>
                <span className="text-[#8ca893]">
                  Target: <strong className="text-white">{c.target}</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 block">{c.achieved}</span>
                <span className="text-[10px] font-semibold text-[#718d78] uppercase">On Track</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
