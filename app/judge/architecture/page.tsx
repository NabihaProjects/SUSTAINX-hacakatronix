'use client';

import React from 'react';

export default function JudgeArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              System Architecture & Engineering Depth
            </span>
            <h1 className="text-2xl font-black text-white mt-1">3-Layer Platform Architecture</h1>
            <p className="text-xs text-slate-400 mt-1">
              Field Edge Layer, Platform Decision Engine, and User Experience Architecture.
            </p>
          </div>
          <a
            href="/judge"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Back to Judge Mode
          </a>
        </div>

        {/* 3-Layer Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-emerald-800/40 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Layer 1</span>
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-300 font-mono">Edge & IoT</span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-2">Local Field Layer</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>In-situ soil probes & microclimate nodes</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>RTK-GNSS centimeter receiver (NMEA 0183)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Electromagnetic pulse flow meter & totalizer</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Chemical hydrostatic tank level sensor</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Field EdgeGateway with local prescription cache</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Solenoid boom valves & PWM pump actuators</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-800/40 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Layer 2</span>
              <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] text-blue-300 font-mono">Core Backend</span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-2">Platform Decision Engine</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>MQTT Ingestion broker with Zod validation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>Spatial grid resolution (Point-in-polygon)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>Agronomic prescription & N-P-K budget engine</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>Weather risk & riparian buffer lockout logic</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>Deterministic 10-tier safety control hierarchy</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>Audit logging, idempotency & time-series storage</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-800/40 bg-slate-900/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Layer 3</span>
              <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] text-purple-300 font-mono">Experience</span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-2">Operator & Judge Experience</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Desktop SaaS Executive Command Center</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Field Operator PWA with offline action caching</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Dedicated Hackathon Judge Mode (/judge)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Industrial hardware diagnostics console</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Causal "Why Did SOIL IQ Stop?" explainability</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>What-If scenario sandbox & sustainability analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why This Is Hard Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Why This Problem Is Hard: 4 Engineering Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800/80">
              <div className="font-bold text-emerald-400 mb-1">1. Millisecond Spatial Resolution</div>
              <p className="text-slate-300 leading-relaxed">
                At 10 km/h, an agricultural sprayer travels 2.8 meters every second. Resolving irregular polygon grid boundaries with sub-meter latency without locking the UI requires spatial indexing and localized edge computation.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800/80">
              <div className="font-bold text-emerald-400 mb-1">2. Heterogeneous Data Synchronization</div>
              <p className="text-slate-300 leading-relaxed">
                Reconciling high-frequency GNSS coordinate streams (5 Hz), discrete flow pulses (10 Hz), periodic soil moisture transmissions (every 15 min), and weather forecasts into a single deterministic ledger state without race conditions.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800/80">
              <div className="font-bold text-emerald-400 mb-1">3. Deterministic Safety vs. Statistical AI</div>
              <p className="text-slate-300 leading-relaxed">
                Agricultural equipment carries dangerous chemical payloads near riparian waterways. Probabilistic LLMs cannot be trusted with machine safety; control decisions must obey deterministic mathematical interlocks.
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800/80">
              <div className="font-bold text-emerald-400 mb-1">4. Offline Rural Field Realities</div>
              <p className="text-slate-300 leading-relaxed">
                Real fields frequently suffer 0-bar cellular coverage. The control loop cannot depend on continuous cloud roundtrips. Prescriptions must be cached on edge gateways and telemetry synchronized idempotently upon reconnect.
              </p>
            </div>
          </div>
        </div>

        {/* Section 34: Why Two People Can Prototype It */}
        <div className="rounded-2xl border border-emerald-800/40 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Engineering Methodology
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                How A Small Team Built An Industrial IoT Prototype
              </h2>
            </div>
            <span className="rounded bg-emerald-950 border border-emerald-700 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
              Architectural Leverage
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Building a real agricultural machine requires millions in capital and heavy mechanical fabrication. SOIL IQ solved this by designing a production-grade digital architecture that decouples software intelligence from physical hardware through 4 pillars:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="font-bold text-emerald-400 mb-1">1. Hardware Abstraction Layer</div>
              <p className="text-slate-400 leading-relaxed">
                Clean adapter interfaces (<code className="text-slate-300">DeviceAdapter</code>, <code className="text-slate-300">RtkGnssAdapter</code>, <code className="text-slate-300">FlowMeterAdapter</code>) isolate physical I/O from core business logic.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="font-bold text-emerald-400 mb-1">2. Physics-Based Simulation</div>
              <p className="text-slate-400 leading-relaxed">
                Deterministic telemetry drivers generate realistic GPS jitter, speed variations, nozzle flow rates, and tank hydrostatic levels matching standard spray equations.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="font-bold text-emerald-400 mb-1">3. Deterministic Safety Engine</div>
              <p className="text-slate-400 leading-relaxed">
                A 10-tier rule precedence pipeline controls valve decisions (CONTINUE, REDUCE, DEFER, STOP) with zero reliance on non-deterministic black-box models.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="font-bold text-emerald-400 mb-1">4. Canonical Seeded Field Model</div>
              <p className="text-slate-400 leading-relaxed">
                A high-resolution digital twin of Green Valley Farm with 10 spatial grids, pre-calculated historical nutrient buffers, and riparian boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* Section 37: Final Problem-Solution Fit */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Product-Problem Fit Matrix
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Problem-to-Intervention Traceability</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Problem</th>
                  <th className="p-3">Root Cause</th>
                  <th className="p-3">SOIL IQ Intervention</th>
                  <th className="p-3">Measurable Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-3 font-semibold text-rose-300">Uniform blanket chemical over-application</td>
                  <td className="p-3 text-slate-400">Single field-wide dosage ignores internal soil heterogeneity and organic variation.</td>
                  <td className="p-3 text-emerald-300 font-medium">Grid-specific nutrient prescriptions dynamically matched to growth stage.</td>
                  <td className="p-3 font-mono text-slate-200">15-20% chemical input reduction in simulated trials.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-rose-300">Unmeasured application drift & over-dosing</td>
                  <td className="p-3 text-slate-400">No real-time feedback between machine nozzle output and target prescription.</td>
                  <td className="p-3 text-emerald-300 font-medium">Continuous flow totalization + RTK tracking with closed-loop throttle control.</td>
                  <td className="p-3 font-mono text-slate-200">Sub-10% variance tolerance with automatic REDUCE decisions.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-rose-300">Chemical runoff into waterways</td>
                  <td className="p-3 text-slate-400">Spraying immediately before rainfall or inside ecologically sensitive buffers.</td>
                  <td className="p-3 text-emerald-300 font-medium">Real-time weather risk lockout (&gt;75% rain probability) + geofenced riparian buffer shutoff.</td>
                  <td className="p-3 font-mono text-slate-200">Zero liters applied within restricted buffer zones or storm windows.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-rose-300">Lack of operator trust & unexplainable advice</td>
                  <td className="p-3 text-slate-400">Black-box AI recommendations that contradict ground-truth field conditions.</td>
                  <td className="p-3 text-emerald-300 font-medium">Deterministic audit trail with causal 'Why Did SOIL IQ Stop?' explanation graph.</td>
                  <td className="p-3 font-mono text-slate-200">100% auditable event provenance linked to session correlation ID.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 38: Final Competitive Differentiation */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Market Positioning
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Competitive Differentiation Matrix</h2>
            <p className="text-xs text-slate-400 mt-1">
              SOIL IQ does not compete as a point solution; it integrates all layers into one unified operational loop.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Solution Type</th>
                  <th className="p-3 text-center">Spatial Grids</th>
                  <th className="p-3 text-center">Real-Time</th>
                  <th className="p-3 text-center">Machine-Linked</th>
                  <th className="p-3 text-center">Environmental</th>
                  <th className="p-3 text-center">Closed-Loop</th>
                  <th className="p-3 text-center">Auditable</th>
                  <th className="p-3 text-center">Impact Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-3 font-semibold text-slate-400">Fertilizer Calculator</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-500">Partial</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400">Soil-Health Dashboard</td>
                  <td className="p-3 text-center text-emerald-400">✓</td>
                  <td className="p-3 text-center text-slate-500">Hourly</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-500">Partial</td>
                  <td className="p-3 text-center text-slate-500">Partial</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400">Farm Weather App</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-emerald-400">✓</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-emerald-400">✓</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400">Farm ERP / Management</td>
                  <td className="p-3 text-center text-slate-500">Field-level</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-emerald-400">✓</td>
                  <td className="p-3 text-center text-slate-500">Accounting</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-400">AI Agronomy Chatbot</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                  <td className="p-3 text-center text-slate-600">✗</td>
                </tr>
                <tr className="bg-emerald-950/40 font-bold border-t-2 border-emerald-700">
                  <td className="p-3 text-emerald-300">SOIL IQ Platform</td>
                  <td className="p-3 text-center text-emerald-400">✓ (Sub-acre)</td>
                  <td className="p-3 text-center text-emerald-400">✓ (5 Hz RTK)</td>
                  <td className="p-3 text-center text-emerald-400">✓ (ISOBUS/PWM)</td>
                  <td className="p-3 text-center text-emerald-400">✓ (Risk lockouts)</td>
                  <td className="p-3 text-center text-emerald-400">✓ (Closed-loop)</td>
                  <td className="p-3 text-center text-emerald-400">✓ (Immutable logs)</td>
                  <td className="p-3 text-center text-emerald-400">✓ (kg & $ savings)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>SOIL IQ Technical Architecture &mdash; SustainX Hackathon</span>
          <div className="flex gap-4">
            <a href="/judge/objections" className="text-emerald-400 hover:underline">
              View Judge Objections &rarr;
            </a>
            <a href="/validation" className="text-emerald-400 hover:underline">
              View Claims Validation &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
