'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AnalyticsChartsProps {
  nutrientData: { nutrient: string; consumed: number; recommended: number }[];
  statusData: { name: string; value: number; color: string }[];
  cropData: { name: string; value: number }[];
}

export function AnalyticsCharts({
  nutrientData,
  statusData,
  cropData,
}: AnalyticsChartsProps) {
  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Nutrient Budget Utilization */}
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Elemental Nutrient Budget vs Consumed (kg/ha)
          </h3>
          <p className="text-[11px] text-[#76937e]">
            Aggregate elemental N, P, and K application progress
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutrientData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="nutrient" stroke="#6b8571" fontSize={11} />
              <YAxis stroke="#6b8571" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c160f',
                  border: '1px solid #1e3324',
                  borderRadius: '8px',
                  color: '#f0fdf4',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8ca893' }} />
              <Bar dataKey="consumed" name="Consumed to Date" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recommended" name="Budget Ceiling" fill="#1e3324" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Grid Compliance Distribution */}
      <div className="bg-[#0f1b12] border border-[#1e3324] rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Spatial Grid Compliance Distribution
          </h3>
          <p className="text-[11px] text-[#76937e]">
            Ratio of optimal, caution, excess-risk, and locked grid cells
          </p>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c160f',
                  border: '1px solid #1e3324',
                  borderRadius: '8px',
                  color: '#f0fdf4',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8ca893' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
