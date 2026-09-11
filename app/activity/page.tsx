import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import { History, ShieldCheck, UserCheck, Droplet, Layers, FileSpreadsheet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
  const session = await getSession();
  const orgId = session?.organizationId || '';

  const activities = await prisma.farmActivity.findMany({
    where: { organizationId: orgId },
    orderBy: { timestamp: 'desc' },
    take: 30,
  });

  const auditLogs = await prisma.auditLog.findMany({
    where: { organizationId: orgId },
    include: { user: true },
    orderBy: { timestamp: 'desc' },
    take: 20,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Operational Activity & Security Audit Trail
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Complete traceability for agronomic applications, machine control actions, and user events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Farm Activity Timeline (2 cols) */}
          <div className="lg:col-span-2 bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 border-b border-[#1e3324] pb-3">
              <History className="w-4 h-4 text-emerald-400" />
              Agronomic Event Stream ({activities.length} Events)
            </h2>

            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#142318] border border-[#203626] flex items-center justify-center shrink-0 text-emerald-400">
                    {act.action === 'APPLICATION' && <Droplet className="w-4 h-4" />}
                    {act.action === 'PRESCRIPTION_GENERATED' && <FileSpreadsheet className="w-4 h-4" />}
                    {act.action === 'PRESCRIPTION_APPROVED' && <ShieldCheck className="w-4 h-4" />}
                    {act.action !== 'APPLICATION' && act.action !== 'PRESCRIPTION_GENERATED' && act.action !== 'PRESCRIPTION_APPROVED' && (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{act.entityName}</span>
                      <span className="text-[10px] text-[#6b8571] font-mono">
                        {new Date(act.timestamp).toLocaleTimeString()} • {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#8ca893] mt-0.5 leading-relaxed">{act.description}</p>
                    <span className="text-[10px] text-[#556e5a] mt-1 block font-mono">
                      Actor: {act.actorName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Audit Log (1 col) */}
          <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 border-b border-[#1e3324] pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security Audit Log
            </h2>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-[#132217] rounded-lg border border-[#1e3324] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-300 font-semibold">{log.action}</span>
                    <span className="text-[10px] text-[#6b8571] font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8ca893]">
                    Entity: <strong className="text-white font-mono">{log.entityType}</strong>
                  </div>
                  <div className="text-[10px] text-[#556e5a] flex items-center justify-between">
                    <span>User: {log.user?.email || 'System Daemon'}</span>
                    <span className="font-mono">{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
