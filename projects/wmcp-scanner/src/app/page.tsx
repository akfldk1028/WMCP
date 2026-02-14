'use client';

import { useState } from 'react';

interface CategoryScoreDisplay {
  score: number;
  max: number;
  details: string[];
}

interface DetailedScoreDisplay {
  total: number;
  grade: string;
  categories: {
    structure: CategoryScoreDisplay;
    tools: CategoryScoreDisplay;
    declarative: CategoryScoreDisplay;
    imperative: CategoryScoreDisplay;
  };
}

interface ScanResultDisplay {
  url: string;
  score: number;
  grade: string;
  formCount: number;
  toolCount: number;
  detailedScore: DetailedScoreDisplay;
  recommendations: { type: string; priority: string; description: string; code: string }[];
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#3b82f6';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
    default: return '#6b7280';
  }
}

function GradeCircle({ grade, score }: { grade: string; score: number }) {
  const color = getGradeColor(grade);
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;

  return (
    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
      <svg width="160" height="160" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="60" y="52" textAnchor="middle" fontSize="36" fontWeight="700" fill={color}>
          {grade}
        </text>
        <text x="60" y="76" textAnchor="middle" fontSize="16" fill="#6b7280">
          {score}/100
        </text>
      </svg>
    </div>
  );
}

function CategoryBar({ name, score, max, details }: { name: string; score: number; max: number; details: string[] }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const barColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{name}</span>
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{score}/{max}</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: barColor, borderRadius: 6,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <ul style={{ margin: '6px 0 0', padding: '0 0 0 1.2rem', fontSize: '0.85rem', color: '#6b7280' }}>
        {details.map((d, i) => <li key={i}>{d}</li>)}
      </ul>
    </div>
  );
}

function BadgeEmbed({ domain, grade }: { domain: string; grade: string }) {
  const [copied, setCopied] = useState('');
  const badgeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/badge/${domain}`;
  const scanUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?url=${encodeURIComponent(`https://${domain}`)}`;

  const markdown = `[![WebMCP Grade: ${grade}](${badgeUrl})](${scanUrl})`;
  const html = `<a href="${scanUrl}"><img src="${badgeUrl}" alt="WebMCP Grade: ${grade}"></a>`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1.5rem' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Add Badge to Your Site</h3>
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Markdown</label>
          <button onClick={() => copy(markdown, 'md')} style={{
            background: 'none', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 10px',
            fontSize: '0.8rem', cursor: 'pointer', color: copied === 'md' ? '#22c55e' : '#6b7280',
          }}>
            {copied === 'md' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <code style={{ display: 'block', background: '#1e1e1e', color: '#d4d4d4', padding: '0.5rem', borderRadius: 4, fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre' }}>
          {markdown}
        </code>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>HTML</label>
          <button onClick={() => copy(html, 'html')} style={{
            background: 'none', border: '1px solid #d1d5db', borderRadius: 4, padding: '2px 10px',
            fontSize: '0.8rem', cursor: 'pointer', color: copied === 'html' ? '#22c55e' : '#6b7280',
          }}>
            {copied === 'html' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <code style={{ display: 'block', background: '#1e1e1e', color: '#d4d4d4', padding: '0.5rem', borderRadius: 4, fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre' }}>
          {html}
        </code>
      </div>
    </div>
  );
}

function ShareButtons({ grade, score }: { grade: string; score: number }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const text = `My site scored ${grade} (${score}/100) on the WebMCP Agent-Readiness test!`;
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
      <button onClick={copyLink} style={{
        padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: 6,
        background: linkCopied ? '#f0fdf4' : '#fff', cursor: 'pointer', fontSize: '0.9rem',
      }}>
        {linkCopied ? 'Link Copied!' : 'Copy Link'}
      </button>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" style={{
        padding: '0.5rem 1rem', background: '#000', color: '#fff', borderRadius: 6,
        textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center',
      }}>
        Share on X
      </a>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResultDisplay | null>(null);
  const [error, setError] = useState('');
  const [recTab, setRecTab] = useState<'declarative' | 'imperative'>('declarative');

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Scan failed: ${res.statusText}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const domain = result ? (() => { try { return new URL(result.url).hostname; } catch { return ''; } })() : '';
  const categories = result?.detailedScore?.categories;

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem', fontWeight: 800 }}>
          Is Your Site Agent-Ready?
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: '0 0 1.5rem' }}>
          Scan any website for WebMCP compatibility. Free, instant, like SSL Labs for AI agents.
        </p>

        <div style={{ display: 'flex', gap: 8, maxWidth: 560, margin: '0 auto' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              flex: 1, padding: '0.85rem 1rem', fontSize: '1rem',
              border: '2px solid #e5e7eb', borderRadius: 10, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={loading || !url}
            style={{
              padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600,
              background: loading ? '#9ca3af' : '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 10, cursor: loading ? 'wait' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, marginBottom: '1.5rem', color: '#991b1b',
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && categories && (
        <div>
          {/* Grade Circle */}
          <GradeCircle grade={result.grade} score={result.score} />

          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 120, padding: '1rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.formCount}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Forms Found</div>
            </div>
            <div style={{ flex: 1, minWidth: 120, padding: '1rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.toolCount}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Tools Detected</div>
            </div>
            <div style={{ flex: 1, minWidth: 120, padding: '1rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{result.recommendations.length}</div>
              <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Recommendations</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 1rem' }}>Category Breakdown</h2>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.25rem', marginBottom: '2rem' }}>
            <CategoryBar name="Structure" score={categories.structure.score} max={categories.structure.max} details={categories.structure.details} />
            <CategoryBar name="Tools" score={categories.tools.score} max={categories.tools.max} details={categories.tools.details} />
            <CategoryBar name="Declarative API" score={categories.declarative.score} max={categories.declarative.max} details={categories.declarative.details} />
            <CategoryBar name="Imperative API" score={categories.imperative.score} max={categories.imperative.max} details={categories.imperative.details} />
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.75rem' }}>Recommended Code</h2>
              <div style={{ display: 'flex', gap: 0, marginBottom: '1rem' }}>
                {(['declarative', 'imperative'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRecTab(tab)}
                    style={{
                      padding: '0.5rem 1.25rem', border: '1px solid #e5e7eb',
                      background: recTab === tab ? '#3b82f6' : '#fff',
                      color: recTab === tab ? '#fff' : '#374151',
                      cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                      borderRadius: tab === 'declarative' ? '6px 0 0 6px' : '0 6px 6px 0',
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {result.recommendations
                .filter((r) => r.type === recTab)
                .map((rec, i) => (
                  <div key={i} style={{
                    marginBottom: '1rem', padding: '1rem',
                    background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                        background: rec.priority === 'high' ? '#fef2f2' : '#fffbeb',
                        color: rec.priority === 'high' ? '#991b1b' : '#92400e',
                      }}>
                        {rec.priority}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px', color: '#374151' }}>{rec.description}</p>
                    <pre style={{
                      background: '#1e1e1e', color: '#d4d4d4', padding: '1rem',
                      borderRadius: 6, overflow: 'auto', fontSize: 13, margin: 0,
                    }}>
                      <code>{rec.code}</code>
                    </pre>
                  </div>
                ))}
            </>
          )}

          {/* Badge & Share */}
          {domain && <BadgeEmbed domain={domain} grade={result.grade} />}
          <ShareButtons grade={result.grade} score={result.score} />
        </div>
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '3rem', padding: '1.5rem 0', borderTop: '1px solid #e5e7eb', color: '#9ca3af', fontSize: '0.85rem' }}>
        WebMCP Scanner &mdash; Free AI agent readiness testing tool
      </footer>
    </main>
  );
}
