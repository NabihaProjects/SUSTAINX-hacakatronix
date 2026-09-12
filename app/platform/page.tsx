// SOIL IQ - Internal Platform Administrator Control Center
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import {
  Server,
  Building2,
  Users,
  Compass,
  Radio,
  Activity,
  ShieldAlert,
  HardDrive,
  Cpu,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PlatformAdminPage() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          farms: true,
          fields: true,
          devices: true,
          sprayers: true,
          pilotProjects: true,
          members: true,
        },
      },
    },
  });

  const totalDevices = orgs.reduce((acc, o) => acc + o._count.devices, 0);
  const totalPilots = orgs.reduce((acc, o) => acc + o._count.pilotProjects, 0);
  const totalUsers = orgs.reduce((acc, o) => acc + o._count.members, 0);

  return (
    <div className="min-h-screen bg-[#060a07] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <span>Platform Admin</span>
            <span>/</span>
            <span>Multi-Tenant Operations</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <Server className="w-7 h-7 text-emerald-400" />
            Internal Platform Admin Console
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Global fleet oversight, customer organization tenancy, telemetry ingestion health, and enterprise subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Internal Restricted Access</span>
        </div>
      </div>

      {/* Global Fleet Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0b140e] border border-[#1b3320] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Total Tenant Orgs</span>
          <div className="text-3xl font-bold text-white mt-2">{orgs.length}</div>
          <span className="text-xs text-emerald-400 mt-1 block">Active SaaS tenants</span>
        </div>

        <div className="bg-[#0b140e] border border-[#1b3320] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Controlled Pilots</span>
          <div className="text-3xl font-bold text-emerald-400 mt-2">{totalPilots}</div>
          <span className="text-xs text-[#8ca893] mt-1 block">Active field trials</span>
        </div>

        <div className="bg-[#0b140e] border border-[#1b3320] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Connected Devices</span>
          <div className="text-3xl font-bold text-white mt-2">{totalDevices}</div>
          <span className="text-xs text-[#8ca893] mt-1 block">Probes, RTK, controllers</span>
        </div>

        <div className="bg-[#0b140e] border border-[#1b3320] rounded-xl p-5">
          <span className="text-xs text-[#718d78] uppercase font-semibold block">Total Platform Users</span>
          <div className="text-3xl font-bold text-white mt-2">{totalUsers}</div>
          <span className="text-xs text-[#8ca893] mt-1 block">Operators, agronomists, admins</span>
        </div>
      </div>

      {/* Tenant Organizations Table */}
      <div className="bg-[#0b140e] border border-[#1b3320] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Managed Customer Organizations
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1b3320] text-[#8ca893] uppercase font-semibold">
                <th className="py-3 px-3">Organization</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Farms / Fields</th>
                <th className="py-3 px-3">Devices</th>
                <th className="py-3 px-3">Pilots</th>
                <th className="py-3 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132217]">
              {orgs.map((o) => (
                <tr key={o.id} className="hover:bg-[#0f1d13]/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{o.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#122316] text-emerald-300 font-mono text-[10px]">
                      {o.organizationType}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
                      {o.plan}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#9cb2a3]">
                    {o._count.farms} farms ({o._count.fields} fields)
                  </td>
                  <td className="py-3 px-3 text-[#9cb2a3]">{o._count.devices}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-400">{o._count.pilotProjects}</td>
                  <td className="py-3 px-3 text-[#718d78]">{o.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
