'use client';

import React, { useState } from 'react';

export default function MobileNotesPage() {
  const [notes, setNotes] = useState([
    { id: 1, text: 'Standing water observed near grid G047 drainage ditch.', category: 'SOIL', time: '10 min ago', isOffline: false },
    { id: 2, text: 'Sprayer nozzle #4 inspected and cleaned; flow calibrated.', category: 'MACHINE', time: '1 hr ago', isOffline: false },
  ]);
  const [newText, setNewText] = useState<string>('');
  const [category, setCategory] = useState<string>('SOIL');
  const [queuedCount, setQueuedCount] = useState<number>(0);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newNote = {
      id: Date.now(),
      text: newText,
      category,
      time: 'Just now',
      isOffline: !navigator.onLine,
    };

    setNotes([newNote, ...notes]);
    if (!navigator.onLine) {
      setQueuedCount((c) => c + 1);
    }
    setNewText('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-white">Field Observation Notes</h1>
          <p className="text-[10px] text-slate-400">Offline-capable operator observations</p>
        </div>
        {queuedCount > 0 && (
          <span className="rounded bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 text-[10px] font-bold">
            {queuedCount} Queued Offline
          </span>
        )}
      </div>

      {/* Note Creation Form */}
      <form onSubmit={handleAddNote} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow space-y-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Observation Category</label>
          <div className="flex gap-1 text-[11px]">
            {['SOIL', 'CROP', 'MACHINE', 'WEATHER'].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-2.5 py-1 font-bold border ${
                  category === cat
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Field Observation Details</label>
          <textarea
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="e.g. Standing water or crop stress observed in grid..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
        >
          + Save Field Observation
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Observations</h2>
        {notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400">
                {note.category}
              </span>
              <span className="text-[10px] text-slate-500">{note.time}</span>
            </div>
            <p className="text-slate-200 text-[11px] leading-relaxed">{note.text}</p>
            {note.isOffline && (
              <div className="text-[9px] text-amber-400 font-medium">○ Buffered locally &bull; Syncs on reconnect</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
