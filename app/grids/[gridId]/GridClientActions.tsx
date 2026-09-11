'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Sparkles,
  Info,
  CheckCircle,
  Lock,
  Unlock,
  Droplet,
  FileSpreadsheet,
} from 'lucide-react';
import { RecordApplicationModal } from '@/components/ui/RecordApplicationModal';
import { ExplainCalculationModal } from '@/components/ui/ExplainCalculationModal';

interface GridClientActionsProps {
  grid: {
    id: string;
    gridCode: string;
    status: string;
    isBlocked: boolean;
  };
  fertilizers: { id: string; name: string; formulation: string; defaultUnit: string }[];
  activePrescription: any;
}

export function GridClientActions({
  grid,
  fertilizers,
  activePrescription,
}: GridClientActionsProps) {
  const router = useRouter();
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate Prescription Action
  const handleGeneratePrescription = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/prescriptions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridId: grid.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate prescription');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error generating prescription');
    } finally {
      setIsGenerating(false);
    }
  };

  // Approve Prescription Action
  const handleApprovePrescription = async () => {
    if (!activePrescription) return;
    setIsApproving(true);
    setError(null);
    try {
      const res = await fetch(`/api/prescriptions/${activePrescription.id}/approve`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to approve prescription');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error approving prescription');
    } finally {
      setIsApproving(false);
    }
  };

  // Toggle Grid Lock / Block Action
  const handleToggleLock = async () => {
    setIsLocking(true);
    try {
      const res = await fetch(`/api/grids/${grid.id}/toggle-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockReason: grid.isBlocked ? null : 'Manual operator restriction applied from Grid Details.',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to toggle lock');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error toggling lock');
    } finally {
      setIsLocking(false);
    }
  };

  const parsedTrace = activePrescription?.calculationTraceJson
    ? JSON.parse(activePrescription.calculationTraceJson)
    : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Record Application Button */}
        <button
          onClick={() => setIsAppModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-950"
        >
          <Droplet className="w-3.5 h-3.5" />
          <span>Record Application</span>
        </button>

        {/* Generate Prescription Button */}
        <button
          onClick={handleGeneratePrescription}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#142318] hover:bg-[#1a2e20] text-emerald-300 border border-[#203626] rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isGenerating ? 'Calculating...' : 'Generate Prescription'}</span>
        </button>

        {/* Explain Calculation Button */}
        {parsedTrace && (
          <button
            onClick={() => setIsTraceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#121f15] hover:bg-[#182a1d] text-[#8ca893] hover:text-white border border-[#1e3324] rounded-lg text-xs font-medium transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Explain Calculation</span>
          </button>
        )}

        {/* Approve Prescription Button */}
        {activePrescription && activePrescription.status === 'READY' && (
          <button
            onClick={handleApprovePrescription}
            disabled={isApproving}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isApproving ? 'Activating...' : 'Approve Prescription'}</span>
          </button>
        )}

        {/* Manual Lock / Block Toggle */}
        <button
          onClick={handleToggleLock}
          disabled={isLocking}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            grid.isBlocked
              ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/60'
              : 'bg-[#121f15] border-[#1e3324] text-[#8ca893] hover:text-white'
          }`}
        >
          {grid.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{grid.isBlocked ? 'Remove Restriction' : 'Lock / Block Grid'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Record Application Modal */}
      <RecordApplicationModal
        gridId={grid.id}
        gridCode={grid.gridCode}
        fertilizers={fertilizers}
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {/* Explain Calculation Modal */}
      {parsedTrace && (
        <ExplainCalculationModal
          prescriptionCode={activePrescription.code}
          trace={parsedTrace}
          isOpen={isTraceModalOpen}
          onClose={() => setIsTraceModalOpen(false)}
        />
      )}
    </>
  );
}
