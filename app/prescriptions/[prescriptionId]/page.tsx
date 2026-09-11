import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import {
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ArrowRight,
  Info,
  ShieldAlert,
  Beaker,
  Droplet,
  History,
} from 'lucide-react';
import { ApprovePrescriptionButton } from './ApprovePrescriptionButton';

export const dynamic = 'force-dynamic';

export default async function PrescriptionDetailPage({
  params,
}: {
  params: Promise<{ prescriptionId: string }>;
}) {
  const session = await getSession();
  const orgId = session?.organizationId || '';
  const { prescriptionId } = await params;

  const rx = await prisma.prescription.findFirst({
    where: { id: prescriptionId, organizationId: orgId },
    include: {
      field: { include: { farm: true, crop: true } },
      grid: {
        include: {
          soilProfiles: { take: 1, orderBy: { sampleDate: 'desc' } },
        },
      },
      items: { include: { fertilizer: true } },
      versions: { orderBy: { versionNumber: 'desc' } },
      approvedBy: true,
    },
  });

  if (!rx) notFound();

  const soil = rx.grid.soilProfiles[0] || null;
  const trace = rx.calculationTraceJson ? JSON.parse(rx.calculationTraceJson) : null;
  const reasons: string[] = rx.reasonsJson ? JSON.parse(rx.reasonsJson) : [rx.explanationText];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#76937e] mb-1">
              <Link href="/prescriptions" className="hover:text-white transition-colors">
                Prescriptions
              </Link>
              <span>/</span>
              <span className="text-emerald-300 font-mono font-medium">{rx.code}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight font-mono">
                {rx.code}
              </h1>
              <StatusBadge status={rx.status} size="md" />
              <ConfidenceBadge level={rx.confidenceLevel} score={rx.confidenceScore} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8ca893] mt-1.5">
              <span>Farm: <strong className="text-white">{rx.field.farm.name}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Field: <strong className="text-white">{rx.field.name}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Grid: <strong className="text-emerald-300 font-mono">{rx.grid.gridCode}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Crop: <strong className="text-emerald-300">{rx.field.crop?.name}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Version: <strong className="text-white font-mono">v{rx.versionNumber}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rx.status !== 'ACTIVE' && (
              <ApprovePrescriptionButton prescriptionId={rx.id} status={rx.status} />
            )}
            <Link
              href={`/grids/${rx.grid.id}`}
              className="px-3.5 py-2 rounded-lg bg-[#142318] hover:bg-[#1a2e20] text-emerald-300 border border-[#203626] text-xs font-semibold transition-all"
            >
              Inspect Grid State
            </Link>
          </div>
        </div>

        {/* Prototype Warning Banner */}
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-center justify-between text-xs text-amber-200/90">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>PROTOTYPE PRESCRIPTION:</strong> Formulated using agronomic response models and soil test credits.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase text-amber-400/80 px-2 py-0.5 bg-amber-950/80 border border-amber-900 rounded">
            {rx.engineVersion}
          </span>
        </div>

        {/* Core Recommendation Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-[#0f1b12] border border-[#1e3324] rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Recommended Product
            </span>
            <div className="text-lg font-bold text-white mt-1">
              {rx.items[0]?.fertilizer?.name || 'Balanced Formulation'}
            </div>
            <div className="text-xs text-[#8ca893] font-mono">
              Formulation: {rx.items[0]?.fertilizer?.formulation}
            </div>
          </div>

          <div className="p-5 bg-[#0f1b12] border border-[#1e3324] rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Target Application Rate
            </span>
            <div className="text-3xl font-bold text-white font-mono mt-1">
              {rx.targetRateKgHa} <span className="text-sm font-normal text-[#8ca893]">kg/ha</span>
            </div>
            <div className="text-xs text-emerald-300">
              Calibrated for sprayer boom telemetry
            </div>
          </div>

          <div className="p-5 bg-[#0f1b12] border border-[#1e3324] rounded-xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Operational Window
            </span>
            <div className="text-2xl font-bold text-[#8ca893] font-mono mt-1">
              {rx.minRateKgHa} - {rx.maxRateKgHa} <span className="text-sm font-normal">kg/ha</span>
            </div>
            <div className="text-xs text-[#6b8571]">
              +/- 10% permissible machine tolerance
            </div>
          </div>
        </div>

        {/* Two Columns: Soil State vs Net Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Soil State Inputs */}
          <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-emerald-400" />
                Soil Nutrient Credits
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {soil?.source || 'LAB TEST'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Available N</span>
                <span className="text-lg font-bold text-white font-mono block mt-1">
                  {soil?.availableNPpm || 38} ppm
                </span>
                <span className="text-[10px] text-emerald-300">~{((soil?.availableNPpm || 38) * 0.9).toFixed(1)} kg/ha</span>
              </div>
              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Available P</span>
                <span className="text-lg font-bold text-white font-mono block mt-1">
                  {soil?.availablePPpm || 22} ppm
                </span>
                <span className="text-[10px] text-emerald-300">~{((soil?.availablePPpm || 22) * 0.8).toFixed(1)} kg/ha</span>
              </div>
              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Available K</span>
                <span className="text-lg font-bold text-white font-mono block mt-1">
                  {soil?.availableKPpm || 135} ppm
                </span>
                <span className="text-[10px] text-emerald-300">~{((soil?.availableKPpm || 135) * 0.9).toFixed(1)} kg/ha</span>
              </div>
            </div>
          </div>

          {/* Net Requirements */}
          <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-emerald-400" />
                Net Elemental Requirements
              </h2>
              <span className="text-[10px] font-mono text-[#8ca893]">
                Pure kg / ha
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Net N Demand</span>
                <span className="text-xl font-bold text-white font-mono block mt-1">
                  {rx.estimatedReqN} kg/ha
                </span>
              </div>
              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Net P Demand</span>
                <span className="text-xl font-bold text-white font-mono block mt-1">
                  {rx.estimatedReqP} kg/ha
                </span>
              </div>
              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Net K Demand</span>
                <span className="text-xl font-bold text-white font-mono block mt-1">
                  {rx.estimatedReqK} kg/ha
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explainable Rationale & Audit Reasons */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              Agronomic Explanation & Decision Audit Trail
            </h2>
          </div>

          <div className="p-4 bg-[#121f15] rounded-lg border border-[#1e3324] space-y-2 text-xs">
            <ul className="space-y-2 text-[#8ca893]">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prescription Version History */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              Version History ({rx.versions.length} Versions Recorded)
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            {rx.versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3 bg-[#132217] rounded-lg border border-[#1e3324] flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span className="font-mono text-emerald-300">v{ver.versionNumber}</span>
                    <span className="text-[#6b8571]">•</span>
                    <span>Target: {ver.targetRateKgHa} kg/ha ({ver.minRateKgHa} - {ver.maxRateKgHa} kg/ha)</span>
                  </div>
                  <div className="text-[11px] text-[#8ca893] mt-0.5">
                    Reason: {ver.changeReason}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={ver.status} size="sm" />
                  <div className="text-[10px] text-[#6b8571] mt-1 font-mono">
                    {new Date(ver.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
