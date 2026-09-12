// SOIL IQ - Agronomist Review Queue
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AgronomistReviewPage() {
  const org = await prisma.organization.findFirst({
    include: {
      reviewItems: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const reviewItems = org?.reviewItems || [];
  const pendingCount = reviewItems.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              Agronomist Review & Decision Queue
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/50 uppercase">
              {pendingCount} Pending Reviews
            </span>
          </div>
          <p className="text-xs text-[#8ca893] mt-1">
            Certified agronomist oversight for low-confidence prescriptions, sensor-lab discrepancies, and nutrient baselines.
          </p>
        </div>

        <div className="text-xs text-[#718d78]">
          Role: <strong className="text-white">AGRONOMIST</strong> • Machine actuation safety interlock active
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-4">
        {reviewItems.map((item) => {
          const evidence = JSON.parse(item.evidenceJson || '{}');
          return (
            <div
              key={item.id}
              className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 shadow-md space-y-4 transition-all hover:border-[#2a4d33]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#182c1e] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider">
                    {item.targetType}
                  </span>
                  <h3 className="text-sm font-bold text-white">{item.issueTitle}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#718d78]">Confidence:</span>
                  <span className="text-xs font-bold text-white">
                    {Math.round(item.confidenceScore * 100)}%
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2 ${
                      item.status === 'PENDING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : item.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Evidence & Recommendation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#08120a] p-4 rounded-xl border border-[#172b1c] space-y-1.5">
                  <strong className="text-[#8ca893] uppercase text-[10px] tracking-wider block">
                    Scientific Evidence Store
                  </strong>
                  <div className="font-mono text-[#c2d6c7] text-[11px] space-y-1">
                    {Object.entries(evidence).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-[#718d78]">{key}:</span> {String(val)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#08120a] p-4 rounded-xl border border-[#172b1c] space-y-1.5 flex flex-col justify-between">
                  <div>
                    <strong className="text-[#8ca893] uppercase text-[10px] tracking-wider block">
                      Agronomic Recommendation
                    </strong>
                    <p className="text-white leading-relaxed mt-1">{item.recommendationText}</p>
                  </div>
                  <div className="text-[11px] text-[#718d78] pt-2">
                    Target ID: <span className="text-[#9cb2a3] font-mono">{item.targetId}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Pending Review */}
              {item.status === 'PENDING' && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-[#718d78]">
                    Prescription confidence automatically upgrades upon Agronomist sign-off.
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17251a] hover:bg-[#203324] text-amber-300 border border-amber-800/40 rounded-lg text-xs font-semibold transition-all">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Needs More Data</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-semibold transition-all">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Unlock VRA</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
