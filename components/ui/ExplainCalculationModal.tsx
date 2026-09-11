'use client';

import React from 'react';
import { X, CheckCircle, Info, ArrowRight, ShieldCheck } from 'lucide-react';

interface ExplainCalculationModalProps {
  prescriptionCode: string;
  trace: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ExplainCalculationModal({
  prescriptionCode,
  trace,
  isOpen,
  onClose,
}: ExplainCalculationModalProps) {
  if (!isOpen || !trace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#1e3324] bg-[#0c160f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-900/60 text-emerald-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Agronomic Calculation Audit Trace</h3>
              <p className="text-[11px] text-[#76937e] font-mono">{prescriptionCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#76937e] hover:text-white rounded-lg hover:bg-[#152419]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trace Steps Container */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Step 1 */}
          <div className="bg-[#132217] p-4 rounded-xl border border-[#1e3324]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                Step 1: Baseline Crop Uptake Demand
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-900/50">
                PROTOTYPE BENCHMARK
              </span>
            </div>
            <p className="text-[#8ca893] mb-3 leading-relaxed">
              Based on crop cultivar (<strong>{trace.step1_agronomicBaseDemand?.crop || 'Rice'}</strong>) and active growth stage (<strong>{trace.step1_agronomicBaseDemand?.stage || 'Tillering'}</strong>).
            </p>
            <div className="grid grid-cols-3 gap-2 bg-[#0c160f] p-2.5 rounded-lg border border-[#1a2e20] text-center font-mono">
              <div>
                <span className="text-[#6b8571] text-[10px] block">Nitrogen (N)</span>
                <span className="text-white font-bold">{trace.step1_agronomicBaseDemand?.rateNPerHa || 110} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Phosphorus (P)</span>
                <span className="text-white font-bold">{trace.step1_agronomicBaseDemand?.ratePPerHa || 45} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Potassium (K)</span>
                <span className="text-white font-bold">{trace.step1_agronomicBaseDemand?.rateKPerHa || 75} kg/ha</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#132217] p-4 rounded-xl border border-[#1e3324]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                Step 2: Soil Bioavailability Credits
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/50">
                {trace.step2_soilAdjustment?.source || 'SOIL_TEST'}
              </span>
            </div>
            <p className="text-[#8ca893] mb-3 leading-relaxed">
              Deducts natural mineral nutrient release from topsoil core tests.
            </p>
            <div className="grid grid-cols-3 gap-2 bg-[#0c160f] p-2.5 rounded-lg border border-[#1a2e20] text-center font-mono">
              <div>
                <span className="text-[#6b8571] text-[10px] block">Avail N Credit</span>
                <span className="text-emerald-300 font-bold">-{trace.step2_soilAdjustment?.availableNkgHa || 18} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Avail P Credit</span>
                <span className="text-emerald-300 font-bold">-{trace.step2_soilAdjustment?.availablePkgHa || 10} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Avail K Credit</span>
                <span className="text-emerald-300 font-bold">-{trace.step2_soilAdjustment?.availableKkgHa || 35} kg/ha</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#132217] p-4 rounded-xl border border-[#1e3324]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                Step 3: Historical Nutrient Input Reductions
              </span>
              <span className="text-[10px] text-[#8ca893] font-mono">
                {trace.step3_applicationHistory?.applicationsCount || 0} applications logged
              </span>
            </div>
            <p className="text-[#8ca893] mb-3 leading-relaxed">
              Deducts previously applied nutrients normalized to the current crop cycle.
            </p>
            <div className="grid grid-cols-3 gap-2 bg-[#0c160f] p-2.5 rounded-lg border border-[#1a2e20] text-center font-mono">
              <div>
                <span className="text-[#6b8571] text-[10px] block">Prior N</span>
                <span className="text-amber-300 font-bold">-{trace.step3_applicationHistory?.appliedNPerHa || 0} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Prior P</span>
                <span className="text-amber-300 font-bold">-{trace.step3_applicationHistory?.appliedPPerHa || 0} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Prior K</span>
                <span className="text-amber-300 font-bold">-{trace.step3_applicationHistory?.appliedKPerHa || 0} kg/ha</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#132217] p-4 rounded-xl border border-[#1e3324]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
                Step 4: Net Remaining Prescription Requirement
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">NET TARGET</span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-[#0c160f] p-2.5 rounded-lg border border-[#1a2e20] text-center font-mono">
              <div>
                <span className="text-[#6b8571] text-[10px] block">Net N Req</span>
                <span className="text-white font-bold text-sm">{trace.step4_nutrientBalance?.remainingN || 42} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Net P Req</span>
                <span className="text-white font-bold text-sm">{trace.step4_nutrientBalance?.remainingP || 20} kg/ha</span>
              </div>
              <div>
                <span className="text-[#6b8571] text-[10px] block">Net K Req</span>
                <span className="text-white font-bold text-sm">{trace.step4_nutrientBalance?.remainingK || 30} kg/ha</span>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-[#132217] p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Final Product Recommendation
              </span>
              <span className="text-[10px] font-mono text-emerald-300">
                Safe Range: {trace.step5_fertilizerSelection?.range}
              </span>
            </div>
            <div className="p-3 bg-[#0c160f] rounded-lg border border-emerald-900/60 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{trace.step5_fertilizerSelection?.option}</div>
                <div className="text-[11px] text-[#8ca893] mt-0.5">
                  Calibrated for target application rate of <strong className="text-emerald-300 font-mono">{trace.step5_fertilizerSelection?.targetRateKgHa} kg/ha</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e3324] bg-[#0c160f] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-[#1a2d1f] hover:bg-[#223b29] text-white rounded-lg transition-colors"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}
