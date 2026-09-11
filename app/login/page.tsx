'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@soiliq.ag');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay and redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  const setDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#071109] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-950/80 mb-3">
            <Layers className="w-7 h-7 text-emerald-100" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            SOIL <span className="text-emerald-400">IQ</span>
          </h1>
          <p className="text-xs text-[#7d9b85] mt-1 tracking-wide font-medium">
            “Know Your Soil. Control Your Inputs. Protect Your Future.”
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0e1a12] border border-[#1e3324] rounded-2xl p-6 lg:p-8 shadow-2xl">
          <h2 className="text-base font-semibold text-white mb-1">Sign in to your organization</h2>
          <p className="text-xs text-[#6e8a76] mb-6">
            Multi-tenant precision agriculture operations center
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-emerald-200 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#132217] border border-[#203626] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-200 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#132217] border border-[#203626] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Enter Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="mt-6 pt-6 border-t border-[#1e3324]">
            <span className="text-[11px] font-semibold text-[#6e8a76] uppercase tracking-wider block mb-2 text-center">
              Quick Prototype Sign-In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser('admin@soiliq.ag')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  email === 'admin@soiliq.ag'
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                    : 'bg-[#122016] border-[#1e3324] text-[#8ca893] hover:text-white'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Admin / Owner
                </div>
                <div className="text-[10px] text-[#607c68] mt-0.5 font-mono">admin@soiliq.ag</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('operator@soiliq.ag')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                  email === 'operator@soiliq.ag'
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                    : 'bg-[#122016] border-[#1e3324] text-[#8ca893] hover:text-white'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Fleet Operator
                </div>
                <div className="text-[10px] text-[#607c68] mt-0.5 font-mono">operator@soiliq.ag</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security / Prototype Notice */}
        <div className="mt-6 text-center text-[11px] text-[#556d5b] flex items-center justify-center gap-2">
          <KeyRound className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Multi-tenant organization authorization enforced server-side.</span>
        </div>
      </div>
    </div>
  );
}
