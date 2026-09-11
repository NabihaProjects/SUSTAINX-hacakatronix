'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FarmMap, MapGridItem, MapBoundaryItem, MapSprayerItem, MapTrailItem } from '@/components/map/FarmMap';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  SkipForward,
  AlertTriangle,
  Octagon,
  ShieldCheck,
  Zap,
  Droplets,
  Gauge,
  Compass,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function SprayerSimulationPage() {
  const [simulationState, setSimulationState] = useState<any>(null);
  const [mapGrids, setMapGrids] = useState<MapGridItem[]>([]);
  const [mapFields, setMapFields] = useState<MapBoundaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [demoActive, setDemoActive] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  // Poll simulation state
  const fetchState = async (step = false) => {
    try {
      const res = await fetch(`/api/simulation/sprayer/state${step ? '?step=true' : ''}`);
      const data = await res.json();
      if (data.state) {
        setSimulationState(data.state);
        setIsRunning(data.state.status === 'RUNNING');
      }
    } catch (err) {
      console.error('Failed to fetch simulation state:', err);
    }
  };

  // Initial load of farm/grid geometries and simulation state
  useEffect(() => {
    async function loadData() {
      try {
        const farmRes = await fetch('/api/farms');
        const farmData = await farmRes.json();
        if (farmData.farms && farmData.farms.length > 0) {
          const farm = farmData.farms[0];
          const fullRes = await fetch(`/api/farms/${farm.id}`);
          const fullData = await fullRes.json();
          if (fullData.farm?.fields) {
            setMapFields(
              fullData.farm.fields.map((f: any) => ({
                id: f.id,
                name: f.name,
                boundaryGeoJson: f.boundaryGeoJson,
              }))
            );
            const allGrids = fullData.farm.fields.flatMap((f: any) =>
              f.grids.map((g: any) => ({
                id: g.id,
                gridCode: g.gridCode,
                fieldName: f.name,
                fieldId: f.id,
                status: g.status,
                calculatedArea: g.calculatedArea,
                geometryGeoJson: g.geometryGeoJson,
                nutrientBudget: g.nutrientBudget,
              }))
            );
            setMapGrids(allGrids);
          }
        }
        await fetchState();
      } catch (e) {
        console.error('Error loading initial data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Interval loop for running simulation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      const intervalMs = Math.max(250, 1000 / speedMultiplier);
      timer = setInterval(() => {
        fetchState(true);
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, speedMultiplier]);

  const handleControlAction = async (action: string, multiplier?: number) => {
    try {
      const res = await fetch('/api/simulation/sprayer/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, multiplier }),
      });
      const data = await res.json();
      if (data.state) {
        setSimulationState(data.state);
        setIsRunning(data.state.status === 'RUNNING');
        if (multiplier) setSpeedMultiplier(multiplier);
      }
    } catch (err) {
      console.error('Failed control action:', err);
    }
  };

  const handleFaultInjection = async (faultType: string) => {
    try {
      const res = await fetch('/api/simulation/sprayer/fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faultType }),
      });
      const data = await res.json();
      if (data.state) {
        setSimulationState(data.state);
      }
    } catch (err) {
      console.error('Fault injection error:', err);
    }
  };

  const handleEmergencyStop = async (latched: boolean) => {
    try {
      const res = await fetch('/api/simulation/sprayer/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyStop: latched }),
      });
      const data = await res.json();
      if (data.state) {
        setSimulationState(data.state);
      }
    } catch (err) {
      console.error('Emergency stop error:', err);
    }
  };

  const handleManualOverride = async (active: boolean) => {
    try {
      const res = await fetch('/api/simulation/sprayer/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualOverride: active, forcedRate: 50.0 }),
      });
      const data = await res.json();
      if (data.state) {
        setSimulationState(data.state);
      }
    } catch (err) {
      console.error('Manual override error:', err);
    }
  };

  const handleRunDemo = async () => {
    setDemoActive(true);
    try {
      const res = await fetch('/api/simulation/sprayer/demo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDemoMessage('SOIL IQ Demonstration Active: Running automated multi-grid test sequence.');
        setSimulationState(data.state);
        setIsRunning(true);
        setSpeedMultiplier(2);
      }
    } catch (err) {
      console.error('Demo error:', err);
    }
  };

  // Convert sprayer state into MapSprayerItem for FarmMap
  const sprayerMarkers: MapSprayerItem[] = simulationState
    ? [
        {
          id: simulationState.sprayerId,
          name: simulationState.sprayerName,
          model: 'John Deere 412R (Simulated)',
          latitude: simulationState.latitude,
          longitude: simulationState.longitude,
          status: simulationState.currentDecision,
          applicationRate: simulationState.actualRateKgHa,
          currentGridCode: simulationState.currentGridCode,
          headingDeg: simulationState.headingDeg,
          decision: simulationState.currentDecision,
        },
      ]
    : [];

  const trailPoints: MapTrailItem[] = simulationState?.trail || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header with Demo Runner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1a12] border border-[#1e3324] p-5 rounded-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                SIMULATION MODE
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Smart Sprayer Control Center</h1>
            </div>
            <p className="text-sm text-[#8ca893] mt-1">
              Autonomous RTK-guided spatial variable-rate application & closed-loop safety telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunDemo}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              RUN SOIL IQ DEMO
            </button>
          </div>
        </div>

        {/* Demo Notification Banner */}
        {demoMessage && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>{demoMessage}</span>
            </div>
            <button onClick={() => setDemoMessage(null)} className="text-emerald-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Real-time Status Card & Closed-Loop Control Decision */}
        {simulationState && (
          <div
            className={`p-6 rounded-2xl border transition-all duration-300 shadow-xl ${
              simulationState.currentDecision === 'STOP'
                ? 'bg-red-950/40 border-red-500/40 shadow-red-950/20'
                : simulationState.currentDecision === 'REDUCE'
                ? 'bg-amber-950/40 border-amber-500/40 shadow-amber-950/20'
                : simulationState.currentDecision === 'MANUAL_OVERRIDE'
                ? 'bg-purple-950/40 border-purple-500/40 shadow-purple-950/20'
                : 'bg-emerald-950/30 border-emerald-500/30 shadow-emerald-950/20'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#8ca893]">
                    Closed-Loop Decision
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full animate-ping ${
                        simulationState.currentDecision === 'STOP'
                          ? 'bg-red-500'
                          : simulationState.currentDecision === 'REDUCE'
                          ? 'bg-amber-500'
                          : simulationState.currentDecision === 'MANUAL_OVERRIDE'
                          ? 'bg-purple-500'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-xs text-[#8ca893]">Live Evaluation</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-4">
                  <h2
                    className={`text-4xl font-extrabold tracking-tight ${
                      simulationState.currentDecision === 'STOP'
                        ? 'text-red-400'
                        : simulationState.currentDecision === 'REDUCE'
                        ? 'text-amber-400'
                        : simulationState.currentDecision === 'MANUAL_OVERRIDE'
                        ? 'text-purple-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {simulationState.currentDecision}
                  </h2>
                  <span className="text-sm font-medium text-slate-300">
                    Valve Duty Cycle: <strong className="text-white">{simulationState.valveDutyCyclePct}%</strong> ({simulationState.valveState})
                  </span>
                </div>

                <p className="text-sm text-slate-300 font-medium max-w-3xl">
                  {simulationState.decisionReason}
                </p>
              </div>

              {/* Quick Actions & E-Stop */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleManualOverride(!simulationState.isManualOverride)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                    simulationState.isManualOverride
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-900/40'
                      : 'bg-[#18281d] text-[#8ca893] border-[#25422d] hover:text-white'
                  }`}
                >
                  {simulationState.isManualOverride ? 'RELEASE OVERRIDE' : 'MANUAL OVERRIDE'}
                </button>

                <button
                  onClick={() => handleEmergencyStop(!simulationState.isEmergencyStopped)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl border transition-all ${
                    simulationState.isEmergencyStopped
                      ? 'bg-red-600 text-white border-red-400 animate-pulse'
                      : 'bg-red-950/60 text-red-300 border-red-800/60 hover:bg-red-900/80 hover:text-white'
                  }`}
                >
                  <Octagon className="w-4 h-4" />
                  {simulationState.isEmergencyStopped ? 'RESET E-STOP' : 'EMERGENCY STOP'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Telemetry HUD Cards */}
        {simulationState && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#0e1a12] border border-[#1e3324] p-3.5 rounded-xl">
              <span className="text-xs text-[#8ca893] block">Target Rate</span>
              <div className="text-xl font-bold text-white mt-1">
                {simulationState.targetRateKgHa} <span className="text-xs font-normal text-[#8ca893]">kg/ha</span>
              </div>
              <span className="text-[11px] text-[#8ca893]">Prescription demand</span>
            </div>

            <div className="bg-[#0e1a12] border border-[#1e3324] p-3.5 rounded-xl">
              <span className="text-xs text-[#8ca893] block">Actual Rate</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {simulationState.actualRateKgHa} <span className="text-xs font-normal text-[#8ca893]">kg/ha</span>
              </div>
              <span className="text-[11px] text-[#8ca893]">
                Variance: {simulationState.variancePct > 0 ? `+${simulationState.variancePct}%` : `${simulationState.variancePct}%`}
              </span>
            </div>

            <div className="bg-[#0e1a12] border border-[#1e3324] p-3.5 rounded-xl">
              <span className="text-xs text-[#8ca893] block">Flow Rate</span>
              <div className="text-xl font-bold text-teal-400 mt-1">
                {simulationState.flowRateLpm} <span className="text-xs font-normal text-[#8ca893]">L/min</span>
              </div>
              <span className="text-[11px] text-[#8ca893]">Mass: {simulationState.flowRateKgMin} kg/min</span>
            </div>

            <div className="bg-[#0e1a12] border border-[#1e3324] p-3.5 rounded-xl">
              <span className="text-xs text-[#8ca893] block">Tank Level</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {simulationState.tankLevelPct}%
              </div>
              <span className="text-[11px] text-[#8ca893]">{simulationState.tankLevelLiters.toFixed(0)} / 4500 L</span>
            </div>

            <div className="bg-[#0e1a12] border border-[#1e3324] p-3.5 rounded-xl">
              <span className="text-xs text-[#8ca893] block">Speed & Heading</span>
              <div className="text-xl font-bold text-white mt-1">
                {simulationState.speedKmh} <span className="text-xs font-normal text-[#8ca893]">km/h</span>
              </div>
              <span className="text-[11px] text-[#8ca893]">Heading: {simulationState.headingDeg}°</span>
            </div>

            <div className="bg-[#0e1a12] border border-[#1e3324] p-3.5 rounded-xl">
              <span className="text-xs text-[#8ca893] block">Current Grid</span>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {simulationState.currentGridCode || 'OUTSIDE'}
              </div>
              <span className="text-[11px] text-[#8ca893]">
                {simulationState.insideField ? 'Inside Field Boundary' : 'OUTSIDE FIELD'}
              </span>
            </div>
          </div>
        )}

        {/* Interactive Map & Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map Canvas (3 cols) */}
          <div className="lg:col-span-3 bg-[#0e1a12] border border-[#1e3324] rounded-2xl overflow-hidden relative">
            <div className="p-4 border-b border-[#1e3324] flex items-center justify-between bg-[#112016]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Spatial Telemetry & Swath Application Trail</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#8ca893]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> CONTINUE
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> REDUCE
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> STOP
                </span>
              </div>
            </div>

            <FarmMap
              grids={mapGrids}
              fields={mapFields}
              sprayers={sprayerMarkers}
              applicationTrail={trailPoints}
              activeGridCode={simulationState?.currentGridCode}
              height="540px"
            />
          </div>

          {/* Real-Time Operational Event Timeline (1 col) */}
          <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-4 flex flex-col h-[590px]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3324]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Event Timeline</h3>
              </div>
              <span className="text-[11px] text-[#8ca893]">
                {simulationState?.timeline?.length || 0} events
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1 text-xs">
              {simulationState?.timeline?.slice(-15).reverse().map((ev: any) => (
                <div
                  key={ev.id}
                  className={`p-2.5 rounded-xl border ${
                    ev.severity === 'CRITICAL'
                      ? 'bg-red-950/30 border-red-800/40 text-red-200'
                      : ev.severity === 'WARNING'
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      : 'bg-[#142318] border-[#1e3324] text-[#8ca893]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                    <span>{ev.time}</span>
                    <span className="font-bold">{ev.type}</span>
                  </div>
                  <p className="text-slate-200 font-medium">{ev.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation Clock & Fault Injection Console */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clock Controls */}
          <div className="bg-[#0e1a12] border border-[#1e3324] p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Simulation Clock Controls
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {isRunning ? (
                <button
                  onClick={() => handleControlAction('pause')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  <Pause className="w-4 h-4" /> PAUSE
                </button>
              ) : (
                <button
                  onClick={() => handleControlAction('start')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  <Play className="w-4 h-4" /> RUN CLOCK
                </button>
              )}

              <button
                onClick={() => handleControlAction('step')}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#18281d] text-[#8ca893] hover:text-white border border-[#25422d] text-xs font-bold rounded-xl transition-all"
              >
                <SkipForward className="w-4 h-4" /> SINGLE STEP
              </button>

              <button
                onClick={() => handleControlAction('reset')}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#18281d] text-[#8ca893] hover:text-white border border-[#25422d] text-xs font-bold rounded-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" /> RESET
              </button>

              <div className="flex items-center gap-1 bg-[#142318] p-1 rounded-xl border border-[#1e3324]">
                {[1, 2, 5, 10, 20].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleControlAction('set-speed', m)}
                    className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                      speedMultiplier === m
                        ? 'bg-emerald-600 text-white'
                        : 'text-[#8ca893] hover:text-white'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#8ca893] flex items-center gap-4">
              <span>Step: {simulationState?.currentStepIndex || 0} / {simulationState?.totalWaypoints || 0}</span>
              <span>Distance: {simulationState?.totalDistanceMeters || 0} m</span>
              <span>Applied: {simulationState?.totalAppliedKg || 0} kg</span>
            </div>
          </div>

          {/* Fault Injection Console */}
          <div className="bg-[#0e1a12] border border-[#1e3324] p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Operational Fault Injections
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleFaultInjection('empty_tank')}
                className="p-2.5 bg-[#142318] hover:bg-red-950/40 border border-[#1e3324] hover:border-red-500/40 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-red-300 transition-all"
              >
                <Droplets className="w-4 h-4 mb-1 text-cyan-400" />
                Empty Tank (0 L)
              </button>

              <button
                onClick={() => handleFaultInjection('outside_field')}
                className="p-2.5 bg-[#142318] hover:bg-red-950/40 border border-[#1e3324] hover:border-red-500/40 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-red-300 transition-all"
              >
                <Compass className="w-4 h-4 mb-1 text-amber-400" />
                Drive Outside Field
              </button>

              <button
                onClick={() => handleFaultInjection('no_prescription')}
                className="p-2.5 bg-[#142318] hover:bg-red-950/40 border border-[#1e3324] hover:border-red-500/40 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-red-300 transition-all"
              >
                <XCircle className="w-4 h-4 mb-1 text-red-400" />
                No Prescription Grid
              </button>

              <button
                onClick={() => handleFaultInjection('rain_lockout')}
                className="p-2.5 bg-[#142318] hover:bg-red-950/40 border border-[#1e3324] hover:border-red-500/40 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-red-300 transition-all"
              >
                <AlertTriangle className="w-4 h-4 mb-1 text-amber-400" />
                Weather Storm Lockout
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
