'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Layers, MapPin, Check, Sparkles } from 'lucide-react';
import { calculatePolygonAreaHectares, hectaresToAcres } from '@/lib/domain/units';

interface CreateFieldModalProps {
  farmId: string;
  farmName: string;
  crops: { id: string; name: string }[];
}

export function CreateFieldModal({ farmId, farmName, crops }: CreateFieldModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [cropId, setCropId] = useState(crops[0]?.id || '');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [soilType, setSoilType] = useState('LOAM');
  const [irrigationMethod, setIrrigationMethod] = useState('DRIP');
  const [gridSizeMeters, setGridSizeMeters] = useState(30);

  // Polygon coordinates [ [lon, lat], ... ]
  const samplePolygon: [number, number][] = [
    [-93.625, 41.592],
    [-93.620, 41.592],
    [-93.620, 41.594],
    [-93.625, 41.594],
    [-93.625, 41.592],
  ];

  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>(samplePolygon);
  const [calculatedAreaHa, setCalculatedAreaHa] = useState<number>(() =>
    calculatePolygonAreaHectares(samplePolygon)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSample = () => {
    setPolygonCoords(samplePolygon);
    const area = calculatePolygonAreaHectares(samplePolygon);
    setCalculatedAreaHa(area);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const boundaryGeoJson = JSON.stringify({
        type: 'Polygon',
        coordinates: [polygonCoords],
      });

      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          name,
          cropId,
          growthStage,
          soilType,
          irrigationMethod,
          boundaryGeoJson,
          gridSizeMeters: Number(gridSizeMeters),
          generateGridsNow: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create field');
      }

      setIsOpen(false);
      setName('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-950"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Define New Field Parcel</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e3324] bg-[#0c160f]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-900/60 text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Create Field Boundary & Spatial Grids</h3>
                  <p className="text-[11px] text-[#76937e]">Farm: <span className="text-emerald-300 font-medium">{farmName}</span></p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#76937e] hover:text-white rounded-lg hover:bg-[#152419]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-medium text-emerald-200 mb-1">Field Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. South Parcel 06 - Soybean"
                  className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-[#556e5a]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Assigned Crop</label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Initial Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Tillering">Tillering</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Ripening">Ripening / Bulking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Soil Texture Class</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOAM">Loam</option>
                    <option value="CLAY_LOAM">Clay Loam</option>
                    <option value="SANDY_LOAM">Sandy Loam</option>
                    <option value="SILT_LOAM">Silt Loam</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Irrigation Method</label>
                  <select
                    value={irrigationMethod}
                    onChange={(e) => setIrrigationMethod(e.target.value)}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DRIP">Drip Irrigation</option>
                    <option value="SPRINKLER">Center Pivot / Sprinkler</option>
                    <option value="FLOOD">Surface Furrow / Flood</option>
                    <option value="RAINFED">Rainfed</option>
                  </select>
                </div>
              </div>

              {/* Spatial Boundary Definition */}
              <div className="bg-[#121f15] p-3.5 rounded-lg border border-[#1e3324] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Spatial Boundary Polygon
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Load Prototype Coordinates</span>
                  </button>
                </div>

                <div className="p-2.5 bg-[#0a120c] rounded border border-[#1e3324] font-mono text-[11px] text-[#8ca893] max-h-20 overflow-y-auto">
                  {JSON.stringify(polygonCoords)}
                </div>

                <div className="flex items-center justify-between text-xs text-[#8ca893]">
                  <span>Derived Geometry Area:</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {calculatedAreaHa} ha ({hectaresToAcres(calculatedAreaHa)} acres)
                  </span>
                </div>
              </div>

              {/* Grid Engine Config */}
              <div className="bg-[#121f15] p-3.5 rounded-lg border border-[#1e3324] space-y-2">
                <label className="block font-medium text-emerald-200">
                  Automatic Spatial Grid Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 30, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setGridSizeMeters(size)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        gridSizeMeters === size
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold'
                          : 'bg-[#142318] border-[#1e3324] text-[#8ca893] hover:text-white'
                      }`}
                    >
                      {size}m × {size}m
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#6b8571] leading-relaxed">
                  The Grid Engine will clip discrete cells strictly to the field polygon and initialize individual nutrient budgets.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#1e3324]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 font-medium text-[#8ca893] hover:text-white rounded-lg hover:bg-[#152419]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Generating Grids...' : 'Save Field & Build Grids'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
