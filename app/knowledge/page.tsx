// SOIL IQ - Agronomic & Operations Knowledge Base
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db/prisma';
import {
  BookOpen,
  Search,
  Layers,
  ExternalLink,
  ShieldCheck,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function KnowledgeBasePage() {
  const articles = await prisma.knowledgeArticle.findMany({
    include: { source: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = [
    'ALL',
    'SOIL',
    'FERTILIZER',
    'CROPS',
    'SENSORS',
    'MACHINES',
    'ENVIRONMENT',
    'SOIL_IQ',
    'OPERATIONS',
  ];

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/workspace" className="hover:text-emerald-400">Workspace</Link>
            <span>/</span>
            <span>Agronomic Knowledge Base</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            Agronomic & Precision Ag Knowledge Base
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Peer-reviewed literature, government extraction standards, and machinery operating procedures.
          </p>
        </div>

        <div className="text-xs text-[#718d78] max-w-xs text-right">
          Scientific Provenance: Articles cite accredited government & university sources (ICAR, FAO, University Extension).
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {categories.map((c) => (
          <button
            key={c}
            className={`px-3 py-1.5 rounded-lg font-medium border transition-colors ${
              c === 'ALL'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-[#0f1d13] text-[#8ca893] border-[#1e3825] hover:text-white hover:bg-[#152a1b]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-emerald-600/60 transition-all shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#132417] text-emerald-300 border border-[#203d27] uppercase tracking-wider">
                  {art.category}
                </span>
                <span className="text-[10px] text-[#718d78]">v{art.version}</span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{art.title}</h3>
              <p className="text-xs text-[#8ca893] leading-relaxed">{art.summary}</p>
            </div>

            <div className="pt-3 border-t border-[#172c1c] text-xs space-y-2">
              <p className="text-[#c2d6c7] text-[11px] leading-relaxed line-clamp-3 bg-[#08120a] p-2.5 rounded-lg border border-[#172b1c]">
                {art.content}
              </p>

              {art.source && (
                <div className="flex items-center justify-between text-[10px] text-[#718d78] pt-1">
                  <span className="truncate max-w-[200px]">Source: {art.source.publisher}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 font-mono">
                    {art.source.sourceType}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
