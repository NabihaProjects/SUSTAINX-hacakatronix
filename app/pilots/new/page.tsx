'use client';

// SOIL IQ - 15-Step Pilot Setup Wizard
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Building2,
  Tractor,
  Radio,
  FileCheck2,
  TrendingDown,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function NewPilotWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wizard state
  const [formData, setFormData] = useState({
    name: 'East Field 03 Maize Variable-Rate Pilot',
    organization: 'Green Valley Ag Enterprises',
    farm: 'Green Valley Farm',
    field: 'East Field 03 - Maize Production',
    crop: 'Maize (Zea mays)',
    totalArea: '10.0',
    controlArea: '5.0',
    soilIQArea: '5.0',
    sensors: '4x In-Situ Capacitance Soil Nodes (Moisture + EC + Temp)',
    sprayer: 'Sprayer SP-01 (Speed-compensated PWM valve controller)',
    baselineType: 'CONTROL_AREA (Adjacent conventional broadcast plot)',
    successCriteria: 'Fertilizer reduction >= 15%, application deviation <= 6%',
    startDate: new Date().toISOString().slice(0, 10),
  });

  const STEPS = [
    { num: 1, title: 'Pilot Name', desc: 'Identify your controlled field deployment.' },
    { num: 2, title: 'Organization', desc: 'Confirm enterprise tenant mapping.' },
    { num: 3, title: 'Target Farm', desc: 'Select geographic farm parcel.' },
    { num: 4, title: 'Field Selection', desc: 'Choose target field boundary.' },
    { num: 5, title: 'Crop Type', desc: 'Agronomic crop specification.' },
    { num: 6, title: 'Total Area', desc: 'Gross trial area in acres.' },
    { num: 7, title: 'Control Area', desc: 'Conventional broadcast baseline plot.' },
    { num: 8, title: 'SOIL IQ Area', desc: 'Variable-rate prescription managed area.' },
    { num: 9, title: 'Sensors', desc: 'Active soil probe telemetry network.' },
    { num: 10, title: 'Sprayer Rig', desc: 'Flow meter and PWM nozzle rig.' },
    { num: 11, title: 'Soil Baseline', desc: 'Reference soil chemistry baseline.' },
    { num: 12, title: 'Success Metrics', desc: 'Target measurable KPI criteria.' },
    { num: 13, title: 'Start Date', desc: 'Deployment inception schedule.' },
    { num: 14, title: 'Review Summary', desc: 'Audit trial parameters before launch.' },
    { num: 15, title: 'Activate Pilot', desc: 'Begin live telemetry ingestion and VRA.' },
  ];

  const handleNext = () => {
    if (currentStep < 15) {
      setCurrentStep(currentStep + 1);
    } else {
      handleActivate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleActivate = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/workspace');
    }, 1000);
  };

  const currentStepObj = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-12 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1c3322] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pilot Setup Wizard</h1>
              <span className="text-xs text-[#8ca893]">Controlled Field Deployment Planner</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Step {currentStep} of 15
            </span>
            <span className="text-xs text-[#718d78]">{currentStepObj.title}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#132217] h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 15) * 100}%` }}
          ></div>
        </div>

        {/* Wizard Card Body */}
        <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-8 shadow-xl min-h-[360px] flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
                Step {currentStep} • {currentStepObj.title}
              </span>
              <p className="text-sm text-[#8ca893]">{currentStepObj.desc}</p>
            </div>

            {/* Step-Specific Form Input Fields */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Pilot Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. South Parcel Corn Precision Pilot"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Organization / Tenant</label>
                <input
                  type="text"
                  disabled
                  value={formData.organization}
                  className="w-full bg-[#08120a]/60 border border-[#1a3320] rounded-xl px-4 py-3 text-sm text-[#8ca893]"
                />
                <span className="text-xs text-[#718d78] block">Organization scope locked to current enterprise tenant.</span>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Target Farm</label>
                <select
                  value={formData.farm}
                  onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>Green Valley Farm</option>
                  <option>North Branch Research Farm</option>
                </select>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Field Parcel</label>
                <select
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>East Field 03 - Maize Production</option>
                  <option>Central Field 02 - Tomato Horticulture</option>
                  <option>North Field 01 - Rice Trial</option>
                </select>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Target Crop</label>
                <input
                  type="text"
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Total Trial Area (Acres)</label>
                <input
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Control Area (Acres - Conventional Uniform Rate)</label>
                <input
                  type="number"
                  value={formData.controlArea}
                  onChange={(e) => setFormData({ ...formData, controlArea: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-[#718d78] block">This area receives uniform regional standard application without sensor modulation.</span>
              </div>
            )}

            {currentStep === 8 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">SOIL IQ Managed Area (Acres - Precision VRA)</label>
                <input
                  type="number"
                  value={formData.soilIQArea}
                  onChange={(e) => setFormData({ ...formData, soilIQArea: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 9 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Sensor Network Configuration</label>
                <input
                  type="text"
                  value={formData.sensors}
                  onChange={(e) => setFormData({ ...formData, sensors: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 10 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Assigned Smart Sprayer Unit</label>
                <input
                  type="text"
                  value={formData.sprayer}
                  onChange={(e) => setFormData({ ...formData, sprayer: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 11 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Reference Baseline Methodology</label>
                <input
                  type="text"
                  value={formData.baselineType}
                  onChange={(e) => setFormData({ ...formData, baselineType: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 12 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Measurable Success Criteria</label>
                <input
                  type="text"
                  value={formData.successCriteria}
                  onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 13 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">Pilot Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {currentStep === 14 && (
              <div className="space-y-3 text-xs bg-[#08120a] p-4 rounded-xl border border-[#1e3825]">
                <h4 className="font-bold text-white text-sm mb-2">Audit Trial Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-[#9cb2a3]">
                  <div>Pilot: <strong className="text-white">{formData.name}</strong></div>
                  <div>Field: <strong className="text-white">{formData.field}</strong></div>
                  <div>Crop: <strong className="text-white">{formData.crop}</strong></div>
                  <div>Split: <strong className="text-emerald-400">{formData.controlArea}ac (Ctrl) / {formData.soilIQArea}ac (VRA)</strong></div>
                  <div>Sensors: <strong className="text-white">{formData.sensors}</strong></div>
                  <div>Sprayer: <strong className="text-white">{formData.sprayer}</strong></div>
                </div>
              </div>
            )}

            {currentStep === 15 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Ready for Controlled Field Pilot</h3>
                <p className="text-xs text-[#8ca893] max-w-md mx-auto">
                  Clicking Activate will initialize the pilot measurement plan, register the trial baseline, and link real-time sprayer telemetry to the pilot evaluation ledger.
                </p>
              </div>
            )}
          </div>

          {/* Wizard Navigation Footer */}
          <div className="flex items-center justify-between border-t border-[#1c3322] pt-6 mt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentStep === 1
                  ? 'text-[#5a7461] cursor-not-allowed'
                  : 'text-[#8ca893] hover:text-white bg-[#132217] hover:bg-[#1a3321] border border-[#213f28]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-950"
            >
              {currentStep === 15 ? (
                isSubmitting ? (
                  <span>Activating...</span>
                ) : (
                  <>
                    <span>Activate Pilot</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )
              ) : (
                <>
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
