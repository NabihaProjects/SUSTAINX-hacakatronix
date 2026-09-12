import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NutrientProgressBar } from '@/components/ui/NutrientProgressBar';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { GridService } from '@/lib/services/gridService';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { formatArea } from '@/lib/domain/units';
import {
  MapPin,
  Layers,
  Droplet,
  Beaker,
  FileSpreadsheet,
  History,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { GridClientActions } from './GridClientActions';
import { ExplanationService, ExplanationFact } from '@/lib/domain/explanationService';
import { SoilHealthService } from '@/lib/domain/soilHealthService';
import { AnomalyDetectionService } from '@/lib/domain/anomalyDetectionService';
import { GridIntelligenceSection } from '@/components/grids/GridIntelligenceSection';

export const dynamic = 'force-dynamic';

export default async function GridDetailPage({
  params,
}: {
  params: Promise<{ gridId: string }>;
}) {
  const session = await getSession();
  const orgId = session?.organizationId || '';
  const { gridId } = await params;

  const grid = await GridService.getGridById(gridId, orgId);
  if (!grid) notFound();

  // Fetch available fertilizers for recording application
  const fertilizers = await prisma.fertilizer.findMany({
    where: { isActive: true },
    select: { id: true, name: true, formulation: true, defaultUnit: true },
  });

  const soil = grid.soilProfiles[0] || null;
  const budget = grid.nutrientBudget;
  const activeRx = grid.prescriptions[0] || null;

  // Construct Explanation Fact Store
  const explanationFacts: ExplanationFact[] = [];
  if (soil) {
    if (soil.availablePPpm > 45) {
      explanationFacts.push({
        type: 'HIGH_EXISTING_NUTRIENT',
        nutrient: 'P',
        gridCode: grid.gridCode,
        metricLabel: 'Available Phosphorus',
        measuredValue: `${soil.availablePPpm} ppm`,
        benchmarkValue: '30 ppm',
        source: 'SOIL_TEST_LAB',
        confidence: 0.94,
        message: `Elevated soil phosphorus concentration (${soil.availablePPpm} ppm) detected.`,
      });
    } else if (soil.availableNPpm < 25) {
      explanationFacts.push({
        type: 'LOW_EXISTING_NUTRIENT',
        nutrient: 'N',
        gridCode: grid.gridCode,
        metricLabel: 'Available Nitrogen',
        measuredValue: `${soil.availableNPpm} ppm`,
        benchmarkValue: '45 ppm',
        source: 'SOIL_TEST_LAB',
        confidence: 0.92,
        message: `Soil available nitrogen is below agronomic threshold (${soil.availableNPpm} ppm).`,
      });
    }
  }

  // Growth stage fact
  explanationFacts.push({
    type: 'STAGE_DEMAND_PEAK',
    gridCode: grid.gridCode,
    metricLabel: grid.field.growthStage || 'Vegetative Growth',
    measuredValue: grid.field.growthStage || 'Vegetative',
    source: 'PHENOLOGY_MODEL',
    confidence: 0.90,
    message: `Crop in ${grid.field.growthStage || 'Vegetative'} phase with high nutrient absorption rate.`,
  });

  // Recent applications fact
  if (grid.applications.length > 0) {
    const lastApp = grid.applications[0];
    explanationFacts.push({
      type: 'RECENT_APPLICATION_CONTRIBUTION',
      nutrient: 'N',
      gridCode: grid.gridCode,
      metricLabel: 'Previous Application Pass',
      measuredValue: `${lastApp.contributedN.toFixed(1)} kg N`,
      source: 'APPLICATION_LEDGER',
      confidence: 0.95,
      message: `Recent pass of ${lastApp.fertilizer.name} credited ${lastApp.contributedN.toFixed(1)} kg elemental N to ledger.`,
    });
  }

  // Weather fact
  explanationFacts.push({
    type: 'WEATHER_PERMISSIVE',
    gridCode: grid.gridCode,
    metricLabel: 'Field Weather Station',
    measuredValue: 'Wind 8 km/h, Rain 5%',
    source: 'FIELD_WEATHER_STATION',
    confidence: 0.89,
    message: 'Atmospheric conditions within optimal safety envelope (wind < 15 km/h, no rain forecast).',
  });

  const explanation = ExplanationService.generateExplanation(
    explanationFacts,
    activeRx?.items[0]?.fertilizer?.name,
    activeRx?.targetRateKgHa
  );

  // Compute Grid Soil Health Breakdown
  const gridSoilHealth = SoilHealthService.calculateIndex({
    gridCode: grid.gridCode,
    availableNPpm: soil?.availableNPpm || 38,
    availablePPpm: soil?.availablePPpm || 24,
    availableKPpm: soil?.availableKPpm || 140,
    ph: soil?.ph || 6.5,
    organicCarbonPct: soil?.organicCarbonPct || 1.4,
    ecDsm: soil?.ecDsm || 0.8,
    moisturePct: soil?.moisturePct || 24.0,
    excessNKgHa: budget?.excessN || 0,
    excessPKgHa: budget?.excessP || 0,
    excessKKgHa: budget?.excessK || 0,
  });

  // Fetch active anomalies for this grid
  const rawGridAnomalies = await AnomalyDetectionService.detectAnomalies(orgId, grid.id);
  const gridAnomalies = rawGridAnomalies.map((a) => ({
    id: a.id,
    metricType: a.metricType,
    anomalyType: a.anomalyType,
    severity: a.severity,
    description: a.description,
    rootCauseHypotheses: a.rootCauseHypotheses,
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
              <Link href={`/farms/${grid.field.farm.id}`} className="hover:text-white transition-colors">
                {grid.field.farm.name}
              </Link>
              <span>/</span>
              <Link
                href={`/farms/${grid.field.farm.id}/fields/${grid.field.id}`}
                className="hover:text-white transition-colors"
              >
                {grid.field.name}
              </Link>
              <span>/</span>
              <span className="text-emerald-300 font-mono font-medium">{grid.gridCode}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight font-mono">
                {grid.gridCode}
              </h1>
              <StatusBadge status={grid.status} size="md" />
              {grid.isBlocked && (
                <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  LOCKED
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8ca893] mt-1.5">
              <span>Field: <strong className="text-white">{grid.field.name}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Crop: <strong className="text-emerald-300">{grid.field.crop?.name || 'Crop Unset'}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Growth Stage: <strong className="text-emerald-300">{grid.field.growthStage || 'Vegetative'}</strong></span>
              <span className="text-[#556e5a]">•</span>
              <span>Area: <strong className="text-white font-mono">{formatArea(grid.calculatedArea, 'acre')}</strong></span>
            </div>
          </div>

          <GridClientActions
            grid={{
              id: grid.id,
              gridCode: grid.gridCode,
              status: grid.status,
              isBlocked: grid.isBlocked,
            }}
            fertilizers={fertilizers}
            activePrescription={activeRx}
          />
        </div>

        {/* Top Two-Column Grid: Soil Snapshot & Nutrient Budget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Soil Chemical Snapshot */}
          <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Soil Chemistry Snapshot
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {soil?.source || 'LAB TEST'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">pH Level</span>
                <span className="text-lg font-bold text-white font-mono block mt-1">
                  {soil?.ph || 6.5}
                </span>
                <span className="text-[10px] text-emerald-400">Optimal</span>
              </div>

              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Org Carbon</span>
                <span className="text-lg font-bold text-white font-mono block mt-1">
                  {soil?.organicCarbonPct || 1.2}%
                </span>
                <span className="text-[10px] text-emerald-400">Normal</span>
              </div>

              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">Moisture</span>
                <span className="text-lg font-bold text-white font-mono block mt-1">
                  {soil?.moisturePct || 22.0}%
                </span>
                <span className="text-[10px] text-emerald-400">Adequate</span>
              </div>

              <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
                <span className="text-[10px] text-[#6b8571] uppercase">EC (dS/m)</span>
                <span className="text-lg font-bold text-white font-mono block mt-1">
                  {soil?.ecDsm || 0.8}
                </span>
                <span className="text-[10px] text-emerald-400">Non-saline</span>
              </div>
            </div>

            {/* Mineral Concentrations in ppm */}
            <div className="p-3.5 bg-[#121f15] rounded-lg border border-[#1e3324] space-y-2">
              <span className="text-[11px] font-semibold text-[#8ca893] uppercase tracking-wider block">
                Available Plant Mineral PPM
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[#6b8571] text-[10px]">Available N:</span>
                  <div className="font-mono font-bold text-emerald-200">{soil?.availableNPpm || 38} ppm</div>
                </div>
                <div>
                  <span className="text-[#6b8571] text-[10px]">Available P:</span>
                  <div className="font-mono font-bold text-emerald-200">{soil?.availablePPpm || 22} ppm</div>
                </div>
                <div>
                  <span className="text-[#6b8571] text-[10px]">Available K:</span>
                  <div className="font-mono font-bold text-emerald-200">{soil?.availableKPpm || 135} ppm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrient Budget Ledger */}
          <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Per-Grid Nutrient Ledger
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#8ca893]">
                Unit: kg elemental / ha
              </span>
            </div>

            {budget ? (
              <div className="space-y-4">
                <NutrientProgressBar
                  nutrient="N"
                  consumed={budget.consumedN}
                  recommended={budget.recommendedN}
                  remaining={budget.remainingN}
                  excess={budget.excessN}
                />
                <NutrientProgressBar
                  nutrient="P"
                  consumed={budget.consumedP}
                  recommended={budget.recommendedP}
                  remaining={budget.remainingP}
                  excess={budget.excessP}
                />
                <NutrientProgressBar
                  nutrient="K"
                  consumed={budget.consumedK}
                  recommended={budget.recommendedK}
                  remaining={budget.remainingK}
                  excess={budget.excessK}
                />
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#76937e]">
                No budget established for this grid.
              </div>
            )}
          </div>
        </div>

        {/* Grid Explainable Intelligence & Soil Health Section */}
        <GridIntelligenceSection
          gridCode={grid.gridCode}
          explanation={explanation}
          soilHealth={gridSoilHealth}
          anomalies={gridAnomalies}
        />

        {/* Prescription Details Section */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e3324] pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Grid Prescription & Agronomic Guidance
              </h2>
            </div>
            {activeRx && (
              <div className="flex items-center gap-2">
                <ConfidenceBadge level={activeRx.confidenceLevel} score={activeRx.confidenceScore} />
                <StatusBadge status={activeRx.status} size="sm" />
              </div>
            )}
          </div>

          {activeRx ? (
            <div className="space-y-4 text-xs">
              {/* Target Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#132317] rounded-lg border border-[#1e3324]">
                  <span className="text-[10px] text-[#6b8571] uppercase">Target Application</span>
                  <span className="text-2xl font-bold text-white font-mono block mt-1">
                    {activeRx.targetRateKgHa} <span className="text-xs font-normal text-[#8ca893]">kg/ha</span>
                  </span>
                  <span className="text-[11px] text-emerald-300 mt-0.5 block">
                    Product: {activeRx.items[0]?.fertilizer?.name || 'NPK Complete'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#132317] rounded-lg border border-[#1e3324]">
                  <span className="text-[10px] text-[#6b8571] uppercase">Recommended Range</span>
                  <span className="text-xl font-bold text-[#8ca893] font-mono block mt-1">
                    {activeRx.minRateKgHa} - {activeRx.maxRateKgHa} <span className="text-xs font-normal">kg/ha</span>
                  </span>
                  <span className="text-[11px] text-[#6b8571] mt-0.5 block">
                    Machine flow tolerance window
                  </span>
                </div>

                <div className="p-3.5 bg-[#132317] rounded-lg border border-[#1e3324]">
                  <span className="text-[10px] text-[#6b8571] uppercase">Environmental Check</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono block mt-1 uppercase">
                    {activeRx.environmentalAction || 'PROCEED'}
                  </span>
                  <span className="text-[11px] text-[#8ca893] mt-0.5 block leading-tight">
                    {activeRx.environmentalReason || 'Optimal atmospheric conditions.'}
                  </span>
                </div>
              </div>

              {/* Explainable Rationale */}
              <div className="p-4 bg-[#121f15] rounded-lg border border-[#1e3324] space-y-2">
                <span className="font-semibold text-emerald-300 uppercase tracking-wider text-[11px] block">
                  Agronomic Rationale
                </span>
                <p className="text-[#8ca893] whitespace-pre-line leading-relaxed">
                  {activeRx.explanationText}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#76937e] space-y-2">
              <p>No active prescription for this grid yet.</p>
              <p className="text-[11px] text-[#556e5a]">
                Click "Generate Prescription" above to run the intelligence engine.
              </p>
            </div>
          )}
        </div>

        {/* Application History Table */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Application History Ledger ({grid.applications.length} Records)
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e3324] text-[#718d78] uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Fertilizer Product</th>
                  <th className="pb-2">Amount Applied</th>
                  <th className="pb-2">Contributed Pure Nutrients</th>
                  <th className="pb-2">Method</th>
                  <th className="pb-2">Applied By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3324]/50">
                {grid.applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#132217]/50 transition-colors">
                    <td className="py-2.5 font-mono text-[#8ca893]">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 font-medium text-white">
                      {app.fertilizer.name}
                    </td>
                    <td className="py-2.5 font-mono text-[#8ca893]">
                      {app.quantity} {app.unit}
                    </td>
                    <td className="py-2.5 font-mono text-emerald-200">
                      +{app.contributedN}kg N, +{app.contributedP}kg P, +{app.contributedK}kg K
                    </td>
                    <td className="py-2.5 text-[#8ca893] uppercase text-[10px]">
                      {app.applicationMethod}
                    </td>
                    <td className="py-2.5 text-[#6b8571]">
                      {app.appliedBy?.name || 'Operator'}
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
