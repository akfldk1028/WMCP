export default function Home() {
  const endpoints = [
    { method: 'POST', path: '/api/analyze', desc: 'Full page analysis — metadata, dark patterns, reviews, pricing', tier: 'Free*' },
    { method: 'POST', path: '/api/darkpatterns', desc: 'Scan for 9 types of dark patterns', tier: 'Free' },
    { method: 'POST', path: '/api/reviews', desc: 'Review authenticity with 7 statistical signals', tier: 'Pro' },
    { method: 'POST', path: '/api/pricing', desc: 'Hidden fee and pricing trap detection', tier: 'Pro' },
  ];

  const features = [
    { icon: '\u{1F6E1}\u{FE0F}', title: 'Dark Pattern Detection', desc: '9 types of manipulative UI patterns identified with evidence', tag: 'Free' },
    { icon: '\u{1F50D}', title: 'Fake Review Analysis', desc: '7 statistical signals to spot suspicious review patterns', tag: 'Pro' },
    { icon: '\u{1F4B0}', title: 'Hidden Fee Scanner', desc: 'Detect drip pricing, bait-and-switch, and surprise charges', tag: 'Pro' },
    { icon: '\u{1F916}', title: 'Agent-Ready Detection', desc: 'Schema.org, OpenGraph, and .well-known/mcp.json scanning', tag: 'Free' },
  ];

  return (
    <div className="container" style={{ paddingTop: 80, paddingBottom: 60 }}>
      {/* Hero */}
      <section className="fade-up" style={{ textAlign: 'center', marginBottom: 100 }}>
        <div style={{ marginBottom: 20 }}>
          <span className="badge badge-free" style={{ fontSize: 13 }}>Now Available</span>
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
          Protect shoppers with<br />
          <span className="gradient-text">AI-powered analysis</span>
        </h1>
        <p style={{ fontSize: 19, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Detect fake reviews, hidden fees, and dark patterns on any shopping page. One API call.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#pricing" className="shimmer-btn">Get Started Free</a>
          <a href="#api" style={{
            padding: '12px 32px', borderRadius: 12, border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, fontWeight: 500,
            transition: 'all 0.2s',
          }}>View API Docs</a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>
          Free tier: 50 requests/day &middot; No credit card required
        </p>
      </section>

      {/* Features Bento Grid */}
      <section style={{ marginBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>What ShopGuard detects</h2>
          <p className="fade-up fade-up-delay-1" style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Evidence-based analysis powered by pattern recognition</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div key={f.title} className={`glass-card fade-up fade-up-delay-${i + 1}`} style={{ padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{f.title}</h3>
                <span className={`badge ${f.tag === 'Free' ? 'badge-free' : 'badge-pro'}`} style={{ fontSize: 10 }}>{f.tag}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ marginBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Simple pricing</h2>
          <p className="fade-up fade-up-delay-1" style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Start free, upgrade when you need more</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 720, margin: '0 auto' }}>
          {/* Free */}
          <div className="glass-card fade-up fade-up-delay-1" style={{ padding: 32 }}>
            <span className="badge badge-free" style={{ marginBottom: 16 }}>Free</span>
            <div style={{ marginTop: 16, marginBottom: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800 }}>$0</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>50 requests / day</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
              {['Page data extraction', 'Dark pattern detection (9 types)', 'Agent-readiness scan', 'Basic metadata'].map(f => (
                <li key={f} style={{ color: 'var(--text-secondary)', fontSize: 14, padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#22d3ee', fontSize: 16 }}>{'\u2713'}</span> {f}
                </li>
              ))}
            </ul>
            <a href="#api" style={{
              display: 'block', textAlign: 'center', padding: '10px 24px', borderRadius: 10,
              border: '1px solid var(--border-subtle)', color: 'var(--text-primary)',
              textDecoration: 'none', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
            }}>Start with demo key</a>
          </div>

          {/* Pro */}
          <div className="glass-card fade-up fade-up-delay-2" style={{
            padding: 32,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 60px rgba(168, 85, 247, 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span className="badge badge-popular">Popular</span>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800 }}>$49</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>/mo</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>10,000 requests / day</p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
              {['Everything in Free', 'Review authenticity (7 signals)', 'Hidden fee detection', 'Price comparison', 'Priority support'].map(f => (
                <li key={f} style={{ color: 'var(--text-secondary)', fontSize: 14, padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#a855f7', fontSize: 16 }}>{'\u2713'}</span> {f}
                </li>
              ))}
            </ul>
            <a href="mailto:clickaround8@gmail.com?subject=ShopGuard Pro API Key" className="shimmer-btn" style={{
              display: 'block', textAlign: 'center', width: '100%', padding: '10px 24px',
            }}>Get Pro Access</a>
          </div>
        </div>
      </section>

      {/* API Docs */}
      <section id="api" style={{ marginBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>API Reference</h2>
          <p className="fade-up fade-up-delay-1" style={{ color: 'var(--text-secondary)', fontSize: 16 }}>REST endpoints ready to integrate</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {endpoints.map((ep, i) => (
            <div key={ep.path} className={`glass-card fade-up fade-up-delay-${i + 1}`} style={{
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <code style={{
                background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
                padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              }}>{ep.method}</code>
              <code style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>{ep.path}</code>
              <span style={{ color: 'var(--text-muted)', fontSize: 13, flex: 1 }}>{ep.desc}</span>
              <span className={`badge ${ep.tier === 'Pro' ? 'badge-pro' : 'badge-free'}`} style={{ fontSize: 10 }}>{ep.tier}</span>
            </div>
          ))}
        </div>

        <div className="fade-up fade-up-delay-3">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>Quick start</p>
          <div className="code-block">
            <pre style={{ margin: 0 }}>{`curl -X POST https://shopguard-api.vercel.app/api/analyze \\
  -H "Authorization: Bearer sg_demo_free" \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<html>...shopping page...</html>"}'`}</pre>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
            Try instantly with the demo key <code style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>sg_demo_free</code>
          </p>
        </div>
      </section>

      {/* Also available as */}
      <section style={{ marginBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 className="fade-up" style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Also available as</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 720, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{'\u{1F9E9}'}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Chrome Extension</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Real-time analysis while you shop</p>
          </div>
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{'\u{1F4E6}'}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>MCP Server</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>npx shopguard-mcp</p>
          </div>
          <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{'\u{1F4BB}'}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>npm Package</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>npm i shopguard-mcp</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ paddingTop: 32, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}>Terms of Service</a>
          <a href="/refund" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}>Refund Policy</a>
          <a href="https://gist.github.com/akfldk1028/ccec6da52c9e6a0a19788e0dd5498192" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}>Privacy Policy</a>
          <a href="https://github.com/akfldk1028" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}>GitHub</a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 40 }}>
          ShopGuard by clickaround &middot; Powered by shopguard-mcp
        </p>
      </footer>
    </div>
  );
}
