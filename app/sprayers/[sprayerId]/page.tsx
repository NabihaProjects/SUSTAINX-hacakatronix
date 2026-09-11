import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import {
  Truck,
  Gauge,
  Droplets,
  Compass,
  Cpu,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Octagon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SprayerDetailPage({
  params,
}: {
  params: Promise<{ sprayerId: string }>;
}) {
  const { sprayerId } = await params;
  const session = await getSession();
  const orgId = session?.organizationId || '';

  const sprayer = await prisma.sprayer.findUnique({
    where: { id: sprayerId },
    include: {
      fertilizer: true,
      controlDecisions: {
        take: 15,
        orderBy: { timestamp: 'desc' },
        include: { grid: true },
      },
      telemetryEvents: {
        take: 15,
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (!sprayer) {
    notFound();
  }

  const tankPct = Math.round((sprayer.currentTankLevelL / sprayer.tankCapacityL) * 100);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/sprayers"
              className="p-2 bg-[#0e1a12] border border-[#1e3324] text-[#8ca893] hover:text-white rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{sprayer.name}</h1>
                <StatusBadge status={sprayer.status} size="sm" />
              </div>
              <p className="text-xs text-[#8ca893] mt-0.5">
                {sprayer.manufacturer} {sprayer.model} • Machine Code: <span className="font-mono text-emerald-400">{sprayer.machineCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/simulation/sprayer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition-all"
            >
              <Zap className="w-4 h-4" />
              Control in Simulation Cockpit
            </Link>
          </div>
        </div>

        {/* Machine Hardware Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0e1a12] border border-[#1e3324] p-4 rounded-xl">
            <div className="flex items-center gap-2 text-[#8ca893] text-xs font-medium">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Operating Mode</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">{sprayer.operatingMode}</div>
            <span className="text-[11px] text-[#8ca893]">Closed-loop auto rate control</span>
          </div>

          <div className="bg-[#0e1a12] border border-[#1e3324] p-4 rounded-xl">
            <div className="flex items-center gap-2 text-[#8ca893] text-xs font-medium">
              <Droplets className="w-4 h-4 text-teal-400" />
              <span>Tank Capacity</span>
            </div>
            <div className="text-lg font-bold text-cyan-400 mt-1">
              {sprayer.currentTankLevelL.toFixed(0)} / {sprayer.tankCapacityL} L
            </div>
            <span className="text-[11px] text-[#8ca893]">{tankPct}% remaining</span>
          </div>

          <div className="bg-[#0e1a12] border border-[#1e3324] p-4 rounded-xl">
            <div className="flex items-center gap-2 text-[#8ca893] text-xs font-medium">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Boom Swath Width</span>
            </div>
            <div className="text-lg font-bold text-white mt-1">{sprayer.swathWidthMeters} m</div>
            <span className="text-[11px] text-[#8ca893]">Effective spray coverage</span>
          </div>

          <div className="bg-[#0e1a12] border border-[#1e3324] p-4 rounded-xl">
            <div className="flex items-center gap-2 text-[#8ca893] text-xs font-medium">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>Current Grid</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 mt-1">{sprayer.currentGridCode || 'UNASSIGNED'}</div>
            <span className="text-[11px] text-[#8ca893]">Spatial polygon locked</span>
          </div>
        </div>

        {/* Machine Hardware Subsystems & Components */}
        <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Hardware Components & Sensor Abstractions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#142318] border border-[#1e3324] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">RTK-GNSS Receiver</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px]">
                  ONLINE
                </span>
              </div>
              <p className="text-[#8ca893]">Dual-frequency RTK receiver with sub-inch positional accuracy.</p>
              <div className="font-mono text-[11px] text-slate-300">
                Lat: {sprayer.latitude.toFixed(6)}, Lon: {sprayer.longitude.toFixed(6)}
              </div>
            </div>

            <div className="p-4 bg-[#142318] border border-[#1e3324] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Magnetic Flow Meter</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px]">
                  CALIBRATED
                </span>
              </div>
              <p className="text-[#8ca893]">High-speed electromagnetic flow sensor measuring volume delivered.</p>
              <div className="font-mono text-[11px] text-slate-300">
                Flow: {sprayer.flowRateLpm} L/min • Rate: {sprayer.applicationRateLpha} kg/ha
              </div>
            </div>

            <div className="p-4 bg-[#142318] border border-[#1e3324] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">PWM Section Valves</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono text-[10px]">
                  {sprayer.valveState}
                </span>
              </div>
              <p className="text-[#8ca893]">12-section solenoid manifold modulating instantaneous application rates.</p>
              <div className="font-mono text-[11px] text-slate-300">
                Pump: {sprayer.pumpState} • Valve State: {sprayer.valveState}
              </div>
            </div>
          </div>
        </div>

        {/* Closed-Loop Control Decision History */}
        <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#112016] border-b border-[#1e3324] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Closed-Loop Safety & Control Decisions</h3>
            </div>
            <span className="text-xs text-[#8ca893]">Last 15 telemetry evaluations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#142318] text-[#8ca893] uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Grid</th>
                  <th className="p-3">Decision</th>
                  <th className="p-3">Target Rate</th>
                  <th className="p-3">Actual Rate</th>
                  <th className="p-3">Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3324]">
                {sprayer.controlDecisions.map((cd) => (
                  <tr key={cd.id} className="hover:bg-[#132317]">
                    <td className="p-3 font-mono text-[11px]">{new Date(cd.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{cd.grid?.gridCode || 'OUT'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          cd.decision === 'STOP'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : cd.decision === 'REDUCE'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {cd.decision}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{cd.targetRate} kg/ha</td>
                    <td className="p-3 font-mono font-bold text-white">{cd.actualRate} kg/ha</td>
                    <td className="p-3 max-w-md truncate text-[#8ca893]">{cd.reason}</td>
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
