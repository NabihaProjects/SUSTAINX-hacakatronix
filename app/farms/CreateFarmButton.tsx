'use client';

import React, { useState } from 'react';
import { Plus, X, Building2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateFarmButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [declaredArea, setDeclaredArea] = useState<number>(10);
  const [areaUnit, setAreaUnit] = useState<'acre' | 'hectare'>('acre');
  const [latitude, setLatitude] = useState<number>(41.5868);
  const [longitude, setLongitude] = useState<number>(-93.625);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          locationLabel,
          declaredArea: Number(declaredArea),
          areaUnit,
          latitude: Number(latitude),
          longitude: Number(longitude),
          description,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create farm');
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
        <span>Register New Farm</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e3324] bg-[#0c160f]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-900/60 text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">Register Agricultural Farm</h3>
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
                <label className="block font-medium text-emerald-200 mb-1">Farm Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. West Meadow Holding"
                  className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-[#556e5a]"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-emerald-200 mb-1">Location Label</label>
                <input
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g. Boone County, Iowa"
                  className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-[#556e5a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Declared Area</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={declaredArea}
                    onChange={(e) => setDeclaredArea(Number(e.target.value))}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Area Unit</label>
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as any)}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="acre">Acres</option>
                    <option value="hectare">Hectares</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-emerald-200 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-emerald-200 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational purpose, crop focus, or soil notes..."
                  className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 placeholder-[#556e5a]"
                />
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
                  <span>{isSubmitting ? 'Creating...' : 'Register Farm'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
