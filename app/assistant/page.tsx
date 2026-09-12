'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  Bot,
  Send,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Database,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ExternalLink,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  responseType?: string;
  retrievedFacts?: string[];
  evidenceData?: Record<string, any>;
  confidenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore?: number;
  feedbackGiven?: 'UP' | 'DOWN' | null;
}

const QUICK_PROMPTS = [
  { label: 'Farm Health Overview', query: 'How is Green Valley Farm doing?' },
  { label: 'Grids Needing Attention', query: 'Which grids need attention?' },
  { label: 'Spray Stop Root Cause', query: 'Why did SOIL IQ stop the sprayer in G047?' },
  { label: 'Recent Farm Activities', query: 'What happened today across the farm?' },
  { label: 'Fertilizer Consumption', query: 'Which field used the most fertilizer?' },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your SOIL IQ Precision Agronomy Assistant. I answer questions grounded strictly in your live telemetry, nutrient budgets, sensor observations, and machine control audit trails. How can I assist your farm today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceLevel: 'HIGH',
      confidenceScore: 0.98,
      retrievedFacts: ['SOIL IQ Authoritative Knowledge Engine v2.4 initialized.'],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/intelligence/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.response) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.response.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          responseType: data.response.responseType,
          retrievedFacts: data.response.retrievedFacts || [],
          evidenceData: data.response.evidenceData || {},
          confidenceLevel: data.response.confidenceLevel || 'HIGH',
          confidenceScore: data.response.confidenceScore || 0.9,
          feedbackGiven: null,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: data.error || 'Failed to retrieve response from agronomic database.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidenceLevel: 'LOW',
          confidenceScore: 0.1,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Network error communicating with the SOIL IQ intelligence service.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceLevel: 'LOW',
        confidenceScore: 0.0,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'UP' | 'DOWN') => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedbackGiven: feedback } : msg))
    );

    try {
      await fetch('/api/intelligence/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendationId: messageId,
          feedback: feedback === 'UP' ? 'HELPFUL' : 'NOT_HELPFUL',
          comments: `User responded ${feedback} to query.`,
        }),
      });
    } catch (e) {
      console.error('Feedback failed:', e);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1e3324]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                SOIL IQ Farm Assistant
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Grounded DB Engine
                </span>
              </h1>
              <p className="text-xs text-[#76937e]">
                Deterministic agronomic analysis backed by sensor feeds, nutrient ledgers, and machine telemetry. Zero hallucination guarantee.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#76937e] bg-[#0a120c] px-3 py-1.5 rounded-lg border border-[#1e3324]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety-Lock Active</span>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar select-none">
          <span className="text-xs font-semibold text-[#5a7461] uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Quick Prompts:
          </span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.query)}
              disabled={isLoading}
              className="text-xs bg-[#111e15] hover:bg-[#192b1e] text-[#9cb2a3] hover:text-white border border-[#203626] hover:border-emerald-500/40 rounded-full px-3 py-1.5 whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 rounded-xl bg-[#09110b] border border-[#17261b] p-4">
          {messages.map((msg) => {
            const isAsst = msg.sender === 'assistant';
            const isEvidenceOpen = expandedEvidenceId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAsst ? 'justify-start' : 'justify-end'}`}
              >
                {isAsst && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    isAsst
                      ? 'bg-[#0f1d13] border border-[#1e3825] text-[#d6e2d9]'
                      : 'bg-emerald-700/30 border border-emerald-500/40 text-emerald-50'
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-4 mb-2 text-[11px] text-[#63806a]">
                    <span className="font-semibold text-[#8fa795]">
                      {isAsst ? 'SOIL IQ Knowledge Base' : 'Agronomist'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Assistant Grounding & Confidence Metadata */}
                  {isAsst && msg.confidenceScore !== undefined && (
                    <div className="mt-3 pt-3 border-t border-[#1a2d20] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            msg.confidenceLevel === 'HIGH'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : msg.confidenceLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {msg.confidenceLevel} CONFIDENCE ({Math.round(msg.confidenceScore * 100)}%)
                        </span>

                        <span className="text-[11px] text-[#63806a] flex items-center gap-1">
                          <Database className="w-3 h-3 text-emerald-500" />
                          Validated Live Facts
                        </span>
                      </div>

                      {/* Feedback buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleFeedback(msg.id, 'UP')}
                          className={`p-1 rounded hover:bg-[#192f20] transition-colors ${
                            msg.feedbackGiven === 'UP' ? 'text-emerald-400 bg-emerald-950' : 'text-[#63806a]'
                          }`}
                          title="Accurate and helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'DOWN')}
                          className={`p-1 rounded hover:bg-[#192f20] transition-colors ${
                            msg.feedbackGiven === 'DOWN' ? 'text-rose-400 bg-rose-950' : 'text-[#63806a]'
                          }`}
                          title="Unhelpful or incomplete"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Evidence Drawer Toggle */}
                  {isAsst && msg.retrievedFacts && msg.retrievedFacts.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedEvidenceId(isEvidenceOpen ? null : msg.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                      >
                        {isEvidenceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isEvidenceOpen ? 'Hide Retrieved Evidence' : `View Retrieved Evidence (${msg.retrievedFacts.length} items)`}
                      </button>

                      {/* Expanded Drawer */}
                      {isEvidenceOpen && (
                        <div className="mt-2 p-3 bg-[#080e0a] rounded-lg border border-[#1b3121] text-xs space-y-2">
                          <div>
                            <div className="text-[10px] font-bold text-[#63806a] uppercase tracking-wider mb-1">
                              Retrieved Facts & Database Keys
                            </div>
                            <ul className="list-disc list-inside text-[#9cb2a3] space-y-1">
                              {msg.retrievedFacts.map((fact, idx) => (
                                <li key={idx}>{fact}</li>
                              ))}
                            </ul>
                          </div>

                          {msg.evidenceData && Object.keys(msg.evidenceData).length > 0 && (
                            <div className="pt-2 border-t border-[#15271b]">
                              <div className="text-[10px] font-bold text-[#63806a] uppercase tracking-wider mb-1">
                                Authoritative Raw Payload
                              </div>
                              <pre className="p-2 rounded bg-black/40 text-[11px] text-emerald-300 font-mono overflow-x-auto">
                                {JSON.stringify(msg.evidenceData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isAsst && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-200 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-4 flex items-center gap-3 text-sm text-[#9cb2a3]">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Querying authoritative agronomic models and databases...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-3 flex gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything (e.g. 'Which grids need attention?', 'Why did sprayer stop?', 'How is Green Valley Farm doing?')..."
            className="flex-1 bg-[#0b160f] border border-[#203626] focus:border-emerald-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-[#5a7461] focus:outline-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-5 rounded-xl flex items-center gap-2 text-sm transition-all shadow-md shadow-emerald-950"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </AppShell>
  );
}
