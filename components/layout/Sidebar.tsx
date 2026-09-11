'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Radar,
  FileSpreadsheet,
  Truck,
  LineChart,
  History,
  Settings,
  Layers,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Farms & Fields', href: '/farms', icon: MapPin },
  { label: 'Live Monitoring', href: '/monitoring', icon: Radar, badge: 'LIVE' },
  { label: 'Sprayer Simulator', href: '/simulation/sprayer', icon: Zap, badge: 'SIM' },
  { label: 'Prescriptions', href: '/prescriptions', icon: FileSpreadsheet },
  { label: 'Fleet Sprayers', href: '/sprayers', icon: Truck },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
  { label: 'Activity Log', href: '/activity', icon: History },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1710] border-r border-[#1e3324] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#1e3324] gap-3 bg-[#0a120c]">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950">
          <Layers className="w-5 h-5 text-emerald-100" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
            SOIL <span className="text-emerald-400">IQ</span>
          </span>
          <span className="text-[10px] text-[#76937e] tracking-wider block uppercase font-mono">
            Precision Ag SaaS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-[#5a7461] uppercase tracking-wider">
          Platform
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-700/50 shadow-sm'
                  : 'text-[#9cb2a3] hover:text-white hover:bg-[#132217]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#718d78]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Closed Loop Status Indicator in Sidebar */}
      <div className="p-4 border-t border-[#1e3324] bg-[#0a120c]/60">
        <div className="bg-[#111e15] border border-[#203626] rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[#84a38c] font-medium">Control Engine</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SENSE→CONTROL
            </span>
          </div>
          <p className="text-[11px] text-[#63806a] leading-tight">
            Closed-loop rate comparison active on 2 sprayers.
          </p>
        </div>
      </div>
    </aside>
  );
}
