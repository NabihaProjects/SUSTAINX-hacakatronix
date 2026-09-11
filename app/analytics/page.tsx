import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { AnalyticsCharts } from './AnalyticsCharts';
import { MetricCard } from '@/components/ui/MetricCard';
import { LineChart, PieChart, Droplet, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await getSession();
  const orgId = session?.organizationId || '';

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
      <div className="space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Agronomic & Precision Input Analytics
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Aggregated nutrient budget compliance, spatial heterogeneity, and input utilization
          </p>
        </div>

        {/* Analytics Charts Component */}
        <AnalyticsCharts
          nutrientData={nutrientChartData}
          statusData={statusChartData}
          cropData={cropChartData}
        />
      </div>
    </AppShell>
  );
}
