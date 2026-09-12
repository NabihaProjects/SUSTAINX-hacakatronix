'use client';

import React, { useState } from 'react';

export default function DeviceProvisioningPage() {
  const [step, setStep] = useState<number>(1);
  const [deviceType, setDeviceType] = useState<string>('SOIL_SENSOR');
  const [deviceCode, setDeviceCode] = useState<string>('NODE-049');
  const [name, setName] = useState<string>('Field Soil Probe #49');
  const [farm, setFarm] = useState<string>('Green Valley Farm');
  const [gridCode, setGridCode] = useState<string>('F01-G003');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateCredentials = () => {
    // Simulated cryptographically secure token generation (SHA-256)
    const secret = `siq_sec_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    setGeneratedSecret(secret);
    setStep(7);
  };

  const copyToClipboard = () => {
    if (generatedSecret) {
      navigator.clipboard.writeText(generatedSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Enterprise Device Provisioning
          </span>
          <h1 className="text-2xl font-black text-white mt-1">Provision New Hardware Node</h1>
          <p className="text-xs text-slate-400 mt-1">
            Securely register soil probes, RTK receivers, flow meters, or edge gateways into your organization.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Step {step} of 8: {
              step === 1 ? 'Select Device Type' :
              step === 2 ? 'Identifier & Label' :
              step === 3 ? 'Assign Farm & Grid' :
              step === 4 ? 'Hardware Capabilities' :
              step === 5 ? 'Communication Protocol' :
              step === 6 ? 'Security Verification' :
              step === 7 ? 'Generate Credentials (1-Time View)' : 'Activation Complete'
            }</span>
            <span className="font-mono text-emerald-400">{Math.round((step / 8) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">1. Select Hardware Type</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { type: 'SOIL_SENSOR', label: 'Soil Sensor Node (In-Situ Probe)' },
                  { type: 'WEATHER_SENSOR', label: 'Microclimate Weather Station' },
                  { type: 'RTK_GNSS', label: 'Centimeter RTK-GNSS Receiver' },
                  { type: 'FLOW_METER', label: 'Electromagnetic Flow Meter' },
                  { type: 'TANK_SENSOR', label: 'Hydrostatic Chemical Tank Sensor' },
                  { type: 'EDGE_GATEWAY', label: 'Machine Edge Controller Gateway' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setDeviceType(item.type)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      deviceType === item.type
                        ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">2. Device Identifier & Human Label</h3>
              <div>
                <label className="block text-slate-400 mb-1">Unique Device Code / Serial</label>
                <input
                  type="text"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Friendly Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-slate-300"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">3. Assign Target Farm & Spatial Grid</h3>
              <div>
                <label className="block text-slate-400 mb-1">Assigned Farm</label>
                <input
                  type="text"
                  value={farm}
                  disabled
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-slate-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Target Grid Cell</label>
                <input
                  type="text"
                  value={gridCode}
                  onChange={(e) => setGridCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-slate-300"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleGenerateCredentials}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
                >
                  Generate Credentials &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 7 && generatedSecret && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-amber-800/60 bg-amber-950/40 p-4">
                <div className="font-bold text-amber-300 text-sm mb-1">
                  WARNING: One-Time Device Credential Exposure
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  This device secret will <strong>never be shown again</strong>. It is stored as an irreversible SHA-256 hash in the database. Copy and flash this token into your field hardware firmware before closing this dialog.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedSecret}
                    className="flex-1 rounded-lg border border-amber-700/50 bg-slate-950 px-3 py-2 font-mono text-amber-300 select-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-2 font-bold text-slate-950"
                  >
                    {copied ? 'Copied!' : 'Copy Secret'}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] space-y-1">
                <div>Device ID: <span className="text-white">{deviceCode}</span></div>
                <div>MQTT Client ID: <span className="text-emerald-400">siq_demo_{deviceCode.toLowerCase()}</span></div>
                <div>Broker Endpoint: <span className="text-white">mqtts://broker.soiliq.farm:8883</span></div>
                <div>Telemetry Topic: <span className="text-white">soil-iq/green-valley/devices/{deviceCode}/telemetry</span></div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(8)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-500"
                >
                  Confirm & Activate Device &rarr;
                </button>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold text-white">Device Successfully Provisioned & Active</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Device <strong>{deviceCode}</strong> is now registered and listening on secure MQTT topic channels.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href="/devices/inventory"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  View in Fleet Inventory
                </a>
                <button
                  onClick={() => {
                    setStep(1);
                    setGeneratedSecret(null);
                  }}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Provision Another Device
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
