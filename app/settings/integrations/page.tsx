'use client';

import React, { useState } from 'react';

export default function IntegrationsArchitecturePage() {
  const [numGrids, setNumGrids] = useState<number>(20);
  const [numSensors, setNumSensors] = useState<number>(5);
  const [numSprayers, setNumSprayers] = useState<number>(1);
  const [numGateways, setNumGateways] = useState<number>(1);

  // Configurable placeholder costs (clearly labeled "Demo estimate - replace with vendor pricing")
  const sensorCost = 120; // $120 per soil probe
  const rtkCost = 850; // $850 per RTK-GNSS kit
  const flowCost = 340; // $340 per flow meter
  const gatewayCost = 280; // $280 per edge gateway

  const totalSensorCost = numSensors * sensorCost;
  const totalRtkCost = numSprayers * rtkCost;
  const totalFlowCost = numSprayers * flowCost;
  const totalGatewayCost = numGateways * gatewayCost;
  const totalHardwareEstimate = totalSensorCost + totalRtkCost + totalFlowCost + totalGatewayCost;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Hardware Architecture & Deployment Estimator
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Hardware Integration Map & Cost Modeling</h1>
            <p className="text-xs text-slate-400 mt-1">
              Dataflow pipeline from physical agricultural sensors to edge controllers, MQTT brokers, and cloud decision engines.
            </p>
          </div>
          <a
            href="/judge"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Judge Mode
          </a>
        </div>

        {/* Visual Integration Flow Diagram */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            End-to-End Physical & Cloud Hardware Integration Dataflow
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs text-center font-mono">
            {/* Stage 1 */}
            <div className="rounded-xl border border-emerald-800/60 bg-slate-950/80 p-3 space-y-1">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">1. Field Sensors</div>
              <div className="font-bold text-white text-sm">Soil Probes & RTK</div>
              <div className="text-[10px] text-slate-400">Moisture, Temp, EC, NMEA GNSS</div>
            </div>

            {/* Stage 2 */}
            <div className="rounded-xl border border-blue-800/60 bg-slate-950/80 p-3 space-y-1">
              <div className="text-[10px] text-blue-400 font-bold uppercase">2. Local Bridge</div>
              <div className="font-bold text-white text-sm">LoRa / ISOBUS</div>
              <div className="text-[10px] text-slate-400">868/915 MHz, CAN-bus 250kbps</div>
            </div>

            {/* Stage 3 */}
            <div className="rounded-xl border border-purple-800/60 bg-slate-950/80 p-3 space-y-1">
              <div className="text-[10px] text-purple-400 font-bold uppercase">3. Edge Controller</div>
              <div className="font-bold text-white text-sm">EdgeGateway</div>
              <div className="text-[10px] text-slate-400">Active Rx cache & offline buffer</div>
            </div>

            {/* Stage 4 */}
            <div className="rounded-xl border border-amber-800/60 bg-slate-950/80 p-3 space-y-1">
              <div className="text-[10px] text-amber-400 font-bold uppercase">4. Transport</div>
              <div className="font-bold text-white text-sm">MQTT / TLS</div>
              <div className="text-[10px] text-slate-400">JSON/Protobuf Envelopes</div>
            </div>

            {/* Stage 5 */}
            <div className="rounded-xl border border-emerald-600 bg-emerald-950/80 p-3 space-y-1">
              <div className="text-[10px] text-emerald-300 font-bold uppercase">5. SOIL IQ Cloud</div>
              <div className="font-bold text-white text-sm">Control Engine</div>
              <div className="text-[10px] text-emerald-300">Spatial Grid Resolution & Ledger</div>
            </div>
          </div>
        </div>

        {/* Hardware Deployment Cost Estimator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">Prototype Hardware Cost Calculator</h2>
              <p className="text-xs text-slate-400">
                Estimate physical equipment costs required to deploy SOIL IQ on a commercial farm.
              </p>
            </div>
            <span className="rounded bg-amber-950 border border-amber-700/50 px-2.5 py-1 text-[10px] font-bold text-amber-300">
              Demo estimate — replace with vendor pricing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Number of Spatial Grids</label>
              <input
                type="number"
                value={numGrids}
                onChange={(e) => setNumGrids(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Soil Sensor Nodes</label>
              <input
                type="number"
                value={numSensors}
                onChange={(e) => setNumSensors(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Tractor Sprayers</label>
              <input
                type="number"
                value={numSprayers}
                onChange={(e) => setNumSprayers(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Field LoRa Gateways</label>
              <input
                type="number"
                value={numGateways}
                onChange={(e) => setNumGateways(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Hardware Category</th>
                  <th className="p-3">Unit Benchmark</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-3 font-semibold text-white">In-Situ Soil Sensor Nodes (LoRaWAN)</td>
                  <td className="p-3 font-mono">${sensorCost}</td>
                  <td className="p-3 font-mono">{numSensors}</td>
                  <td className="p-3 text-right font-mono text-emerald-400">${totalSensorCost}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Dual-Frequency RTK-GNSS Receiver Kit</td>
                  <td className="p-3 font-mono">${rtkCost}</td>
                  <td className="p-3 font-mono">{numSprayers}</td>
                  <td className="p-3 text-right font-mono text-emerald-400">${totalRtkCost}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Electromagnetic Flow Meter & Totalizer</td>
                  <td className="p-3 font-mono">${flowCost}</td>
                  <td className="p-3 font-mono">{numSprayers}</td>
                  <td className="p-3 text-right font-mono text-emerald-400">${totalFlowCost}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Solar-Powered Field LoRaWAN Gateway</td>
                  <td className="p-3 font-mono">${gatewayCost}</td>
                  <td className="p-3 font-mono">{numGateways}</td>
                  <td className="p-3 text-right font-mono text-emerald-400">${totalGatewayCost}</td>
                </tr>
                <tr className="bg-slate-900/60 font-bold text-white text-sm">
                  <td className="p-3" colSpan={3}>Estimated Total Initial Hardware Investment</td>
                  <td className="p-3 text-right font-mono text-emerald-400">${totalHardwareEstimate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
