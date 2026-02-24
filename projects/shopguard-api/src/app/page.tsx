export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: '40px 20px', color: '#e2e8f0', background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 36 }}>&#128737;&#65039;</span>
        <h1 style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ShopGuard API</h1>
      </div>
      <p style={{ fontSize: 18, color: '#94a3b8', marginBottom: 40 }}>
        Detect fake reviews, hidden fees, and dark patterns on any shopping page via REST API.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155' }}>
          <h3 style={{ color: '#60a5fa', marginBottom: 8, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Free</h3>
          <p style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>$0</p>
          <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>50 requests/day</p>
          <ul style={{ color: '#94a3b8', fontSize: 14, lineHeight: 2, paddingLeft: 16 }}>
            <li>Page data extraction</li>
            <li>Dark pattern detection (9 types)</li>
            <li>Basic metadata</li>
          </ul>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #8b5cf6' }}>
          <h3 style={{ color: '#a78bfa', marginBottom: 8, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Pro</h3>
          <p style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>$49<span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}>/mo</span></p>
          <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>10,000 requests/day</p>
          <ul style={{ color: '#94a3b8', fontSize: 14, lineHeight: 2, paddingLeft: 16 }}>
            <li>Everything in Free</li>
            <li>Review authenticity analysis (7 signals)</li>
            <li>Hidden fee detection</li>
            <li>Price comparison</li>
          </ul>
        </div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Endpoints</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {[
          { method: 'POST', path: '/api/analyze', desc: 'Full page analysis (dark patterns + metadata + reviews + pricing)', tier: 'Free*' },
          { method: 'POST', path: '/api/darkpatterns', desc: 'Scan for 9 types of dark patterns', tier: 'Free' },
          { method: 'POST', path: '/api/reviews', desc: 'Review authenticity with 7 statistical signals', tier: 'Pro' },
          { method: 'POST', path: '/api/pricing', desc: 'Hidden fee and pricing trap detection', tier: 'Pro' },
        ].map((ep) => (
          <div key={ep.path} style={{ background: '#1e293b', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #334155' }}>
            <code style={{ background: '#334155', padding: '2px 8px', borderRadius: 4, fontSize: 12, color: '#22c55e' }}>{ep.method}</code>
            <code style={{ color: '#e2e8f0', fontSize: 14 }}>{ep.path}</code>
            <span style={{ color: '#64748b', fontSize: 13, flex: 1 }}>{ep.desc}</span>
            <span style={{ background: ep.tier === 'Pro' ? '#7c3aed22' : '#16a34a22', color: ep.tier === 'Pro' ? '#a78bfa' : '#4ade80', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{ep.tier}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Quick Start</h2>
      <pre style={{ background: '#1e293b', borderRadius: 8, padding: 20, overflow: 'auto', fontSize: 13, lineHeight: 1.6, border: '1px solid #334155' }}>
{`curl -X POST https://shopguard-api.vercel.app/api/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<html>...shopping page...</html>"}'`}
      </pre>

      <div style={{ marginTop: 40, padding: 20, background: '#1e293b', borderRadius: 8, border: '1px solid #334155', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', marginBottom: 12 }}>Get your API key</p>
        <a href="mailto:clickaround8@gmail.com?subject=ShopGuard API Key Request" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', color: 'white', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          Request Access
        </a>
        <p style={{ color: '#475569', fontSize: 12, marginTop: 12 }}>Free tier: use <code style={{ color: '#94a3b8' }}>sg_demo_free</code> as API key to try instantly</p>
      </div>

      <footer style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid #1e293b', color: '#475569', fontSize: 13, textAlign: 'center' }}>
        ShopGuard API by clickaround | Powered by shopguard-mcp
      </footer>
    </div>
  );
}
