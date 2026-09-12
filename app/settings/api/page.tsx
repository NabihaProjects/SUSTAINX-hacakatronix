'use client';

// SOIL IQ - Customer API Access & Key Management
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Key,
  Plus,
  ShieldCheck,
  Trash2,
  Copy,
  Check,
  Terminal,
  Layers,
  Code2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { ALLOWED_API_SCOPES } from '@/lib/services/apiKeyService';

export default function SettingsApiPage() {
  const [keys, setKeys] = useState([
    {
      id: 'key-1',
      name: 'Farm Management ERP Integration',
      prefix: 'siq_live_8f3a9e',
      scopes: ['READ_FARMS', 'READ_FIELDS', 'READ_GRIDS', 'READ_SOIL'],
      createdAt: '2026-08-20',
      lastUsed: '2 hours ago',
      status: 'ACTIVE',
    },
    {
      id: 'key-2',
      name: 'Weather Station Ingestion Webhook',
      prefix: 'siq_live_b42c11',
      scopes: ['READ_TELEMETRY', 'READ_ANALYTICS'],
      createdAt: '2026-09-01',
      lastUsed: 'Yesterday',
      status: 'ACTIVE',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'READ_FARMS',
    'READ_FIELDS',
    'READ_SOIL',
  ]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    if (!newKeyName) return;
    const randomHex = Math.random().toString(36).substring(2, 10);
    const fullKey = `siq_live_${randomHex}${Math.random().toString(36).substring(2, 12)}`;
    setGeneratedKey(fullKey);

    const newKeyRecord = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      prefix: fullKey.slice(0, 16),
      scopes: selectedScopes,
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: 'Never',
      status: 'ACTIVE',
    };

    setKeys([newKeyRecord, ...keys]);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d08] text-[#e1ece3] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1c3322] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#718d78] mb-1">
            <Link href="/settings" className="hover:text-emerald-400">Settings</Link>
            <span>/</span>
            <span>Developer API</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-7 h-7 text-emerald-400" />
            Customer API Access & Keys
          </h1>
          <p className="text-xs text-[#8ca893] mt-1">
            Programmatic REST access for farm management software, lab LIMS systems, and ag retail platforms.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setGeneratedKey(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-xl p-4 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold">Strict Machine Actuation Security Enclosure</strong>
          <span className="text-[#8ca893]">
            Customer API keys permit read-only query access to farm boundaries, soil baselines, and telemetry. Machine control actuation and valve overrides are strictly isolated and require physical edge authentication.
          </span>
        </div>
      </div>

      {/* Active Keys Table */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Active API Access Tokens
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1e3825] text-[#8ca893] uppercase font-semibold">
                <th className="py-3 px-3">Token Name</th>
                <th className="py-3 px-3">Key Prefix</th>
                <th className="py-3 px-3">Authorized Scopes</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Last Used</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#172b1c]">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-[#132418]/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{k.name}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">{k.prefix}...</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 bg-[#0a140d] border border-[#1b3320] rounded text-[10px] text-[#9cb2a3]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#718d78]">{k.createdAt}</td>
                  <td className="py-3 px-3 text-[#718d78]">{k.lastUsed}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="text-rose-400 hover:text-rose-300 font-medium inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer API Quickstart Documentation */}
      <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          API Quickstart & Documentation
        </h2>

        <div className="space-y-4 text-xs">
          <div>
            <span className="text-[#718d78] uppercase text-[10px] font-bold block mb-1">
              Authentication Header
            </span>
            <div className="bg-[#08120a] p-3 rounded-lg border border-[#172b1c] font-mono text-emerald-300">
              Authorization: Bearer siq_live_your_api_key_here
            </div>
          </div>

          <div>
            <span className="text-[#718d78] uppercase text-[10px] font-bold block mb-1">
              Sample Request: Fetch Farm Grids & Soil Baseline
            </span>
            <div className="bg-[#08120a] p-4 rounded-lg border border-[#172b1c] font-mono text-[#c2d6c7] leading-relaxed">
              curl -X GET https://app.soil-iq.com/api/farms/cmtwubkim002h5bjcl1tcoygs/grids \<br />
              &nbsp;&nbsp;-H &quot;Authorization: Bearer siq_live_your_api_key_here&quot; \<br />
              &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot;
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-[#08120a] rounded-lg border border-[#172b1c]">
              <strong className="text-white block mb-1">GET /api/farms</strong>
              <span className="text-[#8ca893]">List all geographic farms and boundary coordinates.</span>
            </div>
            <div className="p-3 bg-[#08120a] rounded-lg border border-[#172b1c]">
              <strong className="text-white block mb-1">GET /api/telemetry</strong>
              <span className="text-[#8ca893]">Query real-time sensor node moisture and sprayer flow rates.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1d13] border border-[#1e3825] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Generate Customer API Key</h3>

            {!generatedKey ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[#8ca893] block mb-1 font-semibold">Key Identifier / Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. John Deere Operations Center Sync"
                    className="w-full bg-[#08120a] border border-[#213f28] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[#8ca893] block mb-2 font-semibold">Allowed Scopes</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {ALLOWED_API_SCOPES.map((scope) => (
                      <label key={scope} className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, scope]);
                            } else {
                              setSelectedScopes(selectedScopes.filter((s) => s !== scope));
                            }
                          }}
                          className="rounded border-[#1e3825] bg-[#08120a] text-emerald-600 focus:ring-0"
                        />
                        <span>{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 bg-[#132217] hover:bg-[#1a3321] text-[#8ca893] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newKeyName}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                  >
                    Generate Token
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200">
                  <strong>Save this secret token immediately.</strong> It will never be displayed again.
                </div>

                <div className="flex items-center justify-between bg-[#08120a] p-3 rounded-lg border border-[#172b1c] font-mono text-emerald-400 break-all text-[11px]">
                  <span>{generatedKey}</span>
                  <button
                    onClick={copyToClipboard}
                    className="ml-2 p-1.5 bg-[#132217] hover:bg-[#1a3321] rounded text-white shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
