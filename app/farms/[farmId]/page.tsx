import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MetricCard } from '@/components/ui/MetricCard';
import { FarmMap } from '@/components/map/FarmMap';
import { FarmService } from '@/lib/services/farmService';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import {
  MapPin,
  Layers,
  Grid as GridIcon,
  Plus,
  ArrowRight,
  TrendingUp,
  Droplet,
  Beaker,
  ShieldCheck,
} from 'lucide-react';
import { CreateFieldModal } from './CreateFieldModal';

export const dynamic = 'force-dynamic';

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ farmId: string }>;
}) {
  const session = await getSession();
  const orgId = session?.organizationId || '';
  const { farmId } = await params;

  const farm = await FarmService.getFarmById(farmId, orgId);
  if (!farm) notFound();

  // Fetch crops catalog for the Create Field modal
  const crops = await prisma.crop.findMany({
    orderBy: { name: 'asc' },
  });

  // Prepare map items
  const mapGrids: any[] = [];
  const mapFields: any[] = [];

  farm.fields.forEach((field) => {
    mapFields.push({
      id: field.id,
      name: field.name,
      boundaryGeoJson: field.boundaryGeoJson,
      cropName: field.crop?.name,
    });

    field.grids.forEach((grid) => {
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
      });
    });
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Farm Breadcrumbs & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#76937e] mb-1">
              <Link href="/farms" className="hover:text-white transition-colors">
                Farms
              </Link>
              <span>/</span>
              <span className="text-emerald-300 font-medium">{farm.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                {farm.name}
              </h1>
              <StatusBadge status={farm.status} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8ca893] mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{farm.locationLabel || 'Midwest Holding'}</span>
              <span className="text-[#556e5a]">•</span>
              <span>
                Declared: <strong className="text-white font-mono">{farm.declaredArea} {farm.areaUnit}</strong>
              </span>
              <span className="text-[#556e5a]">•</span>
              <span>
                Calculated: <strong className="text-emerald-300 font-mono">{farm.calculatedArea} ha</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <CreateFieldModal farmId={farm.id} farmName={farm.name} crops={crops} />
          </div>
        </div>

        {/* Farm KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Field Holdings"
            value={farm.fields.length}
            subtitle="Configured field parcels"
            icon={<Layers className="w-4 h-4" />}
          />
          <MetricCard
            title="Total Grids"
            value={farm.totalGrids}
            subtitle={`${farm.statusBreakdown.optimal} optimal cells`}
            icon={<GridIcon className="w-4 h-4" />}
          />
          <MetricCard
            title="Caution Grids"
            value={farm.statusBreakdown.caution}
            subtitle="Approaching ceiling"
            trend={{ value: 'Warning', isPositive: false }}
          />
          <MetricCard
            title="Excess / Blocked"
            value={`${farm.statusBreakdown.excessRisk + farm.statusBreakdown.blocked}`}
            subtitle="Application locks"
            trend={{ value: 'Restricted', isPositive: false }}
          />
        </div>

        {/* Farm Map Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
              Farm Spatial Boundaries & Grids
            </h2>
            <span className="text-xs text-[#76937e]">
              {farm.fields.length} Fields • {farm.totalGrids} Discrete Spatial Grids
            </span>
          </div>

          <FarmMap
            grids={mapGrids}
            fields={mapFields}
            centerLat={farm.latitude}
            centerLon={farm.longitude}
            height="480px"
          />
        </div>

        {/* Fields List in this Farm */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
              Field Parcels in {farm.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farm.fields.map((field) => (
              <div
                key={field.id}
                className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 hover:border-[#2b4834] transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{field.name}</h3>
                    <div className="text-xs text-emerald-300 mt-0.5 flex items-center gap-1.5">
                      <span className="font-semibold">{field.crop?.name || 'Unassigned Crop'}</span>
                      <span className="text-[#556e5a]">•</span>
                      <span className="text-[#8ca893]">{field.growthStage || 'Vegetative'}</span>
                    </div>
                  </div>
                  <StatusBadge status={field.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#132317] p-2.5 rounded-lg border border-[#1e3324] text-xs">
                  <div>
                    <div className="text-[10px] text-[#6b8571]">Area</div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {field.declaredArea} {field.areaUnit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6b8571]">Grids</div>
                    <div className="font-mono font-bold text-emerald-300 mt-0.5">
                      {field.grids.length} cells
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e3324]/50 flex items-center justify-between text-xs">
                  <span className="text-[#6b8571] text-[11px]">
                    Soil: {field.soilType}
                  </span>
                  <Link
                    href={`/farms/${farm.id}/fields/${field.id}`}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Manage Grids</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
