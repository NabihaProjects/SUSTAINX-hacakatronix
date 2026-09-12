'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Sparkles,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Droplets,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Clock,
  Save,
  CheckCircle2,
  RefreshCw,
  Layers,
  Zap,
} from 'lucide-react';

export default function WhatIfSimulationPage() {
  // Input parameters
  const [gridCode, setGridCode] = useState('F01-G003');
  const [scenarioType, setScenarioType] = useState('LESS_FERTILIZER');
  const [baselineProduct, setBaselineProduct] = useState('NPK 19-19-19');
  const [baselineFormulation, setBaselineFormulation] = useState('19-19-19');
  const [baselineRateKgHa, setBaselineRateKgHa] = useState(42.0);
  const [baselineRainProb, setBaselineRainProb] = useState(85);

  const [scenarioProduct, setScenarioProduct] = useState('NPK 19-19-19');
  const [scenarioFormulation, setScenarioFormulation] = useState('19-19-19');
  const [scenarioRateKgHa, setScenarioRateKgHa] = useState(30.0);
  const [scenarioDelayHours, setScenarioDelayHours] = useState(24);
  const [scenarioRainProb, setScenarioRainProb] = useState(15);
  const [costPerKg, setCostPerKg] = useState(0.65);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Run simulation
  const executeSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/intelligence/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioName: `${scenarioType === 'LESS_FERTILIZER' ? 'Target Rate Reduction' : 'Deferred Weather Window'} - Grid ${gridCode}`,
          scenarioType,
          gridCode,
          fieldAreaHa: 2.4,
          baselineProduct,
          baselineFormulation,
          baselineRateKgHa,
          baselineTimingDelayHours: 0,
          baselineRainProbPct: baselineRainProb,
          scenarioProduct,
          scenarioFormulation,
          scenarioRateKgHa,
          scenarioTimingDelayHours: scenarioDelayHours,
          scenarioRainProbPct: scenarioRainProb,
          costPerKg,
          soilN: 48.0,
          soilP: 58.0,
          soilK: 145.0,
          soilPh: 6.5,
          currentBudgetRecommendedN: 100.0,
          currentBudgetConsumedN: 60.0,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setSimulationResult(data.result);
      }
    } catch (err) {
      console.error('What-if error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Fetch saved scenarios
  const fetchSavedScenarios = async () => {
    try {
      const res = await fetch('/api/intelligence/what-if/scenarios');
      const data = await res.json();
      if (data.scenarios) setSavedScenarios(data.scenarios);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    executeSimulation();
    fetchSavedScenarios();
  }, []);

  const handleSaveScenario = async () => {
    if (!simulationResult) return;
    try {
      const res = await fetch('/api/intelligence/what-if/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: simulationResult.scenarioName,
          description: simulationResult.recommendationSummary,
          scenarioType,
          inputs: { baselineRateKgHa, scenarioRateKgHa, scenarioDelayHours },
          results: simulationResult.scenario,
          baseline: simulationResult.baseline,
          comparison: simulationResult.deltas,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchSavedScenarios();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1a12] border border-[#1e3324] p-5 rounded-2xl">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                WHAT-IF INTELLIGENCE
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">Scenario Simulation Engine</h1>
            </div>
            <p className="text-xs text-[#8ca893] mt-1">
              Compare alternative fertilizer formulations, application rates, weather delays, and projected soil health trajectories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-3 py-1 bg-[#142318] text-[#8ca893] border border-[#1e3324] rounded-lg">
              ISOLATED SIMULATION MODE
            </span>
          </div>
        </div>

        {/* Interactive Controls & Parameter Formulation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel (1 col) */}
          <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Scenario Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#8ca893] block mb-1">Target Management Grid</label>
                <select
                  value={gridCode}
                  onChange={(e) => setGridCode(e.target.value)}
                  className="w-full bg-[#142318] border border-[#1e3324] text-white p-2 rounded-xl focus:border-emerald-500 font-mono"
                >
                  <option value="F01-G001">F01-G001 (Optimal Corn)</option>
                  <option value="F01-G002">F01-G002 (Moderate N)</option>
                  <option value="F01-G003">F01-G003 (Elevated Phosphorus)</option>
                  <option value="F01-G004">F01-G004 (Riparian Buffer)</option>
                </select>
              </div>

              <div>
                <label className="text-[#8ca893] block mb-1">Scenario Hypothesis Strategy</label>
                <select
                  value={scenarioType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setScenarioType(val);
                    if (val === 'LESS_FERTILIZER') {
                      setScenarioRateKgHa(28.0);
                      setScenarioDelayHours(0);
                    } else if (val === 'WAIT_BEFORE_APPLICATION') {
                      setScenarioDelayHours(24);
                      setScenarioRainProb(10);
                    }
                  }}
                  className="w-full bg-[#142318] border border-[#1e3324] text-white p-2 rounded-xl focus:border-emerald-500"
                >
                  <option value="LESS_FERTILIZER">Reduce Application Rate (-25%)</option>
                  <option value="WAIT_BEFORE_APPLICATION">Defer Application by 24h (Rain Avoidance)</option>
                  <option value="CHANGE_FERTILIZER">Switch Formulation (Zero-P Urea)</option>
                  <option value="MORE_FERTILIZER">Intensive Yield Boost (+20%)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#1e3324] space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[#8ca893] mb-1">
                    <span>Baseline Application Rate</span>
                    <strong className="text-white font-mono">{baselineRateKgHa} kg/ha</strong>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    step="1"
                    value={baselineRateKgHa}
                    onChange={(e) => setBaselineRateKgHa(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[#8ca893] mb-1">
                    <span>Simulated Scenario Rate</span>
                    <strong className="text-purple-300 font-mono">{scenarioRateKgHa} kg/ha</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="65"
                    step="1"
                    value={scenarioRateKgHa}
                    onChange={(e) => setScenarioRateKgHa(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[#8ca893] mb-1">
                    <span>Timing Delay</span>
                    <strong className="text-white font-mono">{scenarioDelayHours} hours</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="72"
                    step="6"
                    value={scenarioDelayHours}
                    onChange={(e) => setScenarioDelayHours(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[#8ca893] mb-1">
                    <span>Scenario Rain Probability</span>
                    <strong className="text-white font-mono">{scenarioRainProb}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={scenarioRainProb}
                    onChange={(e) => setScenarioRainProb(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  onClick={executeSimulation}
                  disabled={isSimulating}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  {isSimulating ? 'Simulating...' : 'Run What-If Simulation'}
                </button>

                <button
                  onClick={handleSaveScenario}
                  className="p-2.5 bg-[#142318] hover:bg-[#18281d] border border-[#1e3324] text-slate-300 hover:text-white rounded-xl transition-all"
                  title="Save Scenario"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>

              {saveSuccess && (
                <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Scenario saved successfully!
                </div>
              )}
            </div>
          </div>

          {/* Side-by-Side Comparison Display (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {simulationResult ? (
              <>
                {/* Comparison Card Header */}
                <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-5">
                  <span className="text-xs uppercase font-bold tracking-wider text-purple-400 block mb-1">
                    Synthesis & Agronomic Recommendation
                  </span>
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">
                    {simulationResult.recommendationSummary}
                  </p>
                </div>

                {/* Side-by-Side HUD Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Baseline HUD */}
                  <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1e3324] pb-2.5">
                      <span className="text-xs font-bold text-[#8ca893] uppercase tracking-wider">
                        Baseline Plan (Current)
                      </span>
                      <span className="px-2 py-0.5 bg-[#18281d] text-slate-300 font-mono text-[10px] rounded">
                        ACTUAL / CURRENT
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Application Rate:</span>
                        <span className="font-mono font-bold text-white">
                          {simulationResult.baseline.rateKgHa} kg/ha
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Pure Elemental N-P-K:</span>
                        <span className="font-mono text-emerald-400">
                          {simulationResult.baseline.pureElementalN}N • {simulationResult.baseline.pureElementalP}P • {simulationResult.baseline.pureElementalK}K
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Budget Utilization:</span>
                        <span className="font-mono text-amber-400">
                          {simulationResult.baseline.budgetUtilizationPct}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Environmental Action:</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          simulationResult.baseline.environmentalRiskAction === 'BLOCK'
                            ? 'bg-red-950 text-red-400'
                            : simulationResult.baseline.environmentalRiskAction === 'DEFER'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {simulationResult.baseline.environmentalRiskAction}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Estimated Cost:</span>
                        <span className="font-mono text-white">${simulationResult.baseline.estimatedCost}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#8ca893]">Soil Health Index:</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {simulationResult.baseline.soilHealthIndex} / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scenario HUD */}
                  <div className="bg-[#0e1a12] border border-purple-500/40 rounded-2xl p-5 space-y-3 shadow-lg shadow-purple-950/20">
                    <div className="flex items-center justify-between border-b border-[#1e3324] pb-2.5">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Scenario Plan (What-If)
                      </span>
                      <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 font-mono text-[10px] rounded">
                        PROJECTED
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Application Rate:</span>
                        <span className="font-mono font-bold text-purple-300">
                          {simulationResult.scenario.rateKgHa} kg/ha ({simulationResult.deltas.rateDeltaPct}%)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Pure Elemental N-P-K:</span>
                        <span className="font-mono text-emerald-400">
                          {simulationResult.scenario.pureElementalN}N • {simulationResult.scenario.pureElementalP}P • {simulationResult.scenario.pureElementalK}K
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Budget Utilization:</span>
                        <span className="font-mono text-emerald-400">
                          {simulationResult.scenario.budgetUtilizationPct}% ({simulationResult.deltas.budgetUtilizationDeltaPct}%)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Environmental Action:</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          simulationResult.scenario.environmentalRiskAction === 'BLOCK'
                            ? 'bg-red-950 text-red-400'
                            : simulationResult.scenario.environmentalRiskAction === 'DEFER'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {simulationResult.scenario.environmentalRiskAction}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#18281d]">
                        <span className="text-[#8ca893]">Estimated Cost:</span>
                        <span className="font-mono text-emerald-300">
                          ${simulationResult.scenario.estimatedCost} (${simulationResult.deltas.costDeltaAmount})
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#8ca893]">Soil Health Index:</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {simulationResult.scenario.soilHealthIndex} / 100 ({simulationResult.deltas.soilHealthDelta > 0 ? `+${simulationResult.deltas.soilHealthDelta}` : simulationResult.deltas.soilHealthDelta})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delta Highlights Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-[#142318] p-3 rounded-xl border border-[#1e3324]">
                    <span className="text-[#8ca893] block">Input Rate Delta</span>
                    <strong className="text-white text-base font-mono mt-1 block">
                      {simulationResult.deltas.rateDeltaKgHa} kg/ha
                    </strong>
                    <span className="text-emerald-400 text-[11px]">{simulationResult.deltas.rateDeltaPct}% reduction</span>
                  </div>

                  <div className="bg-[#142318] p-3 rounded-xl border border-[#1e3324]">
                    <span className="text-[#8ca893] block">Financial Delta</span>
                    <strong className="text-emerald-400 text-base font-mono mt-1 block">
                      ${Math.abs(simulationResult.deltas.costDeltaAmount)}
                    </strong>
                    <span className="text-[#8ca893] text-[11px]">projected savings</span>
                  </div>

                  <div className="bg-[#142318] p-3 rounded-xl border border-[#1e3324]">
                    <span className="text-[#8ca893] block">Phosphorus Loading</span>
                    <strong className="text-teal-400 text-base font-mono mt-1 block">
                      {simulationResult.deltas.purePDeltaKg} kg
                    </strong>
                    <span className="text-[#8ca893] text-[11px]">elemental P avoided</span>
                  </div>

                  <div className="bg-[#142318] p-3 rounded-xl border border-[#1e3324]">
                    <span className="text-[#8ca893] block">Projected Soil Health</span>
                    <strong className="text-cyan-400 text-base font-mono mt-1 block">
                      +{simulationResult.deltas.soilHealthDelta} pts
                    </strong>
                    <span className="text-[#8ca893] text-[11px]">3-year trajectory</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">Loading simulation engine...</div>
            )}
          </div>
        </div>

        {/* Saved Scenarios Catalog */}
        {savedScenarios.length > 0 && (
          <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Saved What-If Scenarios Catalog
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {savedScenarios.map((sc) => (
                <div key={sc.id} className="p-3 bg-[#142318] border border-[#1e3324] rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-white">{sc.name}</strong>
                    <span className="text-[10px] font-mono text-[#8ca893]">{new Date(sc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[#8ca893] line-clamp-2">{sc.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
