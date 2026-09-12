'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import {
  Compass,
  Plus,
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingDown,
  Layers,
  ChevronRight,
  BarChart3,
  Target,
  Leaf,
} from 'lucide-react';

// Deterministic demo pilots for the hackathon prototype
const DEMO_PILOTS = [
  {
    id: 'plt-001',
    name: 'Green Valley Nitrogen Optimisation Pilot',
    farm: 'Green Valley Farm',
    field: 'North Block A (14.2 ha)',
    status: 'ACTIVE',
    phase: 'Application',
    crop: 'Winter Wheat',
    startDate: '2026-08-01',
    endDate: '2026-10-31',
    nitrogenReduction: 18,
    yieldVariance: '+2.1%',
    gridsMonitored: 8,
    daysRemaining: 49,
    costSavingPct: 14,
    description:
      'Variable-rate nitrogen application trial comparing SOIL IQ prescription vs. flat-rate control. Targeting 20% input reduction without yield loss.',
  },
  {
    id: 'plt-002',
    name: 'Riparian Buffer Lockout Validation',
    farm: 'Green Valley Farm',
    field: 'South Creek Field (9.8 ha)',
    status: 'COMPLETED',
    phase: 'Analysis',
    crop: 'Maize',
    startDate: '2026-05-15',
    endDate: '2026-08-30',
    nitrogenReduction: 22,
    yieldVariance: '+0.8%',
    gridsMonitored: 6,
    daysRemaining: 0,
    costSavingPct: 19,
    description:
      'Validated autonomous STOP decision within 2 m of creek boundary across 14 application passes. Zero nutrient run-off incidents recorded.',
  },
  {
    id: 'plt-003',
    name: 'Multi-Grid Prescription Accuracy Audit',
    farm: 'Green Valley Farm',
    field: 'East Paddock (11.5 ha)',
    status: 'PLANNED',
    phase: 'Setup',
    crop: 'Canola',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    nitrogenReduction: null,
    yieldVariance: null,
    gridsMonitored: 10,
    daysRemaining: 19,
    costSavingPct: null,
    description:
      'Full-season trial of SOIL IQ closed-loop variable-rate across 10 discrete grid zones. Benchmarked against NDVI imagery and lab soil samples.',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: FlaskConical },
  COMPLETED: { label: 'Completed', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: CheckCircle2 },
  PLANNED: { label: 'Planned', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: Clock },
};

export default function PilotsPage() {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'PLANNED'>('ALL');

  const filtered = filter === 'ALL' ? DEMO_PILOTS : DEMO_PILOTS.filter((p) => p.status === filter);

  const stats = {
    total: DEMO_PILOTS.length,
    active: DEMO_PILOTS.filter((p) => p.status === 'ACTIVE').length,
    completed: DEMO_PILOTS.filter((p) => p.status === 'COMPLETED').length,
    avgReduction: Math.round(
      DEMO_PILOTS.filter((p) => p.nitrogenReduction != null).reduce(
        (sum, p) => sum + (p.nitrogenReduction ?? 0),
        0
      ) / DEMO_PILOTS.filter((p) => p.nitrogenReduction != null).length
    ),
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1a12] border border-[#1e3324] p-5 rounded-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                PILOT
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Controlled Field Pilots</h1>
            </div>
            <p className="text-sm text-[#8ca893] mt-1">
              Rigorous field validation of SOIL IQ prescriptions vs. conventional practice.
            </p>
          </div>
          <Link
            href="/pilots/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Pilot
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Pilots', value: stats.total, icon: Compass, color: 'text-white' },
            { label: 'Active Now', value: stats.active, icon: FlaskConical, color: 'text-emerald-400' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-blue-400' },
            {
              label: 'Avg N Reduction',
              value: `${stats.avgReduction}%`,
              icon: TrendingDown,
              color: 'text-teal-400',
            },
          ].map((s) => (
            <div key={s.label} className="bg-[#0e1a12] border border-[#1e3324] p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-[#8ca893]">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'PLANNED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                filter === f
                  ? 'bg-emerald-900/40 text-emerald-200 border-emerald-700/50'
                  : 'text-[#8ca893] border-[#1e3324] hover:text-white hover:bg-[#132217]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Pilot Cards */}
        <div className="space-y-4">
          {filtered.map((pilot) => {
            const sc = STATUS_CONFIG[pilot.status];
            const StatusIcon = sc.icon;
            return (
              <div
                key={pilot.id}
                className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-5 hover:border-emerald-700/50 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold uppercase border rounded-full ${sc.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                      <span className="text-xs text-[#8ca893] bg-[#132217] px-2 py-0.5 rounded-full border border-[#1e3324]">
                        {pilot.phase}
                      </span>
                      <span className="text-xs text-[#8ca893]">
                        <Leaf className="w-3 h-3 inline mr-1 text-emerald-500" />
                        {pilot.crop}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {pilot.name}
                      </h2>
                      <p className="text-xs text-[#8ca893] mt-0.5">
                        {pilot.farm} · {pilot.field}
                      </p>
                    </div>

                    <p className="text-sm text-[#9cb2a3] leading-relaxed max-w-2xl">{pilot.description}</p>

                    {/* Metrics row */}
                    <div className="flex flex-wrap gap-4 pt-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#8ca893]">
                        <Layers className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{pilot.gridsMonitored} grids monitored</span>
                      </div>
                      {pilot.nitrogenReduction != null && (
                        <div className="flex items-center gap-1.5 text-xs text-teal-400">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>{pilot.nitrogenReduction}% N reduction</span>
                        </div>
                      )}
                      {pilot.yieldVariance != null && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Yield {pilot.yieldVariance} vs. control</span>
                        </div>
                      )}
                      {pilot.costSavingPct != null && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                          <Target className="w-3.5 h-3.5" />
                          <span>{pilot.costSavingPct}% input cost saving</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: date + CTA */}
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <div className="text-right">
                      <div className="text-[11px] text-[#5a7461] uppercase tracking-wider">Duration</div>
                      <div className="text-xs text-[#9cb2a3] mt-0.5">
                        {pilot.startDate} → {pilot.endDate}
                      </div>
                      {pilot.status === 'ACTIVE' && (
                        <div className="mt-1 text-xs font-semibold text-amber-400">
                          {pilot.daysRemaining}d remaining
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/pilots/${pilot.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-700/40 rounded-lg transition-all"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="w-10 h-10 text-[#5a7461] mb-3" />
            <p className="text-[#8ca893] font-medium">No pilots match this filter.</p>
            <button
              onClick={() => setFilter('ALL')}
              className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              Show all
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
