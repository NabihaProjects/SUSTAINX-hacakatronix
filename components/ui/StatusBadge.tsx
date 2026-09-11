import React from 'react';

export type StatusType = 'OPTIMAL' | 'CAUTION' | 'EXCESS_RISK' | 'BLOCKED' | 'UNKNOWN' | 'ACTIVE' | 'ONLINE' | 'OFFLINE' | 'READY' | 'APPROVED' | 'SUPERSEDED' | 'DRAFT';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const norm = (status || 'UNKNOWN').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (norm === 'OPTIMAL' || norm === 'ACTIVE' || norm === 'ONLINE' || norm === 'APPROVED') {
    colorClasses = 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    dotColor = 'bg-emerald-400';
  } else if (norm === 'CAUTION' || norm === 'READY') {
    colorClasses = 'bg-amber-950/70 text-amber-300 border-amber-800/60';
    dotColor = 'bg-amber-400';
  } else if (norm === 'EXCESS_RISK' || norm === 'ERROR') {
    colorClasses = 'bg-rose-950/70 text-rose-300 border-rose-800/60';
    dotColor = 'bg-rose-400 animate-pulse';
  } else if (norm === 'BLOCKED') {
    colorClasses = 'bg-zinc-900 text-zinc-400 border-zinc-700';
    dotColor = 'bg-red-500';
  }

  const label = norm.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full uppercase tracking-wider ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
