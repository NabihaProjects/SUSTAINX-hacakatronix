'use client';

import React, { useState } from 'react';
import { X, Droplet, Check } from 'lucide-react';

interface RecordApplicationModalProps {
  gridId: string;
  gridCode: string;
  fertilizers: { id: string; name: string; formulation: string; defaultUnit: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordApplicationModal({
  gridId,
  gridCode,
  fertilizers,
  isOpen,
  onClose,
  onSuccess,
}: RecordApplicationModalProps) {
  const [fertilizerId, setFertilizerId] = useState(fertilizers[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(25);
  const [unit, setUnit] = useState<string>('kg');
  const [method, setMethod] = useState<'SPRAY' | 'BROADCAST' | 'FERTIGATION' | 'SIDE_DRESS'>('SPRAY');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gridId,
          fertilizerId,
          quantity: Number(quantity),
          unit,
          applicationMethod: method,
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to record application');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e3324] bg-[#0c160f]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-900/60 text-emerald-400">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Record Fertilizer Application</h3>
              <p className="text-[11px] text-[#76937e]">Grid: <span className="font-mono text-emerald-300 font-bold">{gridCode}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#76937e] hover:text-white rounded-lg hover:bg-[#152419]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Fertilizer Product */}
          <div>
            <label className="block text-xs font-medium text-emerald-200 mb-1.5">
              Fertilizer Formulation
            </label>
            <select
              value={fertilizerId}
              onChange={(e) => setFertilizerId(e.target.value)}
              className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {fertilizers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.formulation})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-emerald-200 mb-1.5">
                Applied Quantity
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-200 mb-1.5">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="kg">kg</option>
                <option value="L">L (Liters)</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Application Method */}
          <div>
            <label className="block text-xs font-medium text-emerald-200 mb-1.5">
              Application Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="SPRAY">Foliar Spray (Precision Nozzle)</option>
              <option value="BROADCAST">Broadcast Spreader</option>
              <option value="FERTIGATION">Drip Fertigation</option>
              <option value="SIDE_DRESS">Side-Dress Injection</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-emerald-200 mb-1.5">
              Agronomic Field Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Applied with low-drift coarse nozzles at 14 km/h."
              className="w-full bg-[#142318] border border-[#203626] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-[#556e5a]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1e3324]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-[#8ca893] hover:text-white rounded-lg hover:bg-[#152419]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Update Nutrient Ledger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
