// SOIL IQ - Deployment Readiness Audit Dashboard
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Calendar,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import { DeploymentReadinessService } from '@/lib/services/deploymentReadinessService';

export const dynamic = 'force-dynamic';

export default async function DeploymentReadinessPage() {
  const org = await prisma.organization.findFirst();
  if (!org) return <div>No organization.</div>;

  const readiness = await DeploymentReadinessService.evaluateReadiness({
    organizationId: org.id,
  });

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/workspace" className="hover:text-emerald-400">Workspace</Link>
            <span>/</span>
            <span>Deployment Readiness</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            Field Deployment Readiness Gate
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Pre-flight verification across 8 engineering dimensions before physical tractor and smart sprayer deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/deployment/checklists"
            className="flex items-center gap-2 px-4 py-2 bg-[#122417] hover:bg-[#1a3321] text-emerald-300 border border-[#23422a] rounded-lg text-xs font-semibold transition-all"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>13-Point Checklist</span>
          </Link>
          <Link
            href="/deployment/plan"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Implementation Plan</span>
          </Link>
        </div>
      </div>

      {/* Main Readiness Gate Card */}
      <div
        className={`border rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${
          readiness.canDeploySafely
            ? 'bg-gradient-to-r from-[#0c2214] to-[#0a170e] border-emerald-600/60'
            : 'bg-gradient-to-r from-[#24130d] to-[#140b07] border-amber-600/60'
        }`}
      >
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            {readiness.canDeploySafely ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {readiness.overallStatus}
            </h2>
          </div>
          <p className="text-xs text-[#9cb2a3] max-w-xl">
            {readiness.canDeploySafely
              ? 'All 8 engineering and agronomic dimensions have satisfied operational safety constraints. Smart sprayer unit SP-01 is authorized to execute closed-loop variable-rate prescriptions.'
              : `Operational constraints active: ${readiness.activeBlockersCount} blocking issue(s) must be resolved before physical machine dispatch.`}
          </p>
        </div>

        <div className="bg-[#08120a]/80 border border-[#1b3823] p-5 rounded-xl text-center shrink-0 min-w-[160px]">
          <span className="text-[11px] text-[#718d78] uppercase font-bold tracking-wider block">
            Readiness Index
          </span>
          <div className="text-4xl font-extrabold text-white mt-1">
            {readiness.readinessScore}%
          </div>
          <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">
            Quality Gate Threshold: 75%
          </span>
        </div>
      </div>

      {/* 8 Readiness Dimensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {readiness.dimensions.map((dim) => (
          <div
            key={dim.id}
            className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-5 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#718d78]">{dim.id}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    dim.status === 'PASSED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : dim.status === 'WARNING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {dim.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-2">{dim.name}</h3>
              <p className="text-xs text-[#8ca893] mt-1">{dim.description}</p>
            </div>

            <div className="border-t border-[#172c1c] pt-2">
              <div className="flex justify-between text-xs text-[#718d78] mb-1">
                <span>Dimension Score</span>
                <strong className="text-white">{dim.score}%</strong>
              </div>
              <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    dim.score >= 80
                      ? 'bg-emerald-500'
                      : dim.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${dim.score}%` }}
                ></div>
              </div>

              {dim.blockers.length > 0 && (
                <div className="mt-2 text-[11px] text-rose-400 space-y-0.5">
                  {dim.blockers.map((b, idx) => (
                    <div key={idx}>• {b}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Engineering Disclaimer */}
      <div className="text-center text-xs text-[#718d78] italic max-w-2xl mx-auto">
        {readiness.disclaimer}
      </div>
    </div>
  );
}
