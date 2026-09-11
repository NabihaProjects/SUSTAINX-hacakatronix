import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/db/prisma';
import {
  Building2,
  Users,
  Shield,
  Cpu,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  const orgId = session?.organizationId || '';

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Organization & System Settings
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Tenant configuration, team permissions, hardware integration endpoints, and unit standards
          </p>
        </div>

        {/* Organization Profile */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1e3324] pb-3">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Tenant Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#6b8571] block mb-1">Organization Name</span>
              <span className="font-semibold text-white text-sm">{org?.name}</span>
            </div>
            <div>
              <span className="text-[#6b8571] block mb-1">Tenant Slug</span>
              <span className="font-mono text-emerald-300">{org?.slug}</span>
            </div>
            <div>
              <span className="text-[#6b8571] block mb-1">Subscription Plan</span>
              <span className="font-mono font-bold text-white bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-[11px]">
                {org?.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Team Members & RBAC Roles */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1e3324] pb-3">
            <Users className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Team Members & Role-Aware Authorization
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e3324] text-[#718d78] uppercase text-[10px] tracking-wider">
                  <th className="pb-2">User Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Assigned Role</th>
                  <th className="pb-2">Permissions Overview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3324]/50">
                {org?.members.map((m) => (
                  <tr key={m.id} className="hover:bg-[#132217]/50">
                    <td className="py-2.5 font-medium text-white">{m.user.name}</td>
                    <td className="py-2.5 font-mono text-[#8ca893]">{m.user.email}</td>
                    <td className="py-2.5">
                      <span className="font-mono text-[10px] uppercase font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#6b8571]">
                      {m.role === 'OWNER' && 'Full organization control, user management, billing, settings'}
                      {m.role === 'OPERATOR' && 'Live sprayer telemetry, control override, application recording'}
                      {m.role === 'FARM_MANAGER' && 'Farm, field, grid, and prescription management'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hardware & MQTT Abstraction Configuration */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1e3324] pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Hardware Telemetry & MQTT Broker Endpoints
            </h2>
          </div>

          <p className="text-xs text-[#8ca893] leading-relaxed">
            Configure future broker connection parameters for physical RTK-GNSS gateways, in-situ soil probe meshes, and machine ISOBUS telematics. Currently simulated through the clean hardware abstraction layer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
              <span className="text-[#6b8571] text-[10px] uppercase block mb-1">MQTT Telemetry Broker URI</span>
              <span className="font-mono text-white">mqtts://broker.soiliq.ag:8883/v1/telemetry</span>
            </div>
            <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324]">
              <span className="text-[#6b8571] text-[10px] uppercase block mb-1">CAN-Bus / ISOBUS Gateway</span>
              <span className="font-mono text-white">ISO 11783-10 Task Controller (Simulated)</span>
            </div>
          </div>
        </div>

        {/* Canonical Unit Standards */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1e3324] pb-3">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Agronomic Unit Standards
            </h2>
          </div>

          <div className="p-3 bg-[#132317] rounded-lg border border-[#1e3324] text-xs space-y-1">
            <div className="text-white font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Canonical Internal Database Units</span>
            </div>
            <p className="text-[#8ca893] text-[11px] leading-relaxed">
              Spatial area is mathematically normalized to <strong>Hectares (ha)</strong> and nutrient budgets are tracked in <strong>kg elemental N, P, K / ha</strong>. The user interface seamlessly renders in acres or hectares based on field-level configuration.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
