import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import {
  FileSpreadsheet,
  Info,
  ChevronRight,
  ShieldCheck,
  Filter,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; fieldId?: string }>;
}) {
  const session = await getSession();
  const orgId = session?.organizationId || '';
  const { status, fieldId } = await searchParams;

  const where: any = { organizationId: orgId };
  if (status) where.status = status;
  if (fieldId) where.fieldId = fieldId;

  const prescriptions = await prisma.prescription.findMany({
    where,
    include: {
      field: { include: { farm: true, crop: true } },
      grid: true,
      items: { include: { fertilizer: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Agronomic Prescriptions Catalog
              </h1>
              <span className="text-[11px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-medium">
                Prototype Engine
              </span>
            </div>
            <p className="text-xs text-[#8ca893] mt-1">
              Field-specific recommended application rates calibrated to soil availability and nutrient budgets
            </p>
          </div>
        </div>

        {/* Prototype Scientific Notice */}
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-center justify-between text-xs text-amber-200/90">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Simulation / Prototype Prescriptions:</strong> Recommendations are derived from prototype response heuristics and soil test availability factors.
            </span>
          </div>
        </div>

        {/* Prescriptions Table */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Generated Prescriptions ({prescriptions.length} Records)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e3324] text-[#718d78] uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Prescription Code</th>
                  <th className="pb-2">Field & Crop</th>
                  <th className="pb-2">Grid</th>
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Target Rate</th>
                  <th className="pb-2">Safe Range</th>
                  <th className="pb-2">Confidence</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3324]/50">
                {prescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-[#132217]/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-emerald-300">
                      {rx.code}
                    </td>
                    <td className="py-3 text-white">
                      <div>{rx.field.name}</div>
                      <div className="text-[10px] text-[#6b8571]">{rx.field.crop?.name}</div>
                    </td>
                    <td className="py-3 font-mono text-emerald-400">
                      {rx.grid.gridCode}
                    </td>
                    <td className="py-3 font-medium text-white">
                      {rx.items[0]?.fertilizer?.name || 'Balanced Blend'}
                    </td>
                    <td className="py-3 font-mono font-bold text-white">
                      {rx.targetRateKgHa} kg/ha
                    </td>
                    <td className="py-3 font-mono text-[#8ca893]">
                      {rx.minRateKgHa} - {rx.maxRateKgHa} kg/ha
                    </td>
                    <td className="py-3">
                      <ConfidenceBadge level={rx.confidenceLevel} score={rx.confidenceScore} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={rx.status} size="sm" />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/prescriptions/${rx.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#15261a] hover:bg-emerald-600 hover:text-white text-emerald-300 text-[11px] font-medium transition-colors"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
