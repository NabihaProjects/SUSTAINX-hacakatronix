import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetricCard } from '@/components/ui/MetricCard';
import { FarmMap } from '@/components/map/FarmMap';
import { FieldService } from '@/lib/services/fieldService';
import { getSession } from '@/lib/auth/session';
import { formatArea } from '@/lib/domain/units';
import {
  Layers,
  MapPin,
  Grid as GridIcon,
  Droplet,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ farmId: string; fieldId: string }>;
}) {
  const session = await getSession();
  const orgId = session?.organizationId || '';
  const { farmId, fieldId } = await params;

  const field = await FieldService.getFieldById(fieldId, orgId);
  if (!field) notFound();

  // Prepare map items for this field
  const mapFields = [
    {
      id: field.id,
      name: field.name,
      boundaryGeoJson: field.boundaryGeoJson,
      cropName: field.crop?.name,
    },
  ];

  const mapGrids = field.grids.map((grid) => ({
    id: grid.id,
    gridCode: grid.gridCode,
    fieldName: field.name,
    fieldId: field.id,
    farmName: field.farm.name,
    cropName: field.crop?.name,
    growthStage: field.growthStage || undefined,
    soilType: field.soilType,
    calculatedArea: grid.calculatedArea,
    status: grid.status as any,
    geometryGeoJson: grid.geometryGeoJson,
    nutrientBudget: grid.nutrientBudget,
    soilProfile: grid.soilProfiles[0] || null,
    activePrescription: grid.prescriptions[0]
      ? {
          code: grid.prescriptions[0].code,
          targetRateKgHa: grid.prescriptions[0].targetRateKgHa,
          minRateKgHa: grid.prescriptions[0].minRateKgHa,
          maxRateKgHa: grid.prescriptions[0].maxRateKgHa,
          confidenceLevel: grid.prescriptions[0].confidenceLevel,
        }
      : null,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#76937e] mb-1">
              <Link href="/farms" className="hover:text-white transition-colors">
                Farms
              </Link>
              <span>/</span>
              <Link href={`/farms/${farmId}`} className="hover:text-white transition-colors">
                {field.farm.name}
              </Link>
              <span>/</span>
              <span className="text-emerald-300 font-medium">{field.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                {field.name}
              </h1>
              <StatusBadge status={field.status} size="sm" />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8ca893] mt-1">
              <span className="text-emerald-300 font-semibold">{field.crop?.name || 'Unset Crop'}</span>
              <span className="text-[#556e5a]">•</span>
              <span>Stage: <strong>{field.growthStage || 'Vegetative'}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Soil: <strong>{field.soilType}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Area: <strong className="font-mono text-white">{formatArea(field.calculatedArea, 'acre')}</strong></span>
            </div>
          </div>
        </div>

        {/* Field Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Grid Cells"
            value={field.gridCount}
            subtitle="Discrete spatial zones"
            icon={<GridIcon className="w-4 h-4" />}
          />
          <MetricCard
            title="Optimal Grids"
            value={field.statusBreakdown.optimal}
            subtitle="Within nutrient budget"
            trend={{ value: 'Healthy', isPositive: true }}
          />
          <MetricCard
            title="Caution / Excess"
            value={`${field.statusBreakdown.caution + field.statusBreakdown.excessRisk}`}
            subtitle="Require rate adjustments"
            trend={{ value: 'Attention', isPositive: false }}
          />
          <MetricCard
            title="Budget Utilization"
            value={`${field.budgetUtilizationPct}%`}
            subtitle="N allowance consumed"
            icon={<Droplet className="w-4 h-4" />}
          />
        </div>

        {/* Interactive Field Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
              Field Spatial Map & Grid Zones
            </h2>
            <span className="text-xs text-[#76937e]">
              Click any grid to view soil health snapshot & nutrient budget
            </span>
          </div>

          <FarmMap
            grids={mapGrids}
            fields={mapFields}
            height="460px"
          />
        </div>

        {/* Grids Table */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <GridIcon className="w-4 h-4 text-emerald-400" />
              Spatial Grid Ledgers ({field.grids.length} Cells)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e3324] text-[#718d78] uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Grid Code</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Area</th>
                  <th className="pb-2">N Consumed / Budget</th>
                  <th className="pb-2">P Consumed / Budget</th>
                  <th className="pb-2">K Consumed / Budget</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3324]/50">
                {field.grids.map((grid) => {
                  const b = grid.nutrientBudget;
                  const pctN = b && b.recommendedN > 0 ? Math.round((b.consumedN / b.recommendedN) * 100) : 0;
                  const pctP = b && b.recommendedP > 0 ? Math.round((b.consumedP / b.recommendedP) * 100) : 0;
                  const pctK = b && b.recommendedK > 0 ? Math.round((b.consumedK / b.recommendedK) * 100) : 0;

                  return (
                    <tr key={grid.id} className="hover:bg-[#132217]/50 transition-colors">
                      <td className="py-3 font-mono font-bold text-emerald-300">
                        {grid.gridCode}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={grid.status} size="sm" />
                      </td>
                      <td className="py-3 font-mono text-[#8ca893]">
                        {formatArea(grid.calculatedArea, 'acre')}
                      </td>
                      <td className="py-3 font-mono">
                        <span className={pctN >= 100 ? 'text-rose-400 font-bold' : pctN >= 80 ? 'text-amber-400 font-bold' : 'text-emerald-200'}>
                          {b?.consumedN ?? 0} / {b?.recommendedN ?? 110} kg/ha ({pctN}%)
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[#8ca893]">
                        {b?.consumedP ?? 0} / {b?.recommendedP ?? 45} kg/ha ({pctP}%)
                      </td>
                      <td className="py-3 font-mono text-[#8ca893]">
                        {b?.consumedK ?? 0} / {b?.recommendedK ?? 75} kg/ha ({pctK}%)
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/grids/${grid.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#15261a] hover:bg-emerald-600 hover:text-white text-emerald-300 text-[11px] font-medium transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
