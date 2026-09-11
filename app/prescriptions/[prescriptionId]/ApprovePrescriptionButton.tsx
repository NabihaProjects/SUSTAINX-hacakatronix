'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface ApprovePrescriptionButtonProps {
  prescriptionId: string;
  status: string;
}

export function ApprovePrescriptionButton({
  prescriptionId,
  status,
}: ApprovePrescriptionButtonProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/approve`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to approve');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isApproving}
      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
    >
      <CheckCircle className="w-3.5 h-3.5" />
      <span>{isApproving ? 'Activating...' : 'Approve & Activate for Telemetry'}</span>
    </button>
  );
}
