'use client';

import React, { useState } from 'react';

type NotificationPref = 'CRITICAL_ONLY' | 'CRITICAL_AND_WARNING' | 'ALL' | 'NONE';

export default function MobileProfilePage() {
  const [pref, setPref] = useState<NotificationPref>('CRITICAL_AND_WARNING');
  const [syncStatus, setSyncStatus] = useState<string>('All 4 field records synchronized');
  const [syncing, setSyncing] = useState<boolean>(false);

  const handleSyncNow = () => {
    setSyncing(true);
    setSyncStatus('Connecting to cloud broker...');
    setTimeout(() => {
      setSyncing(false);
      setSyncStatus('Synchronized successfully at ' + new Date().toLocaleTimeString());
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 p-4 space-y-4 max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h1 className="text-base font-black text-white">Operator Profile & Settings</h1>
        <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 text-xs font-bold">
          OPERATOR
        </span>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-emerald-700/40 border border-emerald-500/60 flex items-center justify-center text-xl font-black text-emerald-300">
          RS
        </div>
        <div className="flex-1">
          <div className="text-base font-extrabold text-white">Rajdeep Singh</div>
          <div className="text-xs text-slate-400">Green Valley Organics &bull; Field Operations</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Role: Certified Field Operator</div>
        </div>
      </div>

      {/* Push Notification Preferences */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-400">Push Notification Foundation</span>
          <h2 className="text-sm font-bold text-white mt-0.5">Field Notification Preferences</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Configure how urgent field stops, weather lockouts, and sensor alarms alert your mobile device.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { id: 'CRITICAL_ONLY', label: 'Critical Only', desc: 'Emergency stops, riparian lockouts, tank empty' },
            { id: 'CRITICAL_AND_WARNING', label: 'Critical & Warnings (Recommended)', desc: 'Plus budget caution limits and sensor disconnects' },
            { id: 'ALL', label: 'All Notifications', desc: 'Includes prescription updates and normal grid transitions' },
            { id: 'NONE', label: 'Mute All', desc: 'Check alerts manually in the alert inbox' },
          ].map((item) => (
            <label
              key={item.id}
              className={`block rounded-xl p-3 border cursor-pointer transition ${
                pref === item.id
                  ? 'border-emerald-500 bg-emerald-950/30'
                  : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="notif_pref"
                  checked={pref === item.id}
                  onChange={() => setPref(item.id as NotificationPref)}
                  className="accent-emerald-500"
                />
                <span className="font-bold text-white text-xs">{item.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 pl-5 mt-0.5">{item.desc}</p>
            </label>
          ))}
        </div>
      </div>

      {/* Offline Cache & Synchronization */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-400">Offline Resilience</span>
          <h2 className="text-sm font-bold text-white mt-0.5">Storage & Cloud Sync</h2>
          <div className="text-[11px] text-slate-300 font-mono mt-1">
            Status: <span className="text-emerald-400">{syncStatus}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-2.5 text-xs font-bold text-slate-950"
          >
            {syncing ? 'Synchronizing...' : '🔄 Manual Sync Now'}
          </button>
          <button
            onClick={() => alert('Local cache cleared. Fresh data will reload on next connection.')}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-300 border border-slate-700"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Role Matrix Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400 space-y-1">
        <div className="font-bold text-slate-200">Role Capabilities:</div>
        <p>
          <strong className="text-emerald-300">OPERATOR: </strong> Live field monitoring, alert acknowledgement, offline field notes, and assigned task resolution. Desktop management controls are reserved for Farm Managers and Admins.
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 py-2 px-4 backdrop-blur flex justify-around text-center text-xs">
        <a href="/mobile" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🏠</span>
          <span className="text-[10px]">Home</span>
        </a>
        <a href="/mobile/map" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🗺️</span>
          <span className="text-[10px]">Map</span>
        </a>
        <a href="/mobile/monitoring" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🚜</span>
          <span className="text-[10px]">Sprayer</span>
        </a>
        <a href="/mobile/alerts" className="text-slate-400 hover:text-slate-200 flex flex-col items-center">
          <span className="text-base">🔔</span>
          <span className="text-[10px]">Alerts</span>
        </a>
        <a href="/mobile/profile" className="text-emerald-400 font-bold flex flex-col items-center">
          <span className="text-base">⚙️</span>
          <span className="text-[10px]">Profile</span>
        </a>
      </nav>
    </div>
  );
}
