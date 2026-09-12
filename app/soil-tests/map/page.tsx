'use client';

import React, { useState } from 'react';

interface MapSampleNode {
  id: string;
  code: string;
  gridCode: string;
  classification: 'DIRECT' | 'ESTIMATED' | 'NO_DATA';
  source: string;
  lab: string;
  date: string;
  depth: string;
  pVal: number;
  nVal: number;
  kVal: number;
  ph: number;
  ec: number;
  quality: 'HIGH' | 'MEDIUM' | 'LOW';
  distanceMeters: number;
}

const SAMPLE_NODES: MapSampleNode[] = [
  { id: '1', code: 'SMP-G041-01', gridCode: 'G041', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs', date: '2026-08-28', depth: '0-15 cm', pVal: 42, nVal: 185, kVal: 210, ph: 6.4, ec: 1.1, quality: 'HIGH', distanceMeters: 4.2 },
  { id: '2', code: 'SMP-G042-01', gridCode: 'G042', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs', date: '2026-08-28', depth: '0-15 cm', pVal: 44, nVal: 190, kVal: 215, ph: 6.5, ec: 1.2, quality: 'HIGH', distanceMeters: 5.1 },
  { id: '3', code: 'SMP-G043-01', gridCode: 'G043', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs', date: '2026-08-28', depth: '0-15 cm', pVal: 39, nVal: 178, kVal: 205, ph: 6.3, ec: 1.3, quality: 'HIGH', distanceMeters: 6.0 },
  { id: '4', code: 'SMP-G044-01', gridCode: 'G044', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs', date: '2026-08-28', depth: '0-15 cm', pVal: 41, nVal: 182, kVal: 212, ph: 6.4, ec: 1.1, quality: 'HIGH', distanceMeters: 3.8 },
  { id: '5', code: 'SMP-G045-EST', gridCode: 'G045', classification: 'ESTIMATED', source: 'ESTIMATED', lab: 'Interpolated from G044 & G046', date: '2026-08-30', depth: '0-15 cm', pVal: 38, nVal: 180, kVal: 208, ph: 6.4, ec: 1.2, quality: 'MEDIUM', distanceMeters: 74.5 },
  { id: '6', code: 'SMP-G046-01', gridCode: 'G046', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs', date: '2026-08-28', depth: '0-15 cm', pVal: 45, nVal: 192, kVal: 220, ph: 6.5, ec: 1.2, quality: 'HIGH', distanceMeters: 4.9 },
  { id: '7', code: 'SMP-G047-01', gridCode: 'G047', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs (NABL #1042)', date: '2026-08-28', depth: '0-15 cm', pVal: 44, nVal: 188, kVal: 212, ph: 6.4, ec: 1.2, quality: 'HIGH', distanceMeters: 2.5 },
  { id: '8', code: 'SMP-G048-01', gridCode: 'G048', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs', date: '2026-08-28', depth: '0-15 cm', pVal: 32, nVal: 210, kVal: 195, ph: 6.8, ec: 2.1, quality: 'HIGH', distanceMeters: 8.0 },
  { id: '9', code: 'SMP-G049-EST', gridCode: 'G049', classification: 'ESTIMATED', source: 'ESTIMATED', lab: 'Interpolated from G048 & G050', date: '2026-08-30', depth: '0-15 cm', pVal: 36, nVal: 195, kVal: 202, ph: 6.6, ec: 1.6, quality: 'MEDIUM', distanceMeters: 82.0 },
  { id: '10', code: 'SMP-G050-01', gridCode: 'G050', classification: 'DIRECT', source: 'LAB_SOIL_TEST', lab: 'National Ag Labs', date: '2026-08-28', depth: '0-15 cm', pVal: 40, nVal: 184, kVal: 208, ph: 6.5, ec: 1.2, quality: 'HIGH', distanceMeters: 5.5 },
];

export default function SoilSampleMapPage() {
  const [selectedNode, setSelectedNode] = useState<MapSampleNode>(SAMPLE_NODES[6]); // G047

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Spatial Coverage & Data Provenance
            </span>
            <h1 className="text-2xl font-black text-white mt-1">Soil Sample Spatial Map</h1>
            <p className="text-xs text-slate-400 mt-1">
              Visualizing laboratory core sample locations, spatial interpolation zones, and unsampled areas across Green Valley Farm.
            </p>
          </div>
          <a
            href="/soil-tests"
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-200 border border-slate-700"
          >
            &larr; Soil Dashboard
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spatial Grid Map Column */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Field 3 &bull; Sampling Density & Interpolation
              </span>
              <span className="text-xs text-slate-400">Tap cell to view assay</span>
            </div>

            <div className="relative aspect-video w-full bg-slate-950/90 rounded-xl border border-slate-800 p-3 overflow-hidden">
              <svg viewBox="0 0 500 240" className="w-full h-full">
                {/* Riparian buffer zone at bottom */}
                <rect x="20" y="190" width="460" height="40" rx="6" fill="#4c0519" stroke="#9f1239" strokeWidth="1" strokeDasharray="3 2" />
                <text x="35" y="215" fill="#fda4af" fontSize="11" fontWeight="bold">Riparian Buffer Strip (Ecologically Sensitive)</text>

                {/* 10 Grid Cells */}
                {SAMPLE_NODES.map((node, idx) => {
                  const row = Math.floor(idx / 5);
                  const col = idx % 5;
                  const x = 25 + col * 90;
                  const y = 20 + row * 85;
                  const isSelected = selectedNode.id === node.id;

                  const fillColor =
                    node.classification === 'DIRECT'
                      ? '#064e3b'
                      : node.classification === 'ESTIMATED'
                      ? '#78350f'
                      : '#334155';

                  const strokeColor =
                    node.classification === 'DIRECT'
                      ? '#10b981'
                      : node.classification === 'ESTIMATED'
                      ? '#f59e0b'
                      : '#64748b';

                  return (
                    <g key={node.id} onClick={() => setSelectedNode(node)} className="cursor-pointer">
                      <rect
                        x={x}
                        y={y}
                        width="80"
                        height="75"
                        rx="8"
                        fill={fillColor}
                        stroke={isSelected ? '#ffffff' : strokeColor}
                        strokeWidth={isSelected ? '3' : '1.5'}
                        opacity={isSelected ? 1 : 0.85}
                      />

                      {/* Sample core icon */}
                      <circle cx={x + 16} cy={y + 16} r="6" fill={strokeColor} stroke="#ffffff" strokeWidth="1" />
                      <text x={x + 16} y={y + 19} textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">
                        {node.classification === 'DIRECT' ? '●' : '▲'}
                      </text>

                      <text x={x + 40} y={y + 38} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                        {node.gridCode}
                      </text>
                      <text x={x + 40} y={y + 55} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                        P: {node.pVal} ppm
                      </text>
                      <text x={x + 40} y={y + 68} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
                        {node.classification}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Scientific Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <strong className="text-slate-200">DIRECT SAMPLE:</strong> Laboratory core sample (&le;15m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <strong className="text-slate-200">ESTIMATED:</strong> Spatial interpolation (&le;350m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                <strong className="text-slate-200">NO DATA:</strong> Sampling recommended
              </span>
            </div>
          </div>

          {/* Selected Sample Detail Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Assay Metadata</span>
                <h2 className="text-lg font-black text-white">{selectedNode.gridCode}</h2>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                selectedNode.classification === 'DIRECT'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}>
                {selectedNode.classification}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Sample Identifier:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedNode.code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Testing Lab:</span>
                <span className="text-slate-200 text-right truncate max-w-[180px]">{selectedNode.lab}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Collection Date:</span>
                <span className="font-mono text-slate-300">{selectedNode.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Core Depth:</span>
                <span className="text-slate-200">{selectedNode.depth}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Proximity to Cell Center:</span>
                <span className="font-mono text-emerald-400">{selectedNode.distanceMeters}m</span>
              </div>
            </div>

            {/* Nutrients Breakdown */}
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Chemical Concentrations</span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="rounded-lg bg-slate-900 p-2">
                  <span className="text-[10px] text-slate-400">Avail N</span>
                  <div className="font-bold text-white text-sm">{selectedNode.nVal}</div>
                  <span className="text-[9px] text-slate-500">kg/ha</span>
                </div>
                <div className="rounded-lg bg-slate-900 p-2">
                  <span className="text-[10px] text-slate-400">Bray-1 P</span>
                  <div className="font-bold text-emerald-400 text-sm">{selectedNode.pVal}</div>
                  <span className="text-[9px] text-slate-500">ppm</span>
                </div>
                <div className="rounded-lg bg-slate-900 p-2">
                  <span className="text-[10px] text-slate-400">Exch K</span>
                  <div className="font-bold text-slate-200 text-sm">{selectedNode.kVal}</div>
                  <span className="text-[9px] text-slate-500">ppm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono pt-1">
                <div className="rounded-lg bg-slate-900 p-1.5 text-xs">
                  <span className="text-[10px] text-slate-400">pH: </span>
                  <strong className="text-white">{selectedNode.ph}</strong>
                </div>
                <div className="rounded-lg bg-slate-900 p-1.5 text-xs">
                  <span className="text-[10px] text-slate-400">EC: </span>
                  <strong className="text-white">{selectedNode.ec} dS/m</strong>
                </div>
              </div>
            </div>

            <a
              href={`/soil-tests/sr-01`}
              className="block w-full text-center rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700"
            >
              View Full Lab Report (SR-2026-00412) &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
