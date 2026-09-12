'use client';

import React from 'react';

const REQUIREMENTS = [
  {
    criterion: '1. Specific Real Sustainability Problem',
    addressed: 'Excessive and poorly-timed chemical fertilizer runoff contaminating groundwater and causing eutrophication.',
    evidence: 'Environmental weather lockout engine and riparian buffer automatic valve cutoffs.',
    limitation: 'Currently demonstrated on prototype field geometries.',
  },
  {
    criterion: '2. Clearly Identified User & Community',
    addressed: 'Precision farm operators, agronomists, and machinery operators seeking input cost reduction and compliance.',
    evidence: 'Dedicated mobile PWA for field operators and desktop SaaS Command Center for farm managers.',
    limitation: 'Field trials required to adapt to localized farm languages and low-literacy workflows.',
  },
  {
    criterion: '3. Meaningful Sustainability Impact',
    addressed: '15-20% reduction in chemical fertilizer application with zero yield penalty via closed-loop throttle control.',
    evidence: 'Real-time flow totalizer tracking actual vs avoided kilograms of chemical application.',
    limitation: 'Impact metrics are simulated pending multi-season field validation.',
  },
  {
    criterion: '4. Improves Existing Broken System',
    addressed: 'Replaces blind, uniform blanket spraying with centimeter-accurate spatial grid prescriptions.',
    evidence: 'RTK-GNSS sub-meter positioning and dynamic point-in-polygon prescription matching.',
    limitation: 'Requires RTK-GNSS receiver and flow meter hardware on the sprayer.',
  },
  {
    criterion: '5. Prototype Feasible in Hackathon Timeframe',
    addressed: 'Complete digital twin and hardware abstraction layer allowing full closed-loop demonstration without physical machine risk.',
    evidence: 'Hardware-In-The-Loop (HIL) simulation test harness and deterministic 10-scene judge script.',
    limitation: 'Physical machinery actuation remains safely simulated in prototype mode.',
  },
  {
    criterion: '6. Measurable Impact Metrics',
    addressed: 'Fertilizer applied (kg), excess prevented (kg), cost savings ($), accuracy (%), and environmental deferrals count.',
    evidence: 'Continuous session ledger and audit logs recording every discrete application slice.',
    limitation: 'Financial savings benchmarked against standard $0.68/kg NPK fertilizer formulation.',
  },
  {
    criterion: '7. Realistic Real-World Path',
    addressed: 'Disciplined 6-phase engineering roadmap from software simulation to bench testing, controlled plot, and commercial rollout.',
    evidence: 'Vendor-neutral Hardware Abstraction Layer with standard MQTT, CAN-bus, and LoRaWAN schemas.',
    limitation: 'Requires capital for physical sensor kits and tractor retrofit pilot.',
  },
  {
    criterion: '8. Goes Beyond Simple Awareness',
    addressed: 'Not an educational dashboard; actively closes the physical machine control loop with automated valve modulation.',
    evidence: 'Machine controller automatically throttles flow and engages safe stops during runoff conditions.',
    limitation: 'Autonomous physical control gated behind safety checklist in prototype phase.',
  },
];

export default function RequirementsTraceabilityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              SustainX Evaluation Traceability
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Hackathon Problem Criteria Traceability</h1>
            <p className="text-xs text-slate-400 mt-1">
              Direct mapping of SOIL IQ capabilities against the official SustainX competition evaluation dimensions.
            </p>
          </div>
          <a
            href="/validation"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Claims Matrix
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {REQUIREMENTS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg space-y-2"
            >
              <h3 className="font-bold text-emerald-300 text-sm">{item.criterion}</h3>
              <div>
                <span className="text-slate-400 font-semibold">How Addressed: </span>
                <span className="text-slate-200">{item.addressed}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Prototype Evidence: </span>
                <span className="text-emerald-400/90">{item.evidence}</span>
              </div>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                <span className="font-semibold text-slate-400">Current Limitation: </span>
                <span>{item.limitation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
