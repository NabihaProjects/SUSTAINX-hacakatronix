'use client';

import React, { useState } from 'react';

export default function FarmerSoilEntryPage() {
  const [formData, setFormData] = useState({
    gridCode: 'G047',
    field: 'Field 3 (Rice)',
    collectionDate: new Date().toISOString().slice(0, 10),
    labName: 'Farmer On-Site Soil Kit / Manual Entry',
    pH: '6.5',
    ec: '1.2',
    organicCarbon: '0.85',
    nitrogen: '185',
    phosphorus: '45',
    potassium: '210',
    depthCm: '15',
    notes: 'Sampled with hand probe after moderate rain.',
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedMessage(`Manual soil record successfully logged for ${formData.gridCode}! Tagged as FARMER_ENTRY with medium confidence.`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Manual Agronomic Entry
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Farmer Soil Test Entry Form</h1>
            <p className="text-xs text-slate-400 mt-1">
              Record on-site chemical tests, paper report transcriptions, or hand-held optical measurements.
            </p>
          </div>
          <a
            href="/soil-tests"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Soil Dashboard
          </a>
        </div>

        {/* Provenance Alert */}
        <div className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-start gap-2.5">
          <span className="text-base">ℹ</span>
          <div>
            <strong className="text-white">Source Classification Notice: </strong>
            Manual farmer entries are explicitly tagged as <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">FARMER_ENTRY</code> with calibrated medium confidence (0.80) to prevent unvalidated overwriting of certified laboratory assays.
          </div>
        </div>

        {/* Success Banner */}
        {submittedMessage && (
          <div className="rounded-xl border border-emerald-700 bg-emerald-950/60 p-4 text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>{submittedMessage}</span>
            </div>
            <a
              href="/soil-tests"
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-slate-950"
            >
              View Dashboard
            </a>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Target Grid Code</label>
              <select
                value={formData.gridCode}
                onChange={(e) => setFormData({ ...formData, gridCode: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white"
              >
                {['G041', 'G042', 'G043', 'G044', 'G045', 'G046', 'G047', 'G048', 'G049', 'G050'].map((g) => (
                  <option key={g} value={g}>{g} &bull; Field 3 (Rice)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Collection Date</label>
              <input
                type="date"
                value={formData.collectionDate}
                onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Sampling Depth (cm)</label>
              <input
                type="number"
                value={formData.depthCm}
                onChange={(e) => setFormData({ ...formData, depthCm: e.target.value })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold text-xs">Testing Apparatus / Laboratory</label>
            <input
              type="text"
              value={formData.labName}
              onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white text-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
              Soil Chemistry Measurements
            </span>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Available N (kg/ha)</label>
                <input
                  type="number"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-emerald-400 mb-1 font-bold">Bray-1 P (ppm)</label>
                <input
                  type="number"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-emerald-700/80 p-2 text-emerald-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Exchangeable K (ppm)</label>
                <input
                  type="number"
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Soil pH (1:2.5)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pH}
                  onChange={(e) => setFormData({ ...formData, pH: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Conductivity (dS/m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.ec}
                  onChange={(e) => setFormData({ ...formData, ec: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Organic Carbon (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.organicCarbon}
                  onChange={(e) => setFormData({ ...formData, organicCarbon: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-xs">Field Notes & Observations</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2 text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-slate-950 shadow"
            >
              {submitting ? 'Submitting...' : 'Save Manual Soil Measurement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
