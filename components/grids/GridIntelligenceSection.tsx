'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Eye,
  Microscope,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Leaf,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { StructuredExplanation } from '@/lib/domain/explanationService';
import { SoilHealthBreakdown } from '@/lib/domain/soilHealthService';

interface AnomalyData {
  id: string;
  metricType: string;
  anomalyType: string;
  severity: string;
  description: string;
  rootCauseHypotheses?: {
    category: string;
    explanation: string;
    probability: number;
    recommendedVerification: string;
  }[];
}

interface Props {
  gridCode: string;
  explanation: StructuredExplanation;
  soilHealth: SoilHealthBreakdown;
  anomalies: AnomalyData[];
}

export function GridIntelligenceSection({
  gridCode,
  explanation,
  soilHealth,
  anomalies,
}: Props) {
  const [showFactDetails, setShowFactDetails] = useState(false);
  const [expandedAnomalyId, setExpandedAnomalyId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Explainable AI Rationale - Why is SOIL IQ Saying This? */}
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e3324] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Explainable Decision Intelligence
              </h2>
              <p className="text-[11px] text-[#76937e]">
                Transparent causal chain justifying prescription and control state for {gridCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                explanation.confidenceLevel === 'HIGH'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : explanation.confidenceLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {explanation.confidenceLevel} CONFIDENCE ({Math.round(explanation.confidenceScore * 100)}%)
            </span>
          </div>
        </div>

        {/* Structured 5-Stage Explanatory Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Stage 1: Observation */}
          <div className="p-3.5 bg-[#0a120c] rounded-lg border border-[#182c1d] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              <span>1. Observation</span>
            </div>
            <p className="text-xs text-[#b8ccc0] leading-relaxed">
              {explanation.observation}
            </p>
          </div>

          {/* Stage 2: Agronomic Analysis */}
          <div className="p-3.5 bg-[#0a120c] rounded-lg border border-[#182c1d] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Microscope className="w-3.5 h-3.5" />
              <span>2. Analysis</span>
            </div>
            <p className="text-xs text-[#b8ccc0] leading-relaxed">
              {explanation.analysis}
            </p>
          </div>

          {/* Stage 3: Predicted Impact */}
          <div className="p-3.5 bg-[#0a120c] rounded-lg border border-[#182c1d] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>3. Impact</span>
            </div>
            <p className="text-xs text-[#b8ccc0] leading-relaxed">
              {explanation.impact}
            </p>
          </div>

          {/* Stage 4: Recommendation */}
          <div className="p-3.5 bg-[#0a120c] rounded-lg border border-[#182c1d] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. Recommendation</span>
            </div>
            <p className="text-xs text-[#d6e8dc] leading-relaxed font-medium">
              {explanation.recommendation}
            </p>
          </div>
        </div>

        {/* Top Influencing Factors */}
        {explanation.topFactors && explanation.topFactors.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#63806a] uppercase tracking-wider">
              Top Factors:
            </span>
            {explanation.topFactors.map((factor, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-[#122316] text-[#9cb2a3] border border-[#1b3621] px-2.5 py-0.5 rounded-full"
              >
                {factor}
              </span>
            ))}
          </div>
        )}

        {/* Raw Verified Fact Store Drawer */}
        {explanation.facts && explanation.facts.length > 0 && (
          <div className="pt-2 border-t border-[#16291b]">
            <button
              onClick={() => setShowFactDetails(!showFactDetails)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              {showFactDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showFactDetails ? 'Hide Fact Store Citing Data' : `Inspect Fact Store (${explanation.facts.length} Verified Facts)`}
            </button>

            {showFactDetails && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {explanation.facts.map((f, idx) => (
                  <div key={idx} className="p-2.5 bg-[#080f0a] border border-[#16271a] rounded text-[#8da693]">
                    <div className="flex items-center justify-between text-[10px] text-[#556e5a] mb-1">
                      <span className="font-mono text-emerald-400">{f.type}</span>
                      <span>Source: {f.source}</span>
                    </div>
                    <p className="text-[#c4d6c9]">{f.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Prototype Soil Health Index for this Grid */}
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e3324] pb-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Prototype Soil Health Index ({gridCode})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Grade: {soilHealth.label} ({soilHealth.overallScore}/100)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-[#0a120c] rounded-lg border border-[#182c1d]">
            <span className="text-[10px] text-[#6b8571] uppercase">Nutrient Balance</span>
            <span className="text-lg font-bold text-white font-mono block mt-1">
              {soilHealth.components.nutrientBalance.score}%
            </span>
            <span className="text-[10px] text-emerald-400">{soilHealth.components.nutrientBalance.status}</span>
          </div>

          <div className="p-3 bg-[#0a120c] rounded-lg border border-[#182c1d]">
            <span className="text-[10px] text-[#6b8571] uppercase">pH Buffering</span>
            <span className="text-lg font-bold text-white font-mono block mt-1">
              {soilHealth.components.phCondition.score}%
            </span>
            <span className="text-[10px] text-emerald-400">{soilHealth.components.phCondition.status}</span>
          </div>

          <div className="p-3 bg-[#0a120c] rounded-lg border border-[#182c1d]">
            <span className="text-[10px] text-[#6b8571] uppercase">Organic Carbon</span>
            <span className="text-lg font-bold text-white font-mono block mt-1">
              {soilHealth.components.organicCarbon.score}%
            </span>
            <span className="text-[10px] text-amber-400">{soilHealth.components.organicCarbon.status}</span>
          </div>

          <div className="p-3 bg-[#0a120c] rounded-lg border border-[#182c1d]">
            <span className="text-[10px] text-[#6b8571] uppercase">Salinity / EC</span>
            <span className="text-lg font-bold text-white font-mono block mt-1">
              {soilHealth.components.salinityEc.score}%
            </span>
            <span className="text-[10px] text-emerald-400">{soilHealth.components.salinityEc.status}</span>
          </div>

          <div className="p-3 bg-[#0a120c] rounded-lg border border-[#182c1d]">
            <span className="text-[10px] text-[#6b8571] uppercase">Moisture Stability</span>
            <span className="text-lg font-bold text-white font-mono block mt-1">
              {soilHealth.components.moistureStability.score}%
            </span>
            <span className="text-[10px] text-emerald-400">{soilHealth.components.moistureStability.status}</span>
          </div>

          <div className="p-3 bg-[#0a120c] rounded-lg border border-[#182c1d]">
            <span className="text-[10px] text-[#6b8571] uppercase">Excess History</span>
            <span className="text-lg font-bold text-white font-mono block mt-1">
              {soilHealth.components.excessHistory.score}%
            </span>
            <span className="text-[10px] text-emerald-400">{soilHealth.components.excessHistory.status}</span>
          </div>
        </div>

        <p className="text-[10px] text-[#556e5c] italic">
          *Prototype model integrating chemical availability, soil structure, and historical input rates.
        </p>
      </div>

      {/* 3. Active Anomaly Warnings for this Grid (if any) */}
      {anomalies && anomalies.length > 0 && (
        <div className="bg-[#18110b] border border-[#3b2413] rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Active Grid Anomaly Warnings ({anomalies.length})
            </h2>
          </div>

          <div className="space-y-2">
            {anomalies.map((ano) => {
              const isExpanded = expandedAnomalyId === ano.id;

              return (
                <div
                  key={ano.id}
                  className="bg-[#0e0a07] border border-[#2b1b0e] rounded-lg p-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {ano.severity}
                        </span>
                        <span className="font-semibold text-white">{ano.anomalyType}</span>
                        <span className="text-[10px] text-[#8ca893] font-mono">[{ano.metricType}]</span>
                      </div>
                      <p className="text-[#d8c2af]">{ano.description}</p>
                    </div>

                    {ano.rootCauseHypotheses && ano.rootCauseHypotheses.length > 0 && (
                      <button
                        onClick={() => setExpandedAnomalyId(isExpanded ? null : ano.id)}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? 'Hide Causes' : 'Root Causes'}
                      </button>
                    )}
                  </div>

                  {isExpanded && ano.rootCauseHypotheses && (
                    <div className="mt-3 pt-2 border-t border-[#24170c] space-y-1.5">
                      {ano.rootCauseHypotheses.map((hypo, idx) => (
                        <div key={idx} className="p-2 rounded bg-[#160f09] border border-[#2d1c0f] text-[11px]">
                          <div className="flex justify-between font-semibold text-amber-200">
                            <span>#{idx + 1} {hypo.category}</span>
                            <span>{Math.round(hypo.probability * 100)}% Prob</span>
                          </div>
                          <p className="text-[#a8988a] mt-0.5">{hypo.explanation}</p>
                          <div className="text-[10px] text-[#786a5e] mt-0.5">
                            <span className="text-amber-400">Verify:</span> {hypo.recommendedVerification}
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
      )}
    </div>
  );
}
