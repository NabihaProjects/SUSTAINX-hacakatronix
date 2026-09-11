import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  badge?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  badge,
}: MetricCardProps) {
  return (
    <div
      className={`bg-[#111c14] border border-[#1e3324] rounded-xl p-5 shadow-sm hover:border-[#2a4734] transition-colors ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
          {title}
        </span>
        {icon && <div className="text-emerald-500/80 p-1.5 bg-emerald-950/40 rounded-lg border border-emerald-900/40">{icon}</div>}
        {badge}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-emerald-50 font-mono">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#8ca893] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
