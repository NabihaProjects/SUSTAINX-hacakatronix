import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FarmService } from '@/lib/services/farmService';
import { getSession } from '@/lib/auth/session';
import { MapPin, Plus, ArrowRight, Layers, Grid as GridIcon, Calendar } from 'lucide-react';
import { CreateFarmButton } from './CreateFarmButton';

export const dynamic = 'force-dynamic';

export default async function FarmsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getSession();
  const orgId = session?.organizationId || '';
  const { q } = await searchParams;

  const farms = await FarmService.getFarms(orgId, q);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Farm Portfolio Management
            </h1>
            <p className="text-xs text-[#8ca893] mt-1">
              Manage multi-tenant agricultural holding, spatial boundaries, and crop allocations
            </p>
          </div>

          <CreateFarmButton />
        </div>

        {/* Farm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="bg-[#0f1b12] border border-[#1e3324] rounded-xl overflow-hidden p-6 hover:border-[#2b4834] transition-all shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{farm.name}</h2>
                    <StatusBadge status={farm.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#76937e] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{farm.locationLabel || 'Location not specified'}</span>
                  </div>
                </div>

                <Link
                  href={`/farms/${farm.id}`}
                  className="p-2 rounded-lg bg-[#142418] border border-[#203626] text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                  title="Open Farm"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {farm.description && (
                <p className="text-xs text-[#8ca893] leading-relaxed">
                  {farm.description}
                </p>
              )}

              {/* Farm Stats Matrix */}
              <div className="grid grid-cols-3 gap-3 bg-[#132317] p-3 rounded-lg border border-[#1e3324] text-xs">
                <div>
                  <div className="text-[10px] text-[#6b8571] uppercase tracking-wider font-semibold">
                    Declared Area
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    {farm.declaredArea} {farm.areaUnit}
                  </div>
                  <div className="text-[10px] text-[#6b8571] mt-0.5">
                    Calc: {farm.calculatedAreaDerived} ha
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#6b8571] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    Fields
                  </div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    {farm.fieldCount} fields
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#6b8571] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <GridIcon className="w-3 h-3 text-emerald-400" />
                    Spatial Grids
                  </div>
                  <div className="font-mono font-bold text-emerald-300 mt-0.5">
                    {farm.gridCount} cells
                  </div>
                </div>
              </div>

              {/* Fields preview */}
              <div className="pt-2 border-t border-[#1e3324]/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#6b8571]">Crops:</span>
                  <div className="flex items-center gap-1.5">
                    {farm.fields.map((f) => (
                      <span
                        key={f.id}
                        className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-[10px] font-medium"
                      >
                        {f.crop?.name || 'Unset'}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/farms/${farm.id}`}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Farm Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
