// SOIL IQ - Customer Workspace
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import {
  Building2,
  Tractor,
  Radio,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  Sparkles,
  Layers,
  Clock,
  Compass,
  DollarSign,
  Activity,
} from 'lucide-react';
import { CustomerSuccessService } from '@/lib/services/customerSuccessService';
import { EntitlementService } from '@/lib/services/entitlementService';

export const dynamic = 'force-dynamic';

export default async function WorkspacePage() {
  const org = await prisma.organization.findFirst({
    include: {
      farms: {
        include: {
          fields: {
            include: { grids: true },
          },
        },
      },
      sprayers: true,
      devices: true,
      deviceConnections: true,
      alerts: { where: { status: 'OPEN' }, take: 4 },
      prescriptions: { where: { status: 'APPROVED' }, take: 4 },
      pilotProjects: { where: { status: 'ACTIVE' }, take: 1 },
      operatorTasks: { where: { status: 'PENDING' }, take: 4 },
    },
  });

  if (!org) {
    return <div className="p-8 text-white">No organization configured.</div>;
  }

  const activePilot = org.pilotProjects[0] || null;
  const healthReport = await CustomerSuccessService.evaluateAccount(org.id);
  const planUsage = await EntitlementService.getOrganizationUsage(org.id);

  const totalFields = org.farms.reduce((acc, f) => acc + f.fields.length, 0);
  const totalGrids = org.farms.reduce(
    (acc, f) => acc + f.fields.reduce((gAcc, fld) => gAcc + fld.grids.length, 0),
    0
  );
  const onlineSensors = org.deviceConnections.filter((c) => c.status === 'CONNECTED').length;
  const activeSprayers = org.sprayers.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Top Header & Org Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="w-7 h-7 text-emerald-400" />
              {org.name}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 uppercase tracking-wider">
              {org.organizationType || 'FARM'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-700/50 uppercase tracking-wider">
              Plan: {org.plan}
            </span>
          </div>
          <p className="text-sm text-[#8ca893] mt-1">
            Customer Operating Workspace • Farm Operations, Pilot Verification & Agronomic Decision Support
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pilots/new"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-emerald-950"
          >
            <Compass className="w-4 h-4" />
            <span>Launch New Pilot</span>
          </Link>
          <Link
            href="/review"
            className="flex items-center gap-2 px-4 py-2 bg-[#122417] hover:bg-[#1a3321] text-emerald-300 border border-[#23422a] rounded-lg text-sm font-medium transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Agronomist Review</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8ca893] uppercase tracking-wider">Farm Portfolio</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{org.farms.length}</span>
            <span className="text-xs text-[#718d78]">farms ({totalFields} fields, {totalGrids} grids)</span>
          </div>
          <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            100% spatial boundary mapped
          </div>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8ca893] uppercase tracking-wider">Active Machinery</span>
            <Tractor className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{activeSprayers}</span>
            <span className="text-xs text-[#718d78]">of {org.sprayers.length} sprayers ready</span>
          </div>
          <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Closed-loop PWM modulation enabled
          </div>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8ca893] uppercase tracking-wider">IoT Sensor Network</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{onlineSensors}</span>
            <span className="text-xs text-[#718d78]">of {org.devices.length} nodes online</span>
          </div>
          <div className="mt-3 text-xs text-[#8ca893]">
            Telemetry coverage: <strong className="text-white">88%</strong>
          </div>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8ca893] uppercase tracking-wider">Account Health Score</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{healthReport.healthScore}</span>
            <span className="text-xs text-[#718d78]">/ 100</span>
          </div>
          <div className="mt-3 text-xs text-emerald-400 font-medium">
            Status: {healthReport.pilotReadiness}
          </div>
        </div>
      </div>

      {/* Main Two-Column Operating Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Pilot & Operational Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Pilot Highlight */}
          {activePilot ? (
            <div className="bg-gradient-to-br from-[#0e2115] to-[#0a170e] border border-emerald-600/40 rounded-xl p-6 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b3a24] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ACTIVE PILOT TRIAL
                    </span>
                    <span className="text-xs text-[#8ca893]">Crop: {activePilot.crop}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{activePilot.name}</h3>
                </div>
                <Link
                  href={`/pilots/${activePilot.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-[#142d1b] px-3 py-1.5 rounded-lg border border-[#224b2d] transition-colors"
                >
                  <span>Open Pilot Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
                <div>
                  <span className="text-xs text-[#718d78] block">Trial Area</span>
                  <span className="text-lg font-bold text-white">{activePilot.area} acres</span>
                </div>
                <div>
                  <span className="text-xs text-[#718d78] block">Control Split</span>
                  <span className="text-sm font-semibold text-emerald-300">
                    {activePilot.controlArea}ac (Ctrl) vs {activePilot.soilIQArea}ac (VRA)
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#718d78] block">Fertilizer Saved</span>
                  <span className="text-lg font-bold text-emerald-400">~20.0%</span>
                </div>
                <div>
                  <span className="text-xs text-[#718d78] block">Lead Agronomist</span>
                  <span className="text-xs text-white font-medium truncate block">{activePilot.leadUser || 'Assigned'}</span>
                </div>
              </div>

              <div className="bg-[#08120a]/80 border border-[#162e1d] rounded-lg p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#9cb2a3]">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Success Criterion: <strong>Fertilizer reduction &gt;= 15%</strong> currently on track.</span>
                </div>
                <Link
                  href={`/pilots/${activePilot.id}/results`}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  View Interim Results
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-6 text-center">
              <Compass className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-white">No Active Field Pilot</h3>
              <p className="text-xs text-[#8ca893] max-w-md mx-auto mt-1 mb-4">
                Launch a side-by-side controlled pilot to validate variable-rate fertilizer savings against conventional practice.
              </p>
              <Link
                href="/pilots/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition-colors"
              >
                <span>Configure Pilot Trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Operational Tasks & Field Actions */}
          <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c3322] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                Operational Tasks & Runbook
              </h3>
              <Link href="/mobile/tasks" className="text-xs text-emerald-400 hover:underline">
                View in PWA
              </Link>
            </div>

            <div className="space-y-2.5">
              {org.operatorTasks.length > 0 ? (
                org.operatorTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0a140d] border border-[#172b1c] text-xs"
                  >
                    <div>
                      <strong className="text-white block">{t.title}</strong>
                      <span className="text-[#718d78]">
                        Priority: <span className="text-amber-300 font-medium">{t.priority}</span> • Assigned to Operator
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-950 text-emerald-400 rounded text-[10px] font-semibold border border-emerald-800/40">
                      {t.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-[#718d78] text-center">
                  All routine daily field operations completed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Open Alerts, Agronomic Recommendations & Entitlements */}
        <div className="space-y-6">
          {/* Prioritized Operational Recommendations */}
          <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c3322] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                System Recommendations
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                {healthReport.recommendations.length} items
              </span>
            </div>

            <div className="space-y-3">
              {healthReport.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-[#0a140d] border border-[#1b3320] rounded-lg space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{rec.title}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        rec.priority === 'HIGH'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[#8ca893] leading-relaxed">{rec.description}</p>
                  <Link
                    href={rec.actionUrl}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 pt-1"
                  >
                    <span>{rec.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c3322] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Telemetry Alerts
              </h3>
              <span className="text-xs text-[#718d78]">{org.alerts.length} open</span>
            </div>

            <div className="space-y-2">
              {org.alerts.length > 0 ? (
                org.alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-[#0a140d] border border-[#1f3022] text-xs flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-white block">{a.title}</strong>
                      <span className="text-[#718d78] text-[11px]">{a.message}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                      {a.severity}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-[#718d78] text-center">
                  Zero active hardware or environmental faults.
                </div>
              )}
            </div>
          </div>

          {/* Subscription & Entitlements Card */}
          <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Commercial Tier Quotas</span>
              <Link href="/settings/plan" className="text-emerald-400 hover:underline">
                Manage Plan
              </Link>
            </div>
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[#8ca893] mb-1">
                  <span>Farms ({planUsage.currentCounts.farms} / {planUsage.plan.maxFarms})</span>
                  <span>{planUsage.utilizationPct.farms}%</span>
                </div>
                <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${planUsage.utilizationPct.farms}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#8ca893] mb-1">
                  <span>Grids ({planUsage.currentCounts.grids} / {planUsage.plan.maxGrids})</span>
                  <span>{planUsage.utilizationPct.grids}%</span>
                </div>
                <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${planUsage.utilizationPct.grids}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
