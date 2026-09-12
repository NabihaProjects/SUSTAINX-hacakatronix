// SOIL IQ - Subscription Plan & Entitlements Dashboard
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import {
  CreditCard,
  Check,
  X,
  Layers,
  Sparkles,
  Tractor,
  Radio,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { EntitlementService, PLAN_CONFIGURATIONS } from '@/lib/services/entitlementService';

export const dynamic = 'force-dynamic';

export default async function SettingsPlanPage() {
  const org = await prisma.organization.findFirst();
  if (!org) return <div>No organization.</div>;

  const usage = await EntitlementService.getOrganizationUsage(org.id);

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/settings" className="hover:text-emerald-400">Settings</Link>
            <span>/</span>
            <span>Commercial Subscription</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            Plan Usage & Feature Entitlements
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Manage your organization tier, capacity quotas, and agricultural AI capabilities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase tracking-wider">
            Active Tier: {usage.plan.displayName}
          </span>
        </div>
      </div>

      {/* Quota Usage Progress Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] text-[#718d78] uppercase font-semibold block">Farms</span>
          <div className="text-lg font-bold text-white mt-1">
            {usage.currentCounts.farms} / {usage.plan.maxFarms}
          </div>
          <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${usage.utilizationPct.farms}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] text-[#718d78] uppercase font-semibold block">Fields</span>
          <div className="text-lg font-bold text-white mt-1">
            {usage.currentCounts.fields} / {usage.plan.maxFields}
          </div>
          <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${usage.utilizationPct.fields}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] text-[#718d78] uppercase font-semibold block">Grids</span>
          <div className="text-lg font-bold text-white mt-1">
            {usage.currentCounts.grids} / {usage.plan.maxGrids}
          </div>
          <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${usage.utilizationPct.grids}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] text-[#718d78] uppercase font-semibold block">Sensors</span>
          <div className="text-lg font-bold text-white mt-1">
            {usage.currentCounts.devices} / {usage.plan.maxDevices}
          </div>
          <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${usage.utilizationPct.devices}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4">
          <span className="text-[11px] text-[#718d78] uppercase font-semibold block">Sprayers</span>
          <div className="text-lg font-bold text-white mt-1">
            {usage.currentCounts.sprayers} / {usage.plan.maxSprayers}
          </div>
          <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${usage.utilizationPct.sprayers}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Subscription Tier Comparison Matrix */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Commercial Tier Entitlement Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {Object.values(PLAN_CONFIGURATIONS).map((p) => {
            const isCurrent = p.name === usage.plan.name;
            return (
              <div
                key={p.name}
                className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? 'bg-emerald-950/20 border-emerald-600 shadow-lg'
                    : 'bg-[#0a140d] border-[#182c1e]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{p.displayName}</h3>
                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#718d78] block mt-1">Tier: {p.name}</span>

                  <div className="space-y-2 mt-4 text-[#9cb2a3]">
                    <div className="flex justify-between">
                      <span>Max Farms</span>
                      <strong className="text-white">{p.maxFarms}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Grids</span>
                      <strong className="text-white">{p.maxGrids}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Devices</span>
                      <strong className="text-white">{p.maxDevices}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Sprayers</span>
                      <strong className="text-white">{p.maxSprayers}</strong>
                    </div>
                  </div>

                  <div className="border-t border-[#1a3321] my-4 pt-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#718d78] tracking-wider block">
                      Included Capabilities
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {p.features.aiAssistant ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#5a7461]" />
                        )}
                        <span>Grounded AI Assistant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.features.whatIfSimulation ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#5a7461]" />
                        )}
                        <span>What-If Simulation Engine</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.features.pilotProjects ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#5a7461]" />
                        )}
                        <span>Controlled Field Pilots</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.features.hardwareIntegration ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#5a7461]" />
                        )}
                        <span>Hardware & Sprayer Link</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.features.apiAccess ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#5a7461]" />
                        )}
                        <span>Developer API Access</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <div className="w-full py-2 bg-emerald-950/60 border border-emerald-700/50 rounded-lg text-center text-xs font-semibold text-emerald-300">
                      Current Plan
                    </div>
                  ) : (
                    <button className="w-full py-2 bg-[#132217] hover:bg-[#1a3321] border border-[#23422a] rounded-lg text-center text-xs font-semibold text-[#8ca893] hover:text-white transition-all">
                      Request Upgrade
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
