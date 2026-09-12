// SOIL IQ - 6-Week Customer Implementation Plan
import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Tractor,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function ImplementationPlanPage() {
  const WEEKS = [
    {
      week: 'Week 1',
      title: 'Spatial Mapping & Boundary RTK Ingestion',
      status: 'COMPLETED',
      deliverables: [
        'Upload polygon shapefile or KML field boundaries',
        'Generate deterministic 20m x 20m spatial grid mesh',
        'Ingest RTK-GNSS base station calibration offsets',
      ],
      leadRole: 'GIS Specialist & Farm Manager',
    },
    {
      week: 'Week 2',
      title: 'Laboratory Soil Baseline & Nutrient Quotas',
      status: 'COMPLETED',
      deliverables: [
        'Import certified lab soil assay (Bray-1 P, available N, exchangeable K)',
        'Calibrate spatial nutrient interpolation model',
        'Approve FieldSoilBaseline v1 via Agronomist Review Queue',
      ],
      leadRole: 'Certified Agronomist',
    },
    {
      week: 'Week 3',
      title: 'Sensor Network & Edge Gateway Provisioning',
      status: 'COMPLETED',
      deliverables: [
        'Install 4x in-situ multi-depth capacitance soil probes',
        'Provision cellular LoRa Edge Gateway with local SQLite buffer',
        'Verify continuous telemetry MQTT topics at 1.0 Hz cadence',
      ],
      leadRole: 'IoT Hardware Field Engineer',
    },
    {
      week: 'Week 4',
      title: 'Smart Sprayer Calibration & Closed-Loop Telemetry',
      status: 'COMPLETED',
      deliverables: [
        'Calibrate in-line pulse flow meter totalizer (L/min)',
        'Verify hydrostatic tank level sensor zero and empty thresholds',
        'Test automatic PWM valve shutoff upon boundary cross or budget cap',
      ],
      leadRole: 'Machinery Technician & Lead Operator',
    },
    {
      week: 'Week 5',
      title: 'Controlled Field Pilot Launch (Control vs VRA)',
      status: 'IN_PROGRESS',
      deliverables: [
        'Delineate 5.0-acre uniform broadcast control plot',
        'Delineate 5.0-acre variable-rate SOIL IQ managed plot',
        'Begin side-by-side fertilizer application runs with real-time logging',
      ],
      leadRole: 'Farm Operator & Lead Agronomist',
    },
    {
      week: 'Week 6+',
      title: 'Validation, Harvest Sampling & Commercial Expansion',
      status: 'UPCOMING',
      deliverables: [
        'Correlate in-season satellite NDVI and yield monitor data',
        'Perform post-harvest soil core testing for residual nitrogen depletion',
        'Compile printable Customer Pilot ROI Report for enterprise rollout',
      ],
      leadRole: 'Enterprise Success Lead & Agronomist',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/deployment/readiness" className="hover:text-emerald-400">Deployment</Link>
            <span>/</span>
            <span>Customer Onboarding Plan</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-emerald-400" />
            6-Week Customer Implementation Roadmap
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Structured transition from software onboarding to controlled field pilot, hardware telemetry, and validated commercial deployment.
          </p>
        </div>

        <Link
          href="/deployment/checklists"
          className="flex items-center gap-2 px-4 py-2 bg-[#122417] hover:bg-[#1a3321] text-emerald-300 border border-[#23422a] rounded-lg text-xs font-semibold transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>View Hardware Checklists</span>
        </Link>
      </div>

      {/* Phased Timeline */}
      <div className="space-y-4">
        {WEEKS.map((w, idx) => (
          <div
            key={w.week}
            className={`bg-[#0f1d13] border rounded-2xl p-6 transition-all ${
              w.status === 'IN_PROGRESS'
                ? 'border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                : 'border-[#1e3825]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#172c1c] pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#132217] text-emerald-400 border border-[#213f28] uppercase tracking-wider">
                  {w.week}
                </span>
                <h3 className="text-base font-bold text-white">{w.title}</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                  w.status === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : w.status === 'IN_PROGRESS'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-[#121c14] text-[#718d78] border border-[#1e2e21]'
                }`}
              >
                {w.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2 space-y-2">
                <span className="text-[10px] font-bold text-[#718d78] uppercase tracking-wider block">
                  Key Technical Deliverables
                </span>
                <ul className="space-y-1.5">
                  {w.deliverables.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2 text-[#c2d6c7]">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          w.status === 'COMPLETED'
                            ? 'text-emerald-400'
                            : w.status === 'IN_PROGRESS'
                            ? 'text-amber-400'
                            : 'text-[#445b4c]'
                        }`}
                      />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#08120a] p-3 rounded-xl border border-[#172b1c] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#718d78] uppercase tracking-wider block">
                    Accountable Stakeholder
                  </span>
                  <span className="text-white font-medium block mt-1">{w.leadRole}</span>
                </div>
                <div className="text-[11px] text-[#5a7461] pt-2">
                  Phase {idx + 1} of {WEEKS.length}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
