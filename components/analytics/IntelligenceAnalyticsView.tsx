'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  Leaf,
  Info,
  HelpCircle,
  BarChart3,
  Cpu,
} from 'lucide-react';

interface InsightItem {
  id: string;
  title: string;
  summary: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  confidence: number;
  confidenceLevel: string;
  recommendedAction?: string | null;
  potentialImpact?: string | null;
  evidence: string[];
}

interface AnomalyItem {
  id: string;
  gridCode?: string;
  metricType: string;
  anomalyType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  hypotheses: {
    category: string;
    explanation: string;
    probability: number;
    recommendedVerification: string;
  }[];
}

interface SoilHealthData {
  farmIndex: number;
  grade: string;
  trajectory: 'IMPROVING' | 'STABLE' | 'DEGRADING';
  components: {
    nutrientBalance: number;
    soilPh: number;
    organicCarbon: number;
    salinityEc: number;
    moistureRetention: number;
    overapplicationHistory: number;
  };
  disclaimer: string;
}

interface EfficiencyData {
  overallEfficiencyPct: number;
  overapplicationAvoidedKg: number;
  estimatedSavingsUsd: number;
  adherenceScorePct: number;
}

interface Props {
  soilHealth: SoilHealthData;
  efficiency: EfficiencyData;
  insights: InsightItem[];
  anomalies: AnomalyItem[];
}

export function IntelligenceAnalyticsView({
  soilHealth,
  efficiency,
  insights,
  anomalies,
}: Props) {
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [expandedAnomalyId, setExpandedAnomalyId] = useState<string | null>(null);
  const [acceptedInsightIds, setAcceptedInsightIds] = useState<Record<string, boolean>>({});

  const handleAccept = async (id: string) => {
    setAcceptedInsightIds((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch('/api/intelligence/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: id,
          feedback: 'ACCEPTED',
          comments: 'Accepted recommendation from Intelligence Analytics view.',
        }),
      });
    } catch (e) {
      console.error('Accept feedback failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Core Intelligence KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Prototype Soil Health Index */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#76937e] uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Soil Health Index
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {soilHealth.grade} ({soilHealth.trajectory})
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{soilHealth.farmIndex}</span>
            <span className="text-sm font-semibold text-[#76937e]">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+4.2% multi-season trajectory</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#172b1d] text-[10px] text-[#556e5c] italic">
            *Prototype model combining 6 physical & chemical metrics
          </div>
        </div>

        {/* KPI 2: Fertilizer Use Efficiency */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#76937e] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Nutrient Efficiency
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              TARGET: 85%
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{efficiency.overallEfficiencyPct}%</span>
            <span className="text-xs text-blue-400 font-medium">Optimal Uptake</span>
          </div>
          <div className="mt-2 text-[11px] text-[#76937e]">
            Application Adherence: <span className="text-white font-semibold">{efficiency.adherenceScorePct}%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#172b1d] text-[10px] text-[#556e5c]">
            Based on phenological crop demand vs applied ledger
          </div>
        </div>

        {/* KPI 3: Overapplication Avoided */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#76937e] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Overapplication Avoided
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SAVINGS
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{efficiency.overapplicationAvoidedKg}</span>
            <span className="text-sm font-semibold text-[#76937e]">kg avoided</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span>+${efficiency.estimatedSavingsUsd} saved in chemical input costs</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#172b1d] text-[10px] text-[#556e5c]">
            Mitigated via closed-loop rate throttle & shut-offs
          </div>
        </div>

        {/* KPI 4: Data Quality & Model Confidence */}
        <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#76937e] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              Data Quality Index
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              HIGH CONFIDENCE
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">89</span>
            <span className="text-sm font-semibold text-[#76937e]">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-[#76937e]">
            Telemetry Freshness: <span className="text-white font-semibold">99.4% uptime</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#172b1d] text-[10px] text-[#556e5c]">
            Sensor drift and flatline filters active
          </div>
        </div>
      </div>

      {/* Soil Health Component Breakdown */}
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Soil Health Index - Component Weights & Performance
            </h3>
            <p className="text-xs text-[#76937e] mt-0.5">
              Transparent multi-metric aggregation powering field longevity forecasts
            </p>
          </div>
          <div className="text-[11px] text-[#8fa795] bg-[#09110b] px-3 py-1 rounded-md border border-[#1b3121]">
            Model Version: <span className="text-emerald-400 font-mono">SHI-v1.2</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Component 1 */}
          <div className="bg-[#09110b] border border-[#17291c] rounded-lg p-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Nutrient Balance</span>
              <span className="text-emerald-400 font-bold">{soilHealth.components.nutrientBalance}% (wt: 25%)</span>
            </div>
            <div className="w-full bg-[#17281d] rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${soilHealth.components.nutrientBalance}%` }} />
            </div>
            <span className="text-[10px] text-[#63806a] mt-1.5 block">N-P-K stoichiometric equilibrium ratio</span>
          </div>

          {/* Component 2 */}
          <div className="bg-[#09110b] border border-[#17291c] rounded-lg p-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Soil pH Buffering</span>
              <span className="text-emerald-400 font-bold">{soilHealth.components.soilPh}% (wt: 20%)</span>
            </div>
            <div className="w-full bg-[#17281d] rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${soilHealth.components.soilPh}%` }} />
            </div>
            <span className="text-[10px] text-[#63806a] mt-1.5 block">Optimal range 6.2 - 6.8 pH score</span>
          </div>

          {/* Component 3 */}
          <div className="bg-[#09110b] border border-[#17291c] rounded-lg p-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Organic Carbon</span>
              <span className="text-amber-400 font-bold">{soilHealth.components.organicCarbon}% (wt: 15%)</span>
            </div>
            <div className="w-full bg-[#17281d] rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${soilHealth.components.organicCarbon}%` }} />
            </div>
            <span className="text-[10px] text-[#63806a] mt-1.5 block">Organic matter humus & microbial reservoir</span>
          </div>

          {/* Component 4 */}
          <div className="bg-[#09110b] border border-[#17291c] rounded-lg p-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Salinity / EC</span>
              <span className="text-emerald-400 font-bold">{soilHealth.components.salinityEc}% (wt: 15%)</span>
            </div>
            <div className="w-full bg-[#17281d] rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${soilHealth.components.salinityEc}%` }} />
            </div>
            <span className="text-[10px] text-[#63806a] mt-1.5 block">Electrical conductivity salt accumulation safety</span>
          </div>

          {/* Component 5 */}
          <div className="bg-[#09110b] border border-[#17291c] rounded-lg p-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Moisture Retention</span>
              <span className="text-emerald-400 font-bold">{soilHealth.components.moistureRetention}% (wt: 15%)</span>
            </div>
            <div className="w-full bg-[#17281d] rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${soilHealth.components.moistureRetention}%` }} />
            </div>
            <span className="text-[10px] text-[#63806a] mt-1.5 block">Hydraulic conductivity and wilting point buffer</span>
          </div>

          {/* Component 6 */}
          <div className="bg-[#09110b] border border-[#17291c] rounded-lg p-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-white">Overapplication Penalty</span>
              <span className="text-emerald-400 font-bold">{soilHealth.components.overapplicationHistory}% (wt: 10%)</span>
            </div>
            <div className="w-full bg-[#17281d] rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${soilHealth.components.overapplicationHistory}%` }} />
            </div>
            <span className="text-[10px] text-[#63806a] mt-1.5 block">Historical over-application penalty score</span>
          </div>
        </div>
      </div>

      {/* Priority Intelligence Insights & Recommendations */}
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Priority Intelligence Insights & Prescriptive Advice
            </h3>
            <p className="text-xs text-[#76937e] mt-0.5">
              Rule-engine & ML insights with concrete impact analysis and evidence trails
            </p>
          </div>
          <span className="text-xs text-[#63806a]">{insights.length} Active Insights</span>
        </div>

        <div className="space-y-3">
          {insights.map((insight) => {
            const isExpanded = expandedInsightId === insight.id;
            const isAccepted = acceptedInsightIds[insight.id];

            return (
              <div
                key={insight.id}
                className="bg-[#09110b] border border-[#192f1f] rounded-lg p-4 transition-all hover:border-[#22422b]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${
                        insight.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : insight.priority === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {insight.priority}
                    </span>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                        <span className="text-[11px] text-[#63806a] font-mono">[{insight.category}]</span>
                      </div>
                      <p className="text-xs text-[#9cb2a3] mt-1 leading-relaxed">{insight.summary}</p>

                      {insight.recommendedAction && (
                        <div className="mt-2.5 p-2.5 rounded bg-[#101e14] border border-[#1b3622] text-xs space-y-1">
                          <div className="text-emerald-300 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Recommended Action:</span>
                          </div>
                          <p className="text-[#c4d6c9]">{insight.recommendedAction}</p>
                          {insight.potentialImpact && (
                            <p className="text-[11px] text-[#76937e] italic pt-1 border-t border-[#172c1d]">
                              Impact: {insight.potentialImpact}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {Math.round(insight.confidence * 100)}% Conf
                    </span>

                    {insight.recommendedAction && (
                      <button
                        onClick={() => handleAccept(insight.id)}
                        disabled={isAccepted}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                          isAccepted
                            ? 'bg-emerald-800/50 text-emerald-300 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {isAccepted ? 'Accepted' : 'Accept Action'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Evidence accordion toggle */}
                {insight.evidence && insight.evidence.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#142618]">
                    <button
                      onClick={() => setExpandedInsightId(isExpanded ? null : insight.id)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? 'Hide Supporting Evidence' : `View Supporting Evidence (${insight.evidence.length} facts)`}
                    </button>

                    {isExpanded && (
                      <ul className="mt-2 pl-4 list-disc text-[11px] text-[#8ba391] space-y-1">
                        {insight.evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Modal Statistical Anomaly Detection Feed */}
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Multi-Modal Statistical Anomaly Feed
            </h3>
            <p className="text-xs text-[#76937e] mt-0.5">
              Automated detection of sensor drift, flatlines, sudden rate spikes, and soil state deviation
            </p>
          </div>
          <span className="text-xs text-[#63806a]">{anomalies.length} Flagged Anomalies</span>
        </div>

        <div className="space-y-3">
          {anomalies.map((ano) => {
            const isExpanded = expandedAnomalyId === ano.id;

            return (
              <div
                key={ano.id}
                className="bg-[#09110b] border border-[#192f1f] rounded-lg p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          ano.severity === 'CRITICAL' || ano.severity === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {ano.severity}
                      </span>
                      <span className="text-xs font-semibold text-white">{ano.anomalyType}</span>
                      {ano.gridCode && (
                        <span className="text-[11px] font-mono text-emerald-400 bg-[#122316] px-1.5 py-0.5 rounded">
                          Grid {ano.gridCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9cb2a3]">{ano.description}</p>
                  </div>

                  <button
                    onClick={() => setExpandedAnomalyId(isExpanded ? null : ano.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isExpanded ? 'Hide Hypotheses' : 'Root-Cause Analysis'}
                  </button>
                </div>

                {/* Hypotheses Drawer */}
                {isExpanded && ano.hypotheses && ano.hypotheses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#162a1b] space-y-2">
                    <div className="text-[10px] font-bold text-[#63806a] uppercase tracking-wider">
                      Ranked Root-Cause Hypotheses & Diagnostic Verification
                    </div>
                    {ano.hypotheses.map((hypo, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-[#0d1810] border border-[#1b3121] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-300">
                            #{idx + 1}: {hypo.category} Hypothesis
                          </span>
                          <span className="text-[11px] font-mono text-amber-400">
                            {Math.round(hypo.probability * 100)}% Probability
                          </span>
                        </div>
                        <p className="text-[#9cb2a3]">{hypo.explanation}</p>
                        <div className="text-[11px] text-[#718b77] pt-1">
                          <span className="text-emerald-400 font-medium">Verify:</span> {hypo.recommendedVerification}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
