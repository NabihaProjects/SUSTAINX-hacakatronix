'use client';

import React, { useState } from 'react';

interface InventoryDevice {
  id: string;
  deviceCode: string;
  name: string;
  deviceType: string;
  farmName: string;
  gridCode: string;
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'OFFLINE';
  firmware: string;
  lastSeen: string;
  healthScore: number;
  batteryPct: number;
  connection: string;
}

const FLEET_DEVICES: InventoryDevice[] = [
  {
    id: 'D1',
    deviceCode: 'NODE-047',
    name: 'Multi-Depth Soil Probe #47',
    deviceType: 'SOIL_SENSOR',
    farmName: 'Green Valley Farm',
    gridCode: 'F01-G001',
    status: 'ONLINE',
    firmware: 'v1.2.0',
    lastSeen: '12 sec ago',
    healthScore: 98,
    batteryPct: 94,
    connection: 'LoRaWAN 868MHz',
  },
  {
    id: 'D2',
    deviceCode: 'NODE-048',
    name: 'Topsoil Moisture Sensor #48',
    deviceType: 'SOIL_SENSOR',
    farmName: 'Green Valley Farm',
    gridCode: 'F01-G002',
    status: 'ONLINE',
    firmware: 'v1.2.0',
    lastSeen: '45 sec ago',
    healthScore: 96,
    batteryPct: 88,
    connection: 'LoRaWAN 868MHz',
  },
  {
    id: 'D3',
    deviceCode: 'RTK-01',
    name: 'Centimeter RTK-GNSS Receiver',
    deviceType: 'RTK_GNSS',
    farmName: 'Green Valley Farm',
    gridCode: 'SPRAYER-01',
    status: 'ONLINE',
    firmware: 'v2.0.4',
    lastSeen: '1 sec ago',
    healthScore: 99,
    batteryPct: 100,
    connection: 'CAN-bus / RS-232',
  },
  {
    id: 'D4',
    deviceCode: 'FLOW-01',
    name: 'Electromagnetic Flow Totalizer',
    deviceType: 'FLOW_METER',
    farmName: 'Green Valley Farm',
    gridCode: 'SPRAYER-01',
    status: 'ONLINE',
    firmware: 'v1.1.4',
    lastSeen: '1 sec ago',
    healthScore: 97,
    batteryPct: 100,
    connection: 'ISOBUS Pulse',
  },
  {
    id: 'D5',
    deviceCode: 'TANK-01',
    name: 'Hydrostatic Chemical Tank Sensor',
    deviceType: 'TANK_SENSOR',
    farmName: 'Green Valley Farm',
    gridCode: 'SPRAYER-01',
    status: 'ONLINE',
    firmware: 'v1.0.8',
    lastSeen: '5 sec ago',
    healthScore: 95,
    batteryPct: 100,
    connection: '4-20mA Analog',
  },
  {
    id: 'D6',
    deviceCode: 'EDGE-GW-01',
    name: 'Machine Edge Controller Gateway',
    deviceType: 'EDGE_GATEWAY',
    farmName: 'Green Valley Farm',
    gridCode: 'SPRAYER-01',
    status: 'ONLINE',
    firmware: 'v1.2.0',
    lastSeen: '1 sec ago',
    healthScore: 100,
    batteryPct: 100,
    connection: 'MQTTs / Cellular LTE',
  },
];

export default function DeviceInventoryPage() {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered =
    typeFilter === 'ALL'
      ? FLEET_DEVICES
      : FLEET_DEVICES.filter((d) => d.deviceType === typeFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Hardware Fleet Inventory
            </span>
            <h1 className="text-2xl font-black text-white mt-1">SaaS Connected Device Fleet</h1>
            <p className="text-xs text-slate-400 mt-1">
              Active inventory of field sensors, RTK receivers, flow meters, and machine controllers.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <a
              href="/settings/devices/provision"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 font-bold text-white shadow"
            >
              + Provision Device
            </a>
            <a
              href="/devices/diagnostics"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
            >
              Diagnostics &rarr;
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['ALL', 'SOIL_SENSOR', 'RTK_GNSS', 'FLOW_METER', 'TANK_SENSOR', 'EDGE_GATEWAY'].map(
            (t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                  typeFilter === t
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>

        {/* Device Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Device Code</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Assigned Target</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Connection</th>
                <th className="p-3.5">Battery</th>
                <th className="p-3.5">Health</th>
                <th className="p-3.5">Firmware</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono font-bold text-emerald-400">{d.deviceCode}</td>
                  <td className="p-3.5 font-semibold text-white">{d.name}</td>
                  <td className="p-3.5">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      {d.deviceType}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{d.gridCode}</td>
                  <td className="p-3.5">
                    <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{d.connection}</td>
                  <td className="p-3.5 text-slate-300 font-mono">{d.batteryPct}%</td>
                  <td className="p-3.5 font-bold text-emerald-400">{d.healthScore}/100</td>
                  <td className="p-3.5 text-slate-400 font-mono">{d.firmware}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
