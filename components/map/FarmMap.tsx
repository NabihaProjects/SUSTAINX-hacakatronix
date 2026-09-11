'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lock,
  ChevronRight,
  Droplet,
  Beaker,
  FileSpreadsheet,
  PlusCircle,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { NutrientProgressBar } from '@/components/ui/NutrientProgressBar';
import { formatArea } from '@/lib/domain/units';

export interface MapGridItem {
  id: string;
  gridCode: string;
  fieldName: string;
  fieldId: string;
  farmName?: string;
  cropName?: string;
  growthStage?: string;
  soilType?: string;
  calculatedArea: number;
  status: 'OPTIMAL' | 'CAUTION' | 'EXCESS_RISK' | 'BLOCKED' | 'UNKNOWN';
  geometryGeoJson: string;
  nutrientBudget?: {
    recommendedN: number;
    recommendedP: number;
    recommendedK: number;
    consumedN: number;
    consumedP: number;
    consumedK: number;
    remainingN: number;
    remainingP: number;
    remainingK: number;
    excessN?: number;
    excessP?: number;
    excessK?: number;
  } | null;
  soilProfile?: {
    ph: number;
    organicCarbonPct: number;
    moisturePct: number;
    ecDsm: number;
    availableNPpm: number;
    availablePPpm: number;
    availableKPpm: number;
    source: string;
  } | null;
  activePrescription?: {
    code: string;
    targetRateKgHa: number;
    minRateKgHa: number;
    maxRateKgHa: number;
    fertilizerName?: string;
    confidenceLevel: string;
  } | null;
}

export interface MapBoundaryItem {
  id: string;
  name: string;
  boundaryGeoJson: string;
  cropName?: string;
}

export interface MapSprayerItem {
  id: string;
  name: string;
  model: string;
  latitude: number;
  longitude: number;
  status: string;
  applicationRate: number;
  currentGridCode?: string | null;
  headingDeg?: number;
  decision?: string;
}

export interface MapTrailItem {
  latitude: number;
  longitude: number;
  decision: string;
  applicationRateKgHa?: number;
}

interface FarmMapProps {
  grids: MapGridItem[];
  fields?: MapBoundaryItem[];
  sprayers?: MapSprayerItem[];
  applicationTrail?: MapTrailItem[];
  activeGridCode?: string | null;
  centerLat?: number;
  centerLon?: number;
  height?: string;
  onSelectGrid?: (grid: MapGridItem) => void;
  selectedGridId?: string;
  enableDrawing?: boolean;
  onSaveDrawnBoundary?: (geojson: string, calculatedAreaHa: number) => void;
}

export function FarmMap({
  grids = [],
  fields = [],
  sprayers = [],
  applicationTrail = [],
  activeGridCode,
  centerLat = 41.588,
  centerLon = -93.623,
  height = '580px',
  onSelectGrid,
  selectedGridId,
  enableDrawing = false,
  onSaveDrawnBoundary,
}: FarmMapProps) {
  const [selectedGrid, setSelectedGrid] = useState<MapGridItem | null>(null);
  const [activeLayer, setActiveLayer] = useState<'SOIL' | 'PRESCRIPTION' | 'APPLICATION'>('SOIL');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Sync external selectedGridId if provided
  useEffect(() => {
    if (selectedGridId) {
      const found = grids.find((g) => g.id === selectedGridId);
      if (found) setSelectedGrid(found);
    } else if (grids.length > 0 && !selectedGrid) {
      setSelectedGrid(grids[0]);
    }
  }, [selectedGridId, grids]);

  const handleGridClick = (grid: MapGridItem) => {
    setSelectedGrid(grid);
    if (onSelectGrid) onSelectGrid(grid);
  };

  const getStatusColor = (status: string, layer: 'SOIL' | 'PRESCRIPTION' | 'APPLICATION') => {
    if (status === 'BLOCKED') return { fill: '#334155', border: '#475569', text: 'Blocked' };
    if (status === 'EXCESS_RISK') return { fill: '#991b1b', border: '#ef4444', text: 'Excess Risk' };
    if (status === 'CAUTION') return { fill: '#854d0e', border: '#f59e0b', text: 'Caution' };
    if (status === 'OPTIMAL') return { fill: '#14532d', border: '#22c55e', text: 'Optimal' };
    return { fill: '#1e293b', border: '#334155', text: 'Unknown' };
  };

  // Convert geo coordinates to SVG container points
  const minLon = centerLon - 0.005;
  const maxLon = centerLon + 0.005;
  const minLat = centerLat - 0.004;
  const maxLat = centerLat + 0.004;

  const projectToSvg = (lon: number, lat: number) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * 600;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 450;
    return [x, y];
  };

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full rounded-xl overflow-hidden border border-[#1e3324] bg-[#0a140e] select-none shadow-md flex"
      style={{ height }}
    >
      {/* Map Canvas Viewport */}
      <div
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          if (isDrawingMode) return;
          setIsDragging(true);
          setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        }}
        onMouseMove={(e) => {
          if (!isDragging) return;
          setPanOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* SVG Vector Map Rendering */}
        <svg
          viewBox="0 0 600 450"
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Subtle Agricultural Satellite Coordinate Grid Lines */}
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#16281b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="600" height="450" fill="url(#gridPattern)" />

          {/* Field Boundaries */}
          {fields.map((field) => {
            try {
              const parsed = JSON.parse(field.boundaryGeoJson);
              const coords = parsed.coordinates?.[0] || parsed.geometry?.coordinates?.[0];
              if (!coords) return null;

              const pointsStr = coords
                .map(([lon, lat]: [number, number]) => {
                  const [px, py] = projectToSvg(lon, lat);
                  return `${px},${py}`;
                })
                .join(' ');

              return (
                <g key={field.id}>
                  <polygon
                    points={pointsStr}
                    fill="none"
                    stroke="#2a4d33"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                  />
                </g>
              );
            } catch {
              return null;
            }
          })}

          {/* Grid Polygons */}
          {grids.map((grid) => {
            try {
              const parsed = JSON.parse(grid.geometryGeoJson);
              const coords = parsed.coordinates?.[0] || parsed.geometry?.coordinates?.[0];
              if (!coords) return null;

              const pointsStr = coords
                .map(([lon, lat]: [number, number]) => {
                  const [px, py] = projectToSvg(lon, lat);
                  return `${px},${py}`;
                })
                .join(' ');

              const isSelected = selectedGrid?.id === grid.id;
              const isActiveGrid = activeGridCode && grid.gridCode === activeGridCode;
              const color = getStatusColor(grid.status, activeLayer);

              // Calculate centroid for code label
              let cx = 0;
              let cy = 0;
              coords.slice(0, 4).forEach(([lon, lat]: [number, number]) => {
                const [px, py] = projectToSvg(lon, lat);
                cx += px;
                cy += py;
              });
              cx /= 4;
              cy /= 4;

              return (
                <g key={grid.id} onClick={() => handleGridClick(grid)} className="cursor-pointer group">
                  <polygon
                    points={pointsStr}
                    fill={color.fill}
                    fillOpacity={isActiveGrid ? 0.9 : isSelected ? 0.85 : 0.55}
                    stroke={isActiveGrid ? '#38bdf8' : isSelected ? '#ffffff' : color.border}
                    strokeWidth={isActiveGrid ? 3 : isSelected ? 2.5 : 1.2}
                    className={`transition-all duration-200 hover:fill-opacity-90 ${isActiveGrid ? 'animate-pulse' : ''}`}
                  />
                  <text
                    x={cx}
                    y={cy - 2}
                    textAnchor="middle"
                    fill="#f0fdf4"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {grid.gridCode}
                  </text>
                  <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    fill={color.border}
                    fontSize="7"
                    fontFamily="sans-serif"
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {grid.nutrientBudget ? `${Math.round((grid.nutrientBudget.consumedN / grid.nutrientBudget.recommendedN) * 100)}% N` : color.text}
                  </text>
                </g>
              );
            } catch {
              return null;
            }
          })}

          {/* Application Swath Trail */}
          {applicationTrail.length > 0 && (
            <g className="application-trail pointer-events-none">
              {applicationTrail.map((pt, idx) => {
                const [tx, ty] = projectToSvg(pt.longitude, pt.latitude);
                const trailColor =
                  pt.decision === 'STOP'
                    ? '#ef4444'
                    : pt.decision === 'REDUCE'
                    ? '#f59e0b'
                    : pt.decision === 'MANUAL_OVERRIDE'
                    ? '#a855f7'
                    : '#22c55e';
                return (
                  <circle
                    key={`trail-${idx}`}
                    cx={tx}
                    cy={ty}
                    r={idx === applicationTrail.length - 1 ? 4.5 : 3}
                    fill={trailColor}
                    fillOpacity={idx === applicationTrail.length - 1 ? 0.9 : 0.55}
                  />
                );
              })}
            </g>
          )}

          {/* Active Sprayer Marker with Heading Orientation */}
          {sprayers.map((sprayer) => {
            const [sx, sy] = projectToSvg(sprayer.longitude, sprayer.latitude);
            const heading = sprayer.headingDeg || 0;
            const statusColor =
              sprayer.decision === 'STOP'
                ? '#ef4444'
                : sprayer.decision === 'REDUCE'
                ? '#f59e0b'
                : sprayer.decision === 'MANUAL_OVERRIDE'
                ? '#a855f7'
                : '#10b981';

            return (
              <g key={sprayer.id} className="transition-all duration-300">
                <circle cx={sx} cy={sy} r="16" fill={statusColor} fillOpacity="0.25" className="animate-ping" />
                <circle cx={sx} cy={sy} r="8" fill={statusColor} stroke="#ffffff" strokeWidth="2" />
                <g transform={`translate(${sx}, ${sy}) rotate(${heading})`}>
                  <path
                    d="M 0 -11 L 5 4 L 0 1 L -5 4 Z"
                    fill="#ffffff"
                    stroke={statusColor}
                    strokeWidth="1"
                  />
                </g>
                <text
                  x={sx}
                  y={sy + 18}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  className="bg-black px-1"
                >
                  {sprayer.name} ({sprayer.applicationRate} kg/ha)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map Header Floating Layer Selector */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#0e1a12]/90 backdrop-blur border border-[#1e3324] rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveLayer('SOIL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeLayer === 'SOIL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#8ca893] hover:text-white'
            }`}
          >
            Soil Status
          </button>
          <button
            onClick={() => setActiveLayer('PRESCRIPTION')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeLayer === 'PRESCRIPTION'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#8ca893] hover:text-white'
            }`}
          >
            Prescription
          </button>
          <button
            onClick={() => setActiveLayer('APPLICATION')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeLayer === 'APPLICATION'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#8ca893] hover:text-white'
            }`}
          >
            Ledger Budget
          </button>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 bg-[#0e1a12]/90 backdrop-blur border border-[#1e3324] rounded-lg p-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1.5 text-[#8ca893] hover:text-white hover:bg-[#18281d] rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="p-1.5 text-[#8ca893] hover:text-white hover:bg-[#18281d] rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 text-[#8ca893] hover:text-white hover:bg-[#18281d] rounded"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-[#0e1a12]/90 backdrop-blur border border-[#1e3324] px-3 py-1.5 rounded-lg text-[11px] text-[#8ca893]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#14532d] border border-[#22c55e]" />
            Optimal (&lt;80%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#854d0e] border border-[#f59e0b]" />
            Caution (80-99%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#991b1b] border border-[#ef4444]" />
            Excess Risk (≥100%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#334155] border border-[#475569]" />
            Blocked
          </span>
        </div>
      </div>

      {/* Grid Inspector Drawer / Panel */}
      {selectedGrid && (
        <div className="w-80 lg:w-96 bg-[#0c160f] border-l border-[#1e3324] flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-[#1e3324] bg-[#09110b]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedGrid.gridCode}
                </span>
                <h3 className="text-sm font-semibold text-white mt-0.5">
                  {selectedGrid.fieldName}
                </h3>
              </div>
              <StatusBadge status={selectedGrid.status} size="sm" />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#8ca893]">
              <span>Area: <strong className="text-white font-mono">{formatArea(selectedGrid.calculatedArea, 'acre')}</strong></span>
              <span>Crop: <strong className="text-emerald-200">{selectedGrid.cropName || 'Crop Unset'}</strong></span>
              <span>Stage: <strong className="text-emerald-200">{selectedGrid.growthStage || 'Vegetative'}</strong></span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-5 flex-1">
            {/* Soil Snapshot */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Beaker className="w-3.5 h-3.5 text-emerald-400" />
                  Soil Snapshot
                </span>
                <span className="text-[10px] text-[#6b8571] uppercase font-mono">
                  {selectedGrid.soilProfile?.source || 'LAB TEST'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#121f15] p-2.5 rounded-lg border border-[#1e3324] text-xs">
                <div>
                  <div className="text-[#6b8571] text-[10px]">pH</div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    {selectedGrid.soilProfile?.ph || 6.5}
                  </div>
                </div>
                <div>
                  <div className="text-[#6b8571] text-[10px]">Org Carbon</div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    {selectedGrid.soilProfile?.organicCarbonPct || 1.2}%
                  </div>
                </div>
                <div>
                  <div className="text-[#6b8571] text-[10px]">Moisture</div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    {selectedGrid.soilProfile?.moisturePct || 22.0}%
                  </div>
                </div>
                <div className="col-span-3 pt-1 border-t border-[#1e3324]/50 flex justify-between text-[11px] text-[#8ca893]">
                  <span>Available N: <strong className="text-emerald-200 font-mono">{selectedGrid.soilProfile?.availableNPpm || 38} ppm</strong></span>
                  <span>P: <strong className="text-emerald-200 font-mono">{selectedGrid.soilProfile?.availablePPpm || 22} ppm</strong></span>
                  <span>K: <strong className="text-emerald-200 font-mono">{selectedGrid.soilProfile?.availableKPpm || 135} ppm</strong></span>
                </div>
              </div>
            </div>

            {/* Nutrient Budget Progress Bars */}
            {selectedGrid.nutrientBudget && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-emerald-400" />
                    Nutrient Ledger
                  </span>
                  <span className="text-[10px] text-[#6b8571] font-mono">kg pure / ha</span>
                </div>

                <NutrientProgressBar
                  nutrient="N"
                  consumed={selectedGrid.nutrientBudget.consumedN}
                  recommended={selectedGrid.nutrientBudget.recommendedN}
                  remaining={selectedGrid.nutrientBudget.remainingN}
                  excess={selectedGrid.nutrientBudget.excessN}
                />
                <NutrientProgressBar
                  nutrient="P"
                  consumed={selectedGrid.nutrientBudget.consumedP}
                  recommended={selectedGrid.nutrientBudget.recommendedP}
                  remaining={selectedGrid.nutrientBudget.remainingP}
                  excess={selectedGrid.nutrientBudget.excessP}
                />
                <NutrientProgressBar
                  nutrient="K"
                  consumed={selectedGrid.nutrientBudget.consumedK}
                  recommended={selectedGrid.nutrientBudget.recommendedK}
                  remaining={selectedGrid.nutrientBudget.remainingK}
                  excess={selectedGrid.nutrientBudget.excessK}
                />
              </div>
            )}

            {/* Active Prescription Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Prescription
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/50">
                  PROTOTYPE
                </span>
              </div>

              {selectedGrid.activePrescription ? (
                <div className="bg-[#121f15] p-3 rounded-lg border border-[#1e3324] text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#8ca893]">Code:</span>
                    <span className="font-mono font-medium text-emerald-300">{selectedGrid.activePrescription.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8ca893]">Target Rate:</span>
                    <span className="font-mono font-bold text-white">{selectedGrid.activePrescription.targetRateKgHa} kg/ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8ca893]">Safe Range:</span>
                    <span className="font-mono text-[#8ca893]">
                      {selectedGrid.activePrescription.minRateKgHa} - {selectedGrid.activePrescription.maxRateKgHa} kg/ha
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#111c14] p-3 rounded-lg border border-[#1e3324] text-center text-xs text-[#76937e]">
                  No active prescription. Ready for generation.
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-[#1e3324] bg-[#09110b] flex flex-col gap-2">
            <Link
              href={`/grids/${selectedGrid.id}`}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
            >
              <span>Inspect Complete Grid State</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
