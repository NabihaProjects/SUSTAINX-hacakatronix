'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Bell, UserCheck, ShieldAlert, Cpu } from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
    organizationName: string;
  };
}

export function Header({ user }: HeaderProps) {
  const currentOrg = user?.organizationName || 'Green Valley Agriculture';
  const userName = user?.name || 'Rajdeep Mukherjee';
  const userRole = user?.role || 'OWNER';

  return (
    <header className="h-16 bg-[#0c160f] border-b border-[#1e3324] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Organization Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#122016] border border-[#203626] text-xs font-medium text-emerald-200">
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentOrg}</span>
          <span className="text-[10px] text-emerald-400/70 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
            ENTERPRISE
          </span>
        </div>

        {/* Real-time Hardware Abstraction Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#76937e] bg-[#111e15] px-2.5 py-1 rounded-md border border-[#1d3123]">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>MQTT Sim: 2 Active Nodes</span>
        </div>
      </div>

      {/* Right Controls: Alerts & Profile */}
      <div className="flex items-center gap-4">
        {/* Monitoring link */}
        <Link
          href="/monitoring"
          className="hidden md:flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2.5 py-1 rounded-md hover:bg-amber-900/40 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Closed-Loop Lab</span>
        </Link>

        <button
          title="Notifications"
          className="p-2 rounded-lg text-[#76937e] hover:text-white hover:bg-[#152419] transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
        </button>

        {/* User Role Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#1e3324]">
          <div className="w-7 h-7 rounded-full bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center text-xs font-semibold text-emerald-100 font-mono">
            {userName.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-emerald-100 flex items-center gap-1.5">
              <span>{userName}</span>
              <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                {userRole}
              </span>
            </div>
            <div className="text-[10px] text-[#63806a]">{user?.email || 'admin@soiliq.ag'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
