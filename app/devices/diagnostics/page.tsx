'use client';

import React, { useState } from 'react';

export default function HardwareDiagnosticsPage() {
  const [rtkFix, setRtkFix] = useState<'RTK_FIXED' | 'RTK_FLOAT' | 'NO_FIX'>('RTK_FIXED');
  const [accuracyCm, setAccuracyCm] = useState<number>(2.1);
  const [flowLpm, setFlowLpm] = useState<number>(12.4);
  const [tankPct, setTankPct] = useState<number>(68);
  const [gatewayStatus, setGatewayStatus] = useState<'CONNECTED' | 'OFFLINE'>('CONNECTED');
  const [mqttStatus, setMqttStatus] = useState<'CONNECTED' | 'RECONNECTING'>('CONNECTED');

  const simulateAnomaly = () => {
    setRtkFix('NO_FIX');
    setAccuracyCm(999);
    setFlowLpm(0);
  };

  const simulateNormal = () => {
    setRtkFix('RTK_FIXED');
    setAccuracyCm(2.1);
    setFlowLpm(12.4);
    setTankPct(68);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Industrial Field Telemetry Console
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Hardware Diagnostics & Live telemetry</h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time hardware status of RTK-GNSS receivers, electromagnetic flow meters, tank sensors, and edge gateways.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={simulateAnomaly}
              className="rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 px-3 py-1.5 font-bold text-rose-300"
            >
              Simulate GNSS Loss
            </button>
            <button
              onClick={simulateNormal}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 font-bold text-white shadow"
            >
              Restore RTK Fixed
            </button>
            <a
              href="/devices/inventory"
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-slate-200 border border-slate-700"
            >
              Fleet Inventory &rarr;
            </a>
          </div>
        </div>

        {/* Diagnostic Meters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* RTK-GNSS Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">RTK-GNSS Receiver</span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  rtkFix === 'RTK_FIXED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                {rtkFix}
              </span>
            </div>
            <div className="text-2xl font-black text-white">{accuracyCm} cm</div>
            <div className="text-slate-400">Horizontal Accuracy CEP</div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              Satellites: <strong className="text-white">18 in view</strong> &bull; Constellations: GPS + Galileo + BeiDou
            </div>
          </div>

          {/* Flow Meter Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">Flow Meter</span>
              <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                ONLINE
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400">{flowLpm} L/min</div>
            <div className="text-slate-400">Instantaneous Flow Rate</div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              Totalizer: <strong className="text-white">142.6 Liters</strong> &bull; Pressure: 3.2 bar
            </div>
          </div>

          {/* Tank Sensor Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">Chemical Tank</span>
              <span className="rounded bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                HEALTHY
              </span>
            </div>
            <div className="text-2xl font-black text-white">{tankPct}%</div>
            <div className="text-slate-400">408 Liters Remaining (600L cap)</div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              Threshold: <strong className="text-emerald-400">NORMAL</strong> &bull; Sensor: Hydrostatic probe
            </div>
          </div>

          {/* Edge Gateway Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300">Edge Gateway</span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  gatewayStatus === 'CONNECTED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                {gatewayStatus}
              </span>
            </div>
            <div className="text-2xl font-black text-white">v1.2.0</div>
            <div className="text-slate-400">Firmware: COMPATIBLE</div>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              MQTT Broker: <strong className="text-emerald-400">{mqttStatus}</strong> (24ms latency)
            </div>
          </div>
        </div>

        {/* Diagnostic Event Stream */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Live Hardware Packet Ingestion Stream (Protobuf/JSON)
          </h2>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto max-h-64 overflow-y-auto">
            <div className="text-slate-500">[{new Date().toLocaleTimeString()}] MQTT SUB: soil-iq/org_demo/devices/FLOW-01/telemetry &bull; flowRate=12.4, pulseCount=488</div>
            <div className="text-emerald-400">[{new Date().toLocaleTimeString()}] INGEST: RTK position resolved &bull; lat=17.1234, lon=80.4567, fix=RTK_FIXED, acc=0.021m</div>
            <div className="text-slate-300">[{new Date().toLocaleTimeString()}] CONTROL: Grid F01-G001 prescription matched &bull; targetRate=42.0 kg/ha &bull; Decision=CONTINUE</div>
            <div className="text-slate-500">[{new Date().toLocaleTimeString()}] TOTALIZER: Discrete slice integrated &bull; +0.207 L added &bull; sessionTotal=142.6 L</div>
          </div>
        </div>
      </div>
    </div>
  );
}
