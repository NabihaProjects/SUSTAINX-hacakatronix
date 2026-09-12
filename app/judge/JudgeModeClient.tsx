'use client';

import React, { useState, useEffect } from 'react';
import {
  JudgeSceneEngine,
  JudgeScene,
  JUDGE_SCENES,
} from '@/lib/services/JudgeSceneEngine';
import {
  JudgeHeaderBanner,
  JudgeMachineCard,
  JudgeGridIntelligence,
  JudgeImpactPanel,
  JudgeComparisonCard,
} from './JudgePanels';
import { WhyDidSoilIqStopModal } from '@/components/validation/WhyDidSoilIqStopModal';
import { ApplicationMathModal } from '@/components/validation/ApplicationMathModal';

export default function JudgeModeClient() {
  const [scene, setScene] = useState<JudgeScene>(JudgeSceneEngine.getCurrentScene());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isWhyStopOpen, setIsWhyStopOpen] = useState<boolean>(false);
  const [isMathOpen, setIsMathOpen] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const intervalMs = Math.max(1000, 3000 / speed);
      timer = setInterval(() => {
        const next = JudgeSceneEngine.nextScene();
        setScene(next);
        if (JudgeSceneEngine.getSceneIndex() === JUDGE_SCENES.length - 1) {
          setIsPlaying(false);
        }
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const handleNext = () => setScene(JudgeSceneEngine.nextScene());
  const handlePrev = () => setScene(JudgeSceneEngine.previousScene());
  const handleReset = () => {
    setIsPlaying(false);
    setScene(JudgeSceneEngine.reset());
  };
  const handleJump = (code: string) => {
    setIsPlaying(false);
    setScene(JudgeSceneEngine.jumpToCode(code));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Banner */}
      <JudgeHeaderBanner />

      {/* Presenter Controller Bar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-6 py-2.5 backdrop-blur shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shadow ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isPlaying ? '⏸ PAUSE DEMO' : '▶ START DEMO'}
          </button>
          <button
            onClick={handlePrev}
            className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            &larr; Prev
          </button>
          <button
            onClick={handleNext}
            className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Next &rarr;
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            ↺ Reset
          </button>

          {/* Speed toggles */}
          <div className="ml-2 flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  JudgeSceneEngine.setSpeed(s);
                }}
                className={`rounded px-2 py-1 font-bold ${
                  speed === s ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}X
              </button>
            ))}
          </div>

          <span className="ml-3 text-xs font-mono text-emerald-400">
            {scene.title} ({JudgeSceneEngine.getSceneIndex() + 1}/10)
          </span>
        </div>

        {/* Instant Presenter Recovery Jumps */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase mr-1">Direct Jump:</span>
          <button
            onClick={() => handleJump('NORMAL')}
            className={`rounded px-2 py-1 text-[11px] font-medium border ${
              scene.code === 'NORMAL'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => handleJump('VARIABLE_RATE')}
            className={`rounded px-2 py-1 text-[11px] font-medium border ${
              scene.code === 'VARIABLE_RATE'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Variable Rate
          </button>
          <button
            onClick={() => handleJump('THRESHOLD')}
            className={`rounded px-2 py-1 text-[11px] font-medium border ${
              scene.code === 'THRESHOLD'
                ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Threshold
          </button>
          <button
            onClick={() => handleJump('HEAVY_RAIN')}
            className={`rounded px-2 py-1 text-[11px] font-medium border ${
              scene.code === 'HEAVY_RAIN'
                ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Heavy Rain
          </button>
          <button
            onClick={() => handleJump('CLOSED_LOOP_STOP')}
            className={`rounded px-2 py-1 text-[11px] font-medium border ${
              scene.code === 'CLOSED_LOOP_STOP'
                ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Safe Stop
          </button>
        </div>
      </div>

      {/* Main 5-Panel Layout */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Visual Field Map (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Panel 1: Spatial Map & Realtime Machine Trail
                </span>
                <h2 className="text-base font-bold text-white">
                  Green Valley Farm &bull; Field 3 (Rice - Tillering)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMathOpen(true)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-200 border border-slate-700"
                >
                  Application Math
                </button>
                <button
                  onClick={() => setIsWhyStopOpen(true)}
                  className="rounded-lg bg-rose-950/80 hover:bg-rose-900 px-2.5 py-1 text-xs text-rose-300 border border-rose-800/80 font-semibold"
                >
                  Why Did It Stop?
                </button>
              </div>
            </div>

            {/* High-Contrast SVG Spatial Grid Map */}
            <div className="relative mt-4 flex-1 min-h-[380px] rounded-xl border border-slate-800 bg-slate-950/90 p-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 600 360" className="w-full h-full max-h-[420px]">
                {/* Field Perimeter */}
                <rect
                  x="40"
                  y="30"
                  width="520"
                  height="300"
                  rx="12"
                  fill="#061e16"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Spatial Grid Cells */}
                {/* Grid 1: F01-G001 */}
                <rect
                  x="60"
                  y="50"
                  width="150"
                  height="125"
                  rx="6"
                  fill={scene.sprayer.gridCode === 'F01-G001' ? '#047857' : '#064e3b'}
                  stroke="#10b981"
                  strokeWidth={scene.sprayer.gridCode === 'F01-G001' ? '3' : '1'}
                  className="transition-all duration-300"
                />
                <text x="75" y="80" fill="#a7f3d0" fontSize="12" fontWeight="bold">
                  F01-G001 (Rx: 42 kg/ha)
                </text>
                <text x="75" y="100" fill="#6ee7b7" fontSize="10">
                  N rem: 48.5 kg &bull; Optimal
                </text>

                {/* Grid 2: F01-G002 */}
                <rect
                  x="230"
                  y="50"
                  width="150"
                  height="125"
                  rx="6"
                  fill={
                    scene.sprayer.gridCode === 'F01-G002'
                      ? scene.sprayer.decision === 'STOP' || scene.sprayer.decision === 'DEFER'
                        ? '#881337'
                        : '#b45309'
                      : '#78350f'
                  }
                  stroke={scene.sprayer.decision === 'STOP' ? '#f43f5e' : '#f59e0b'}
                  strokeWidth={scene.sprayer.gridCode === 'F01-G002' ? '3' : '1'}
                  className="transition-all duration-300"
                />
                <text x="245" y="80" fill="#fde68a" fontSize="12" fontWeight="bold">
                  F01-G002 (Rx: 36 kg/ha)
                </text>
                <text x="245" y="100" fill="#fcd34d" fontSize="10">
                  N rem: 7.2 kg &bull; Threshold
                </text>

                {/* Grid 3: F01-G003 */}
                <rect
                  x="400"
                  y="50"
                  width="140"
                  height="125"
                  rx="6"
                  fill="#064e3b"
                  stroke="#10b981"
                  strokeWidth="1"
                />
                <text x="415" y="80" fill="#a7f3d0" fontSize="12" fontWeight="bold">
                  F01-G003 (Rx: 40 kg/ha)
                </text>
                <text x="415" y="100" fill="#6ee7b7" fontSize="10">
                  Resting &bull; Untreated
                </text>

                {/* Grid 4: F01-G004 */}
                <rect
                  x="60"
                  y="190"
                  width="150"
                  height="125"
                  rx="6"
                  fill="#064e3b"
                  stroke="#10b981"
                  strokeWidth="1"
                />
                <text x="75" y="220" fill="#a7f3d0" fontSize="12" fontWeight="bold">
                  F01-G004 (Rx: 45 kg/ha)
                </text>

                {/* Grid 5: Riparian Buffer Lockout Zone */}
                <rect
                  x="230"
                  y="190"
                  width="310"
                  height="125"
                  rx="6"
                  fill="#1e1b4b"
                  stroke="#6366f1"
                  strokeWidth="1"
                />
                <text x="245" y="220" fill="#c7d2fe" fontSize="12" fontWeight="bold">
                  Riparian Buffer Zone &bull; APPLICATION PROHIBITED
                </text>
                <text x="245" y="240" fill="#a5b4fc" fontSize="10">
                  Adjacent to natural waterway &bull; Auto-interlock
                </text>

                {/* Sprayer Machine Icon and Position */}
                {scene.sprayer.gridCode === 'F01-G001' ? (
                  <g transform="translate(130, 110)">
                    <circle r="18" fill="#10b981" opacity="0.3" className="animate-ping" />
                    <circle r="12" fill="#047857" stroke="#ffffff" strokeWidth="2" />
                    <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      SP-01
                    </text>
                  </g>
                ) : (
                  <g transform="translate(305, 110)">
                    <circle
                      r="18"
                      fill={scene.sprayer.decision === 'STOP' ? '#f43f5e' : '#f59e0b'}
                      opacity="0.3"
                      className="animate-ping"
                    />
                    <circle
                      r="12"
                      fill={scene.sprayer.decision === 'STOP' ? '#e11d48' : '#d97706'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      SP-01
                    </text>
                  </g>
                )}

                {/* Machine Motion Vector Arrow */}
                <line
                  x1="145"
                  y1="110"
                  x2="285"
                  y2="110"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </svg>

              {/* In-Map Telemetry HUD */}
              <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/80 p-2 text-[11px] font-mono border border-slate-800">
                <span className="text-slate-400">Position: </span>
                <span className="text-emerald-400">17.1234°N, 80.4567°E</span> &bull;{' '}
                <span className="text-slate-400">RTK Accuracy: </span>
                <span className="text-white">2.1 cm</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">Scene Action: </strong>
              {scene.description}
            </div>
          </div>

          <JudgeComparisonCard />
        </div>

        {/* Right Column: Machine, Grid & Impact Panels (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <JudgeMachineCard scene={scene} />
          <JudgeGridIntelligence scene={scene} />
          <JudgeImpactPanel scene={scene} />
        </div>
      </main>

      {/* Modals */}
      <WhyDidSoilIqStopModal
        isOpen={isWhyStopOpen}
        onClose={() => setIsWhyStopOpen(false)}
        gridCode={scene.sprayer.gridCode}
        prescriptionRateKgHa={scene.sprayer.prescriptionKgHa}
        remainingBudgetKgHa={scene.grid.nRemaining}
        decision={scene.sprayer.decision}
        reason={scene.sprayer.decisionReason}
      />

      <ApplicationMathModal
        isOpen={isMathOpen}
        onClose={() => setIsMathOpen(false)}
        flowRateLpm={scene.sprayer.actualFlowLpm}
        speedKmh={8.5}
        swathWidthM={12.0}
      />
    </div>
  );
}
