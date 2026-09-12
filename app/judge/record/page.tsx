'use client';

import React, { useState } from 'react';
import {
  JudgeSceneEngine,
  JudgeScene,
} from '@/lib/services/JudgeSceneEngine';
import {
  JudgeMachineCard,
  JudgeGridIntelligence,
  JudgeImpactPanel,
} from '../JudgePanels';

export default function JudgeRecordPage() {
  const [scene, setScene] = useState<JudgeScene>(JudgeSceneEngine.getCurrentScene());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleNext = () => setScene(JudgeSceneEngine.nextScene());
  const handlePrev = () => setScene(JudgeSceneEngine.previousScene());
  const handleReset = () => {
    setIsPlaying(false);
    setScene(JudgeSceneEngine.reset());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
      {/* Top Clean Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold text-lg tracking-wider text-white">SOIL IQ</span>
          <span className="text-xs text-slate-400">| PRESENTATION RECORDING MODE</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
          >
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
          <button
            onClick={handlePrev}
            className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold hover:bg-slate-700"
          >
            &larr; PREV
          </button>
          <button
            onClick={handleNext}
            className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold hover:bg-slate-700"
          >
            NEXT &rarr;
          </button>
          <button
            onClick={handleReset}
            className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold hover:bg-slate-700"
          >
            RESET
          </button>
          <a
            href="/judge"
            className="ml-3 rounded bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
          >
            Exit Recording Mode
          </a>
        </div>
      </div>

      {/* Main Grid: Machine, Grid, Impact */}
      <div className="my-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <JudgeMachineCard scene={scene} />
        <JudgeGridIntelligence scene={scene} />
        <JudgeImpactPanel scene={scene} />
      </div>

      {/* Footer Disclaimer */}
      <div className="border-t border-slate-900 pt-3 text-center text-[11px] text-slate-500">
        SOIL IQ Prototype Demonstration &bull; All field telemetry and outcomes simulated for demonstration validity.
      </div>
    </div>
  );
}
