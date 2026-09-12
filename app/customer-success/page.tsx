// SOIL IQ - Customer Success & Account Health Dashboard
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import {
  HeartHandshake,
  Activity,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Tractor,
  Radio,
} from 'lucide-react';
import { CustomerSuccessService } from '@/lib/services/customerSuccessService';
import { EntitlementService } from '@/lib/services/entitlementService';

export const dynamic = 'force-dynamic';

export default async function CustomerSuccessPage() {
  const org = await prisma.organization.findFirst({
    include: {
      pilotProjects: { take: 1 },
      alerts: { where: { status: 'OPEN' } },
      devices: true,
    },
  });

  if (!org) return <div>No organization.</div>;

  const health = await CustomerSuccessService.evaluateAccount(org.id);
  const planUsage = await EntitlementService.getOrganizationUsage(org.id);
  const pilot = org.pilotProjects[0] || null;

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/workspace" className="hover:text-emerald-400">Workspace</Link>
            <span>/</span>
            <span>Customer Success</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-emerald-400" />
            Customer Success & Operational Health
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Dedicated account oversight for {org.name} • Continuous telemetry quality and agronomic outcome tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">
            Account Status: {health.pilotReadiness}
          </span>
        </div>
      </div>

      {/* Top Health Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Account Health Score</span>
          <div className="text-3xl font-bold text-emerald-400 mt-2">{health.healthScore} / 100</div>
          <span className="text-xs text-[#8ca893] mt-1 block">Optimal deployment readiness</span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Active Controlled Pilot</span>
          <div className="text-base font-bold text-white mt-2 truncate">
            {pilot ? pilot.name : 'None active'}
          </div>
          <span className="text-xs text-emerald-400 mt-1 block">
            {pilot ? `${pilot.crop} • ${pilot.area} acres` : 'Setup a trial'}
          </span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Hardware Telemetry Nodes</span>
          <div className="text-3xl font-bold text-white mt-2">{health.activeDevicesCount}</div>
          <span className="text-xs text-[#8ca893] mt-1 block">Sensors reporting data</span>
        </div>

        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Open Issues & Alerts</span>
          <div className="text-3xl font-bold text-amber-300 mt-2">{health.openAlertsCount}</div>
          <span className="text-xs text-[#8ca893] mt-1 block">Requiring operator review</span>
        </div>
      </div>

      {/* Operational Recommendations */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Proactive Operational Recommendations
        </h2>

        <div className="space-y-3">
          {health.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-[#08120a] border border-[#182c1e] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">{rec.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                      rec.priority === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[#8ca893]">{rec.description}</p>
              </div>

              <Link
                href={rec.actionUrl}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shrink-0 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>{rec.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
