'use client';

// SOIL IQ - Customer Support & Operations Center
import React, { useState } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  HelpCircle,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  PhoneCall,
  Send,
  Sparkles,
} from 'lucide-react';

export default function SupportCenterPage() {
  const [tickets, setTickets] = useState([
    {
      id: 'TICK-101',
      category: 'HARDWARE',
      priority: 'MEDIUM',
      title: 'PWM Valve Solenoid #4 Calibration Verification',
      description: 'Requesting routine flow verification for nozzle bank 4 on Sprayer SP-01 after 50 operating hours.',
      status: 'OPEN',
      createdAt: '2026-09-11',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HARDWARE');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newTicket = {
      id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      category,
      priority,
      title,
      description,
      status: 'OPEN',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setTickets([newTicket, ...tickets]);
    setShowModal(false);
    setTitle('');
    setDescription('');
  };

  const FAQS = [
    {
      q: 'How does SOIL IQ handle loss of cellular connectivity in remote fields?',
      a: 'The on-board Edge Gateway runs a local SQLite buffer. All RTK position fixes, pulse flow integrals, and PWM valve telemetry are stored locally and automatically sync back to the cloud once connectivity resumes.',
    },
    {
      q: 'Can an operator override a closed-loop safety stop?',
      a: 'Manual override requires explicit two-factor physical confirmation from the in-cab display. All overrides are recorded in the non-repudiable audit ledger with GPS location and timestamp.',
    },
    {
      q: 'What is the required sampling density for reliable variable-rate prescriptions?',
      a: 'We recommend at least one laboratory core sample per 2.5–5.0 acres. In-situ continuous capacitance sensors dynamically modulate moisture and salinity offsets between core testing intervals.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/workspace" className="hover:text-emerald-400">Workspace</Link>
            <span>/</span>
            <span>Support Center</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-emerald-400" />
            Support Center & Technical Operations
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            24/7 technical assistance for field IoT gateways, smart sprayer controllers, and laboratory calibration.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Support Request</span>
        </button>
      </div>

      {/* System Operational Status Banner */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <div>
            <strong className="text-white">All Platform Systems Operational</strong>
            <span className="text-[#8ca893] block">
              MQTT Broker (1.0 Hz ingestion) • RTK NTRIP Caster • SQLite Sync API: 99.98% uptime
            </span>
          </div>
        </div>
        <span className="text-emerald-400 font-mono text-[11px]">Region: us-east (Latency: 28ms)</span>
      </div>

      {/* Active Support Tickets */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Your Support Requests & Field Inquiries
        </h2>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-[#08120a] border border-[#182c1e] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[#718d78] text-[11px]">{t.id}</span>
                  <span className="text-white font-bold">{t.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      t.priority === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
                <p className="text-[#8ca893] text-[11px]">{t.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[#718d78] text-[11px]">{t.createdAt}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-4 bg-[#08120a] border border-[#182c1e] rounded-xl text-xs space-y-1.5">
              <strong className="text-white block font-semibold">{faq.q}</strong>
              <p className="text-[#8ca893] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create Technical Support Request</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="text-[#8ca893] block mb-1 font-semibold">Subject / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. In-line flow meter calibration error"
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8ca893] block mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#08120a] border border-[#213f28] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="HARDWARE">HARDWARE</option>
                    <option value="SENSOR">SENSOR</option>
                    <option value="PRESCRIPTION">PRESCRIPTION</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8ca893] block mb-1 font-semibold">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#08120a] border border-[#213f28] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#8ca893] block mb-1 font-semibold">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide equipment serial number or grid location details..."
                  className="w-full bg-[#08120a] border border-[#213f28] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-[#132217] hover:bg-[#1a3321] text-[#8ca893] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
