'use client';

import { useState } from 'react';
import { FOUR_IS_DESCRIPTIONS } from '@/config/creativity';
import type { FourIsPhase } from '@/types/creativity';
import type { CreativeSession } from '@/types/session';

export default function NewSessionPage() {
  const [topic, setTopic] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<FourIsPhase | null>(null);
  const [result, setResult] = useState<CreativeSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic || !domain) return;

    setLoading(true);
    setError(null);
    setCurrentPhase('immersion');

    try {
      const res = await fetch('/api/creative/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, domain }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setResult(data.data);
      setCurrentPhase(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">New Creative Session</h1>
      <p className="text-white/50 mb-8">Run the full 4I&apos;s pipeline to generate, evaluate, and iterate ideas</p>

      <form onSubmit={handleSubmit} className="space-y-5 mb-10">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI-powered personal finance assistant"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., Fintech, Healthcare, Education"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !topic || !domain}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 text-white font-semibold hover:opacity-90 disabled:opacity-40 transition"
        >
          {loading ? 'Running...' : 'Start 4I\'s Pipeline'}
        </button>
      </form>

      {/* 4I's 진행 상태 */}
      {loading && (
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-white/60 mb-4">Pipeline Progress</h3>
          <div className="flex gap-3">
            {(Object.entries(FOUR_IS_DESCRIPTIONS) as [FourIsPhase, typeof FOUR_IS_DESCRIPTIONS.immersion][]).map(([key, phase]) => (
              <div
                key={key}
                className={`flex-1 p-3 rounded-lg text-center text-xs ${
                  currentPhase === key
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                <div className="text-lg mb-1">{phase.icon}</div>
                {phase.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 에러 */}
      {error && (
        <div className="glass rounded-xl p-5 border-red-500/30 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Session Complete</h3>
              <span className="text-xs text-white/40 font-mono">{result.duration ? `${(result.duration / 1000).toFixed(1)}s` : ''}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-white/50">Total ideas generated</div>
              <div className="text-amber-400 font-semibold">{result.totalGenerated}</div>
              <div className="text-white/50">Final curated ideas</div>
              <div className="text-purple-400 font-semibold">{result.finalIdeas.length}</div>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold mb-4">Final Ideas</h3>
            <div className="space-y-3">
              {result.finalIdeas.map((idea, i) => (
                <div key={idea.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{idea.title}</h4>
                    {idea.scores && (
                      <span className="text-xs font-mono text-amber-400">{idea.scores.overall}/100</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-1">{idea.description}</p>
                  {idea.method && (
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                      {idea.method}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
