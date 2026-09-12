// SOIL IQ - Pilot Data Collection Tracker
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileCheck2,
  Radio,
  Tractor,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PilotMeasurementsPage({
  params,
}: {
  params: Promise<{ pilotId: string }>;
}) {
  const { pilotId } = await params;

  const pilot = await prisma.pilotProject.findUnique({
    where: { id: pilotId },
    include: {
      measurements: true,
    },
  });

  if (!pilot) return notFound();

  const totalExpected = pilot.measurements.reduce((sum, m) => sum + m.recordsExpected, 0);
  const totalCollected = pilot.measurements.reduce((sum, m) => sum + m.recordsCollected, 0);
  const totalMissing = Math.max(0, totalExpected - totalCollected);
  const coveragePct = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href={`/pilots/${pilot.id}`} className="hover:text-emerald-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pilot</span>
            </Link>
            <span>/</span>
            <span>Data Collection</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Pilot Data Collection Plan
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Tracking measurement protocol compliance, expected sampling cadence, and telemetry completeness.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0f1d13] border border-[#1e3825] px-4 py-2 rounded-xl text-xs">
          <div>
            <span className="text-[#718d78] block">Overall Coverage</span>
            <strong className="text-emerald-400 text-base">{coveragePct}%</strong>
          </div>
          <div className="border-l border-[#1e3825] pl-4">
            <span className="text-[#718d78] block">Missing Records</span>
            <strong className="text-amber-300 text-base">{totalMissing}</strong>
          </div>
          <div className="border-l border-[#1e3825] pl-4">
            <span className="text-[#718d78] block">Data Quality</span>
            <strong className="text-white text-base">HIGH</strong>
          </div>
        </div>
      </div>

      {/* Measurement Plan Table */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Scheduled Measurement Protocols
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e3825] text-[#8ca893] uppercase font-semibold">
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Frequency</th>
                <th className="py-3 px-3">Measurement Source</th>
                <th className="py-3 px-3">Unit</th>
                <th className="py-3 px-3">Responsible Party</th>
                <th className="py-3 px-3">Progress</th>
                <th className="py-3 px-3">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172b1c]">
              {pilot.measurements.map((m) => {
                const pct = m.recordsExpected > 0 ? Math.round((m.recordsCollected / m.recordsExpected) * 100) : 0;
                return (
                  <tr key={m.id} className="hover:bg-[#132418]/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white uppercase">{m.category}</td>
                    <td className="py-3 px-3 text-[#9cb2a3] capitalize">{m.frequency}</td>
                    <td className="py-3 px-3 text-white font-mono text-[11px]">{m.source}</td>
                    <td className="py-3 px-3 text-[#718d78]">{m.unit}</td>
                    <td className="py-3 px-3 text-[#9cb2a3]">{m.responsibleParty}</td>
                    <td className="py-3 px-3">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] text-[#718d78] mb-1">
                          <span>{m.recordsCollected} / {m.recordsExpected}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-[#18281c] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          m.qualityStatus === 'HIGH'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {m.qualityStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
