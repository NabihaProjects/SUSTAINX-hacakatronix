import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { AnalyticsCharts } from './AnalyticsCharts';
import { IntelligenceAnalyticsView } from '@/components/analytics/IntelligenceAnalyticsView';
import { SoilHealthService } from '@/lib/domain/soilHealthService';
import { FertilizerEfficiencyService } from '@/lib/domain/fertilizerEfficiencyService';
import { AnomalyDetectionService } from '@/lib/domain/anomalyDetectionService';
import { IntelligenceSeedService } from '@/lib/services/intelligenceSeedService';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await getSession();
  let orgId = session?.organizationId || '';

  if (!orgId) {
    const firstOrg = await prisma.organization.findFirst();
    if (firstOrg) orgId = firstOrg.id;
  }

  // Ensure baseline model versions, insights, and snapshots are populated
  if (orgId) {
    try {
      await IntelligenceSeedService.ensureIntelligenceSeeded(orgId);
    } catch (err) {
      console.warn('Seed intelligence warning:', err);
    }
  }

  // 1. Fetch domain analytics: Soil Health, Efficiency, Anomalies
  const soilHealth = await SoilHealthService.calculateFarmSoilHealth(orgId);
  const efficiency = await FertilizerEfficiencyService.calculateEfficiency(orgId);
  const rawAnomalies = await AnomalyDetectionService.detectAnomalies(orgId);

  // 2. Fetch Priority Insights
  const dbInsights = await prisma.intelligenceInsight.findMany({
    where: { organizationId: orgId, status: 'ACTIVE' },
    orderBy: { priority: 'asc' },
    take: 4,
  });

  const formattedInsights = dbInsights.map((ins) => ({
    id: ins.id,
    title: ins.title,
    summary: ins.summary,
    priority: ins.priority as 'HIGH' | 'MEDIUM' | 'LOW',
    category: ins.category,
    confidence: ins.confidence,
    confidenceLevel: ins.confidenceLevel,
    recommendedAction: ins.recommendedAction,
    potentialImpact: ins.potentialImpact,
    evidence: ins.evidenceJson ? JSON.parse(ins.evidenceJson) : [],
  }));

  const formattedAnomalies = rawAnomalies.slice(0, 4).map((ano) => ({
    id: ano.id,
    gridCode: ano.gridCode,
    metricType: ano.metricType,
    anomalyType: ano.anomalyType,
    severity: ano.severity,
    description: ano.description,
    hypotheses: ano.rootCauseHypotheses,
  }));

  // 3. Grid & Crop distributions
  const grids = await prisma.grid.findMany({
    where: { organizationId: orgId },
    include: { nutrientBudget: true },
  });

  const crops = await prisma.crop.findMany({
    include: { fields: true },
  });

  // Aggregate nutrient metrics
  let totalRecN = 0;
  let totalRecP = 0;
  let totalRecK = 0;
  let totalConN = 0;
  let totalConP = 0;
  let totalConK = 0;

  let optimal = 0;
  let caution = 0;
  let excess = 0;
  let blocked = 0;

  grids.forEach((g) => {
    if (g.status === 'OPTIMAL') optimal++;
    else if (g.status === 'CAUTION') caution++;
    else if (g.status === 'EXCESS_RISK') excess++;
    else if (g.status === 'BLOCKED') blocked++;

    if (g.nutrientBudget) {
      totalRecN += g.nutrientBudget.recommendedN;
      totalRecP += g.nutrientBudget.recommendedP;
      totalRecK += g.nutrientBudget.recommendedK;
      totalConN += g.nutrientBudget.consumedN;
      totalConP += g.nutrientBudget.consumedP;
      totalConK += g.nutrientBudget.consumedK;
    }
  });

  const count = Math.max(1, grids.length);

  const nutrientChartData = [
    { nutrient: 'Nitrogen (N)', consumed: Math.round(totalConN / count), recommended: Math.round(totalRecN / count) },
    { nutrient: 'Phosphorus (P)', consumed: Math.round(totalConP / count), recommended: Math.round(totalRecP / count) },
    { nutrient: 'Potassium (K)', consumed: Math.round(totalConK / count), recommended: Math.round(totalRecK / count) },
  ];

  const statusChartData = [
    { name: 'Optimal', value: optimal, color: '#22c55e' },
    { name: 'Caution', value: caution, color: '#f59e0b' },
    { name: 'Excess Risk', value: excess, color: '#ef4444' },
    { name: 'Blocked', value: blocked, color: '#64748b' },
  ];

  const cropChartData = crops.map((c) => ({
    name: c.name,
    value: c.fields.length,
  }));

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Agronomic & Precision Input Analytics
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Intelligence v2.4
            </span>
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Explainable AI insights, soil health indexing, anomaly telemetry, and nutrient compliance
          </p>
        </div>

        {/* Intelligence View (KPIs, Soil Health, Insights, Anomalies) */}
        <IntelligenceAnalyticsView
          soilHealth={soilHealth}
          efficiency={efficiency}
          insights={formattedInsights}
          anomalies={formattedAnomalies}
        />

        {/* Spatial Nutrient Charts */}
        <div className="space-y-3 pt-4 border-t border-[#1e3324]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Spatial Budget & Field Demographics
          </h2>
          <AnalyticsCharts
            nutrientData={nutrientChartData}
            statusData={statusChartData}
            cropData={cropChartData}
          />
        </div>
      </div>
    </AppShell>
  );
}
