'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FarmMap } from '@/components/map/FarmMap';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Radar,
  Truck,
  Play,
  Pause,
  AlertOctagon,
  ShieldCheck,
  Zap,
  Gauge,
  Droplet,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';

interface MonitoringConsoleProps {
  sprayers: any[];
  grids: any[];
  fields: any[];
}

export function MonitoringConsole({
  sprayers,
  grids,
  fields,
}: MonitoringConsoleProps) {
  const [selectedSprayerId, setSelectedSprayerId] = useState(sprayers[0]?.id || '');
  const [currentLat, setCurrentLat] = useState(sprayers[0]?.latitude || 41.5876);
  const [currentLon, setCurrentLon] = useState(sprayers[0]?.longitude || -93.6238);
  const [speed, setSpeed] = useState(14.2);
  const [flowRate, setFlowRate] = useState(46.5);
  const [applicationRate, setApplicationRate] = useState(42.0);
  const [tankLevel, setTankLevel] = useState(3450);

  const [decision, setDecision] = useState<{
    decision: 'CONTINUE' | 'REDUCE' | 'STOP' | 'MANUAL_OVERRIDE';
    reason: string;
    targetRate: number;
    actualRate: number;
    suggestedFlowRateAdjustmentPct: number;
    severity: string;
  }>({
    decision: 'CONTINUE',
    reason: 'Application rate matches prescription target within nominal +/- 10% window.',
    targetRate: 42.0,
    actualRate: 42.0,
    suggestedFlowRateAdjustmentPct: 0,
    severity: 'NORMAL',
  });

  const [activeGridCode, setActiveGridCode] = useState('F01-G001');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'System initialized. Closed-loop control pipeline armed.',
    'Telemetry stream online via device abstraction.',
  ]);

  const [isTransmitting, setIsTransmitting] = useState(false);

  // Send Telemetry to backend
  const sendTelemetry = async (
    lat: number,
    lon: number,
    rate: number,
    spd: number,
    flow: number
  ) => {
    setIsTransmitting(true);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprayerId: selectedSprayerId,
          latitude: lat,
          longitude: lon,
          speedKmh: spd,
          flowRateLpm: flow,
          tankLevelLiters: tankLevel,
          applicationRateLpha: rate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDecision(data.controlDecision);
        if (data.currentGridCode) setActiveGridCode(data.currentGridCode);

        const logEntry = `[${new Date().toLocaleTimeString()}] Loc: (${lat.toFixed(4)}, ${lon.toFixed(4)}) | Grid: ${data.currentGridCode || 'N/A'} | Rate: ${rate} L/ha | Decision: ${data.controlDecision.decision}`;
        setTelemetryLogs((prev) => [logEntry, ...prev.slice(0, 15)]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTransmitting(false);
    }
  };

  // Preset Simulation Triggers
  const triggerNormalPass = () => {
    const newLat = 41.5876;
    const newLon = -93.6238;
    setCurrentLat(newLat);
    setCurrentLon(newLon);
    setApplicationRate(42.0);
    setFlowRate(46.0);
    sendTelemetry(newLat, newLon, 42.0, speed, 46.0);
  };

  const triggerOverDosingTest = () => {
    // Artificial 35% over-dosing rate -> Triggers REDUCE decision!
    const newLat = 41.5882;
    const newLon = -93.6235;
    setCurrentLat(newLat);
    setCurrentLon(newLon);
    setApplicationRate(58.5);
    setFlowRate(62.0);
    sendTelemetry(newLat, newLon, 58.5, speed, 62.0);
  };

  const triggerBlockedGridTest = () => {
    // Moves coordinates into the riparian BLOCKED grid -> Triggers immediate hard STOP!
    const newLat = 41.5913;
    const newLon = -93.6245;
    setCurrentLat(newLat);
    setCurrentLon(newLon);
    setApplicationRate(42.0);
    sendTelemetry(newLat, newLon, 42.0, speed, flowRate);
  };

  const mapSprayers = [
    {
      id: selectedSprayerId,
      name: 'Alpha-Spray 01',
      model: 'John Deere 412R',
      latitude: currentLat,
      longitude: currentLon,
      status: 'ONLINE',
      applicationRate,
      currentGridCode: activeGridCode,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Live Closed-Loop Telemetry & Control Lab
            </h1>
            <span className="text-[11px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-medium animate-pulse">
              LIVE SIMULATOR
            </span>
          </div>
          <p className="text-xs text-[#8ca893] mt-1">
            SENSE → LOCATE → CALCULATE → APPLY → MEASURE → COMPARE → CONTROL → LEARN
          </p>
        </div>

        <Link
          href="/simulation/sprayer"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-200" />
          <span>Open Sprayer Simulator Cockpit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Real-time Closed-Loop Decision Hero Card */}
      <div
        className={`p-6 rounded-2xl border transition-all shadow-xl ${
          decision.decision === 'CONTINUE'
            ? 'bg-emerald-950/40 border-emerald-700/80 shadow-emerald-950/40'
            : decision.decision === 'REDUCE'
            ? 'bg-amber-950/50 border-amber-600 shadow-amber-950/40'
            : 'bg-rose-950/50 border-rose-600 shadow-rose-950/40'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                decision.decision === 'CONTINUE'
                  ? 'bg-emerald-600 shadow-emerald-900'
                  : decision.decision === 'REDUCE'
                  ? 'bg-amber-600 shadow-amber-900 animate-bounce'
                  : 'bg-rose-600 shadow-rose-900 animate-pulse'
              }`}
            >
              {decision.decision === 'CONTINUE' && <ShieldCheck className="w-8 h-8" />}
              {decision.decision === 'REDUCE' && <Gauge className="w-8 h-8" />}
              {decision.decision === 'STOP' && <AlertOctagon className="w-8 h-8" />}
            </div>

            <div>
              <div className="text-[11px] uppercase font-mono tracking-widest text-[#9cb2a3]">
                Real-Time Machine Control Decision
              </div>
              <div
                className={`text-3xl font-black tracking-tight font-mono ${
                  decision.decision === 'CONTINUE'
                    ? 'text-emerald-200'
                    : decision.decision === 'REDUCE'
                    ? 'text-amber-200'
                    : 'text-rose-200'
                }`}
              >
                {decision.decision}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-[#0b140e]/80 p-3 rounded-xl border border-[#1e3324] text-center min-w-[110px]">
              <span className="text-[10px] text-[#6b8571] uppercase block">Target Rate</span>
              <span className="text-white font-bold text-base">{decision.targetRate} L/ha</span>
            </div>
            <div className="bg-[#0b140e]/80 p-3 rounded-xl border border-[#1e3324] text-center min-w-[110px]">
              <span className="text-[10px] text-[#6b8571] uppercase block">Actual Flow</span>
              <span
                className={`font-bold text-base ${
                  decision.decision === 'CONTINUE'
                    ? 'text-emerald-300'
                    : decision.decision === 'REDUCE'
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }`}
              >
                {applicationRate} L/ha
              </span>
            </div>
            <div className="bg-[#0b140e]/80 p-3 rounded-xl border border-[#1e3324] text-center min-w-[110px]">
              <span className="text-[10px] text-[#6b8571] uppercase block">Valve PWM Mod</span>
              <span className="font-bold text-base text-white">
                {decision.suggestedFlowRateAdjustmentPct}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 opacity-80" />
            <span className="font-medium text-white/90 leading-relaxed">
              {decision.reason}
            </span>
          </div>
          <span className="font-mono text-[11px] text-white/60">
            Active Grid: <strong className="text-white">{activeGridCode}</strong>
          </span>
        </div>
      </div>

      {/* Control Panel & Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Telemetry Controls */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Simulated Hardware Telemetry Controls
          </h2>

          {/* Preset Test Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] text-[#76937e] uppercase font-semibold block">
              Automated Agronomic Test Scenarios:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={triggerNormalPass}
                className="w-full py-2 px-3 bg-[#132317] hover:bg-[#1a2e20] text-emerald-200 border border-emerald-900/60 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <span>1. Nominal In-Budget Pass (42 L/ha)</span>
                <span className="text-[10px] uppercase font-mono px-1.5 bg-emerald-950 text-emerald-400 rounded">
                  CONTINUE
                </span>
              </button>

              <button
                onClick={triggerOverDosingTest}
                className="w-full py-2 px-3 bg-[#1d1b11] hover:bg-[#282516] text-amber-200 border border-amber-900/60 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <span>2. Simulate Excessive Flow (58.5 L/ha)</span>
                <span className="text-[10px] uppercase font-mono px-1.5 bg-amber-950 text-amber-400 rounded">
                  REDUCE
                </span>
              </button>

              <button
                onClick={triggerBlockedGridTest}
                className="w-full py-2 px-3 bg-[#241313] hover:bg-[#331a1a] text-rose-200 border border-rose-900/60 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <span>3. Enter Riparian Blocked Grid (Lockout)</span>
                <span className="text-[10px] uppercase font-mono px-1.5 bg-rose-950 text-rose-400 rounded">
                  STOP
                </span>
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-3 border-t border-[#1e3324] text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8ca893]">Application Flow Rate</span>
                <span className="font-mono font-bold text-white">{applicationRate} L/ha</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="0.5"
                value={applicationRate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setApplicationRate(val);
                  sendTelemetry(currentLat, currentLon, val, speed, flowRate);
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#8ca893]">Ground Speed</span>
                <span className="font-mono font-bold text-white">{speed} km/h</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-[#121f15] rounded-lg border border-[#1e3324] space-y-1 text-[11px] text-[#8ca893]">
              <div>Latitude: <strong className="font-mono text-white">{currentLat.toFixed(6)}</strong></div>
              <div>Longitude: <strong className="font-mono text-white">{currentLon.toFixed(6)}</strong></div>
              <div>Connected Hardware: <strong className="text-emerald-300">John Deere 412R CAN-ISOBUS</strong></div>
            </div>
          </div>
        </div>

        {/* Right: Live Map & Telemetry Stream (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Radar className="w-4 h-4 text-emerald-400" />
                Live Machine Spatial Location
              </h2>
              <span className="text-[11px] text-[#76937e]">
                Sprayer mapping to spatial grid in real-time
              </span>
            </div>

            <FarmMap
              grids={grids}
              fields={fields}
              sprayers={mapSprayers}
              height="400px"
            />
          </div>

          {/* Telemetry Stream Log */}
          <div className="bg-[#0a120c] border border-[#1e3324] rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-semibold">
              Telemetry Ingestion Audit Log
            </span>
            <div className="font-mono text-[11px] text-[#76937e] space-y-1 max-h-36 overflow-y-auto">
              {telemetryLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
