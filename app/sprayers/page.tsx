import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import {
  Truck,
  Gauge,
  Droplet,
  Compass,
  Cpu,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SprayersPage() {
  const session = await getSession();
  const orgId = session?.organizationId || '';

  const sprayers = await prisma.sprayer.findMany({
    where: { organizationId: orgId },
    include: {
      controlDecisions: {
        take: 3,
        orderBy: { timestamp: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                Sprayer Fleet & Telemetry Telematics
              </h1>
              <span className="text-[11px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                Hardware Abstraction
              </span>
            </div>
            <p className="text-xs text-[#8ca893] mt-1">
              Machine connectivity, CAN-bus / ISOBUS integration, tank levels, and telemetry state
            </p>
          </div>

          <Link
            href="/monitoring"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Launch Live Control Lab</span>
          </Link>
        </div>

        {/* Sprayer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sprayers.map((sprayer) => {
            const tankPct = Math.round((sprayer.currentTankLevelL / sprayer.tankCapacityL) * 100);

            return (
              <div
                key={sprayer.id}
                className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4 hover:border-[#2b4834] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{sprayer.name}</h2>
                      <StatusBadge status={sprayer.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#76937e] mt-0.5 font-medium">
                      {sprayer.model}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-[#6b8571] font-mono">
                    Mode: <strong className="text-emerald-300">{sprayer.operatingMode}</strong>
                  </div>
                </div>

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-[#132317] p-3 rounded-lg border border-[#1e3324] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#6b8571] uppercase block">Flow Rate</span>
                    <span className="font-mono font-bold text-white mt-1 block">
                      {sprayer.flowRateLpm} L/min
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b8571] uppercase block">Ground Speed</span>
                    <span className="font-mono font-bold text-white mt-1 block">
                      {sprayer.speedKmh} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b8571] uppercase block">Application Rate</span>
                    <span className="font-mono font-bold text-emerald-300 mt-1 block">
                      {sprayer.applicationRateLpha} L/ha
                    </span>
                  </div>
                </div>

                {/* Tank Level Gauge */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8ca893] flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-emerald-400" />
                      Tank Payload: {sprayer.activeFertilizerName}
                    </span>
                    <span className="font-mono text-white font-semibold">
                      {sprayer.currentTankLevelL} / {sprayer.tankCapacityL} L ({tankPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#18261c] rounded-full overflow-hidden border border-[#233829]">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${tankPct}%` }}
                    />
                  </div>
                </div>

                {/* Location & Decisions */}
                <div className="pt-2 border-t border-[#1e3324]/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#8ca893]">
                    <span>Grid: <strong className="font-mono text-emerald-300">{sprayer.currentGridCode || 'F01-G001'}</strong></span>
                    <span className="text-[#556e5a]">•</span>
                    <span>Heading: <strong className="font-mono text-white">{sprayer.headingDeg}°</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/sprayers/${sprayer.id}`}
                      className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <span>Diagnostics</span>
                    </Link>
                    <Link
                      href="/simulation/sprayer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Simulate</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
