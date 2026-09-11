import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FarmMap } from '@/components/map/FarmMap';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import {
  MapPin,
  Layers,
  Truck,
  Droplet,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Info,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  const orgId = session?.organizationId || '';

  // 1. Fetch Farms, Fields & Grids
  const farms = await prisma.farm.findMany({
    where: { organizationId: orgId },
    include: {
      fields: {
        include: {
          crop: true,
          grids: {
            include: {
              nutrientBudget: true,
              soilProfiles: { take: 1, orderBy: { sampleDate: 'desc' } },
              prescriptions: { where: { status: 'ACTIVE' }, take: 1 },
            },
          },
        },
      },
    },
  });

  const sprayers = await prisma.sprayer.findMany({
    where: { organizationId: orgId },
    include: {
      controlDecisions: { take: 1, orderBy: { timestamp: 'desc' } },
    },
  });

  const recentApplications = await prisma.fertilizerApplication.findMany({
    where: { organizationId: orgId },
    take: 6,
    orderBy: { applicationDate: 'desc' },
    include: { fertilizer: true, grid: true, appliedBy: true },
  });

  const recentDecisions = await prisma.controlDecision.findMany({
    where: { sprayer: { organizationId: orgId } },
    take: 4,
    orderBy: { timestamp: 'desc' },
    include: { sprayer: true, grid: true },
  });

  // Calculate high-level KPIs
  let totalFields = 0;
  let totalGrids = 0;
  let optimalGrids = 0;
  let cautionGrids = 0;
  let excessGrids = 0;
  let blockedGrids = 0;
  let totalAreaHa = 0;

  const mapGrids: any[] = [];
  const mapFields: any[] = [];

  farms.forEach((farm) => {
    totalAreaHa += farm.calculatedArea || 0;
    farm.fields.forEach((field) => {
      totalFields++;
      mapFields.push({
        id: field.id,
        name: field.name,
        boundaryGeoJson: field.boundaryGeoJson,
        cropName: field.crop?.name,
      });

      field.grids.forEach((grid) => {
        totalGrids++;
        if (grid.status === 'OPTIMAL') optimalGrids++;
        else if (grid.status === 'CAUTION') cautionGrids++;
        else if (grid.status === 'EXCESS_RISK') excessGrids++;
        else if (grid.status === 'BLOCKED') blockedGrids++;

        mapGrids.push({
          id: grid.id,
          gridCode: grid.gridCode,
          fieldName: field.name,
          fieldId: field.id,
          farmName: farm.name,
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
        });
      });
    });
  });

  const mapSprayers = sprayers.map((s) => ({
    id: s.id,
    name: s.name,
    model: s.model,
    latitude: s.latitude,
    longitude: s.longitude,
    status: s.status,
    applicationRate: s.applicationRateLpha,
    currentGridCode: s.currentGridCode,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Operations Control Center
              </h1>
              <span className="text-[11px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                Live Overview
              </span>
            </div>
            <p className="text-xs text-[#8ca893] mt-1">
              Precision spatial fertilizer management and closed-loop machine control
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/monitoring"
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-950"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Launch Closed-Loop Lab</span>
            </Link>
          </div>
        </div>

        {/* Prototype Scientific Notice Banner */}
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-center justify-between text-xs text-amber-200/90">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>PROTOTYPE SYSTEM:</strong> Agronomic crop response models, sensor availability multipliers, and fertilizer prescriptions represent prototype simulation values.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase text-amber-400/80 px-2 py-0.5 bg-amber-950/80 border border-amber-900 rounded">
            v1.0-prototype
          </span>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <MetricCard
            title="Total Farms"
            value={farms.length}
            subtitle={`${totalAreaHa.toFixed(1)} ha managed`}
            icon={<MapPin className="w-4 h-4" />}
          />
          <MetricCard
            title="Active Fields"
            value={totalFields}
            subtitle="5 distinct crops"
            icon={<Layers className="w-4 h-4" />}
          />
          <MetricCard
            title="Grids Monitored"
            value={totalGrids}
            subtitle={`${optimalGrids} optimal`}
            icon={<Droplet className="w-4 h-4" />}
          />
          <MetricCard
            title="Active Sprayers"
            value={`${sprayers.filter((s) => s.status === 'ONLINE').length} / ${sprayers.length}`}
            subtitle="Online telemetry"
            icon={<Truck className="w-4 h-4" />}
          />
          <MetricCard
            title="Caution Grids"
            value={cautionGrids}
            subtitle=">80% budget used"
            trend={{ value: 'Warning', isPositive: false }}
          />
          <MetricCard
            title="Excess / Blocked"
            value={`${excessGrids + blockedGrids}`}
            subtitle="Halted application"
            trend={{ value: 'Restricted', isPositive: false }}
          />
        </div>

        {/* Spatial Farm Map Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                Spatial Farm Map & Grid Visualizer
              </h2>
              <span className="text-xs text-[#76937e]">
                (Click any grid to inspect soil state and nutrient ledger)
              </span>
            </div>
            <Link
              href="/farms"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              <span>View All Farms</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <FarmMap
            grids={mapGrids}
            fields={mapFields}
            sprayers={mapSprayers}
            height="520px"
          />
        </div>

        {/* Two-Column Lower Section: Fleet Control & Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Fleet & Decisions (1 col) */}
          <div className="bg-[#0f1a12] border border-[#1e3324] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                Fleet & Real-Time Decisions
              </h3>
              <Link href="/sprayers" className="text-xs text-[#8ca893] hover:text-white">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {sprayers.map((s) => {
                const latestDecision = s.controlDecisions[0];
                return (
                  <div
                    key={s.id}
                    className="p-3 bg-[#132217] rounded-lg border border-[#1e3324] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{s.name}</span>
                      <StatusBadge status={s.status} size="sm" />
                    </div>
                    <div className="text-[#8ca893] text-[11px] flex items-center justify-between">
                      <span>Model: {s.model.split(' ')[0]}</span>
                      <span>Grid: <strong className="font-mono text-emerald-300">{s.currentGridCode || 'F01-G001'}</strong></span>
                      <span>Rate: <strong className="font-mono text-white">{s.applicationRateLpha} L/ha</strong></span>
                    </div>

                    {latestDecision && (
                      <div className="pt-2 border-t border-[#1e3324]/60 flex items-center justify-between text-[11px]">
                        <span className="text-[#6b8571]">Control Decision:</span>
                        <span
                          className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                            latestDecision.decision === 'CONTINUE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : latestDecision.decision === 'REDUCE'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {latestDecision.decision}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Applications Ledger (2 cols) */}
          <div className="lg:col-span-2 bg-[#0f1a12] border border-[#1e3324] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e3324] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-emerald-400" />
                Recent Fertilizer Applications
              </h3>
              <Link href="/activity" className="text-xs text-[#8ca893] hover:text-white">
                View Ledger
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e3324] text-[#718d78] uppercase text-[10px] tracking-wider">
                    <th className="pb-2">Grid</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Applied</th>
                    <th className="pb-2">Nutrient Contribution</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3324]/50">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#132217]/50 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-emerald-300">
                        {app.grid.gridCode}
                      </td>
                      <td className="py-2.5 text-white font-medium">
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
                      <td className="py-2.5 text-[#6b8571] text-[11px]">
                        {new Date(app.applicationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
