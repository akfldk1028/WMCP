export default function Home() {
  return (
    <>
      {/* Nav */}
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="nav-logo">
            <span style={{ fontSize: 22 }}>{'\u{1F6E1}\u{FE0F}'}</span>
            ShopGuard
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#api">API</a>
            <a href="#pricing" className="nav-cta">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="fade-up">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Now available on Chrome Web Store
            </div>
          </div>
          <h1 className="fade-up fade-up-d1">
            Shop smarter.<br />
            <em>Never get tricked again.</em>
          </h1>
          <p className="hero-sub fade-up fade-up-d2">
            ShopGuard detects fake reviews, hidden fees, and dark patterns on any shopping page — so you can buy with confidence.
          </p>
          <div className="hero-actions fade-up fade-up-d3">
            <a href="https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf" className="btn-primary">
              {'\u{2B07}'} Add to Chrome — Free
            </a>
            <a href="#api" className="btn-secondary">
              View API Docs
            </a>
          </div>
          <p className="hero-note fade-up fade-up-d4">
            Free forever &middot; No account required &middot; Works on any shopping site
          </p>

          {/* Browser Mockup */}
          <div className="hero-mockup fade-up fade-up-d4">
            <div className="browser-frame">
              <div className="browser-bar">
                <div className="browser-dot" style={{ background: '#ff5f57' }} />
                <div className="browser-dot" style={{ background: '#febc2e' }} />
                <div className="browser-dot" style={{ background: '#28c840' }} />
                <div className="browser-url">amazon.com/product/wireless-headphones</div>
              </div>
              <div className="browser-content">
                <div style={{ display: 'flex', gap: 24 }}>
                  {/* Left: product area */}
                  <div style={{ flex: 1 }}>
                    <div style={{ background: 'var(--bg-muted)', borderRadius: 12, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: 48, opacity: 0.3 }}>{'\u{1F3A7}'}</span>
                    </div>
                    <div style={{ height: 12, background: 'var(--bg-muted)', borderRadius: 6, width: '80%', marginBottom: 8 }} />
                    <div style={{ height: 10, background: 'var(--bg-muted)', borderRadius: 6, width: '60%' }} />
                  </div>
                  {/* Right: ShopGuard overlay */}
                  <div style={{ width: 280, background: 'white', border: '2px solid var(--accent)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <span style={{ fontSize: 18 }}>{'\u{1F6E1}\u{FE0F}'}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>ShopGuard Analysis</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{'\u26A0\u{FE0F}'}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>3 Issues Found</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Trust Score: 42/100</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--red)' }}>{'\u2716'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Suspicious review pattern detected</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--orange)' }}>{'\u26A0'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Hidden shipping fee: +$12.99</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span style={{ color: 'var(--orange)' }}>{'\u26A0'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Fake urgency: "Only 2 left"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="trust-bar">
        <p>Works with</p>
        <div className="trust-logos">
          <span>Amazon</span>
          <span>eBay</span>
          <span>Shopify Stores</span>
          <span>AliExpress</span>
          <span>Walmart</span>
          <span>Any Shopping Site</span>
        </div>
      </div>

      {/* How it Works */}
      <section id="how-it-works" className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">How it works</div>
            <h2 className="section-title">Protection in 3 seconds</h2>
            <p className="section-desc">No setup. No account. Just install and shop.</p>
          </div>
          <div className="steps">
            <div className="step fade-up">
              <div className="step-num">1</div>
              <h3>Install the extension</h3>
              <p>Add ShopGuard to Chrome in one click. Free, lightweight, and privacy-first.</p>
            </div>
            <div className="step fade-up fade-up-d1">
              <div className="step-num">2</div>
              <h3>Visit any shopping page</h3>
              <p>Go to Amazon, eBay, Shopify, or any e-commerce site as you normally would.</p>
            </div>
            <div className="step fade-up fade-up-d2">
              <div className="step-num">3</div>
              <h3>See instant analysis</h3>
              <p>ShopGuard scans the page and shows you trust scores, fake review alerts, and hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Features</div>
            <h2 className="section-title">Everything that protects you</h2>
            <p className="section-desc">Evidence-based analysis powered by pattern recognition — not guesswork.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card featured fade-up">
              <div className="feature-icon feature-icon-shield">{'\u{1F6E1}\u{FE0F}'}</div>
              <h3>Dark Pattern Detection</h3>
              <p>Identifies 9 types of manipulative UI patterns: fake urgency, forced actions, confirmshaming, hidden costs, trick questions, disguised ads, bait-and-switch, and more. Each detection includes evidence and severity.</p>
              <span className="feature-tag tag-free">Free</span>
            </div>
            <div className="feature-card fade-up fade-up-d1">
              <div className="feature-icon feature-icon-bot">{'\u{1F916}'}</div>
              <h3>Agent-Ready Scan</h3>
              <p>Checks if a site supports AI agents with Schema.org, OpenGraph, and MCP metadata.</p>
              <span className="feature-tag tag-free">Free</span>
            </div>
            <div className="feature-card fade-up fade-up-d1">
              <div className="feature-icon feature-icon-search">{'\u{1F50D}'}</div>
              <h3>Fake Review Detection</h3>
              <p>7 statistical signals analyze review authenticity: sentiment distribution, timing clusters, duplicate content, and more.</p>
              <span className="feature-tag tag-pro">Pro</span>
            </div>
            <div className="feature-card fade-up fade-up-d2">
              <div className="feature-icon feature-icon-money">{'\u{1F4B0}'}</div>
              <h3>Hidden Fee Scanner</h3>
              <p>Catches drip pricing, bait-and-switch, surprise charges, and deceptive price anchoring.</p>
              <span className="feature-tag tag-pro">Pro</span>
            </div>
            <div className="feature-card featured fade-up fade-up-d2">
              <div className="feature-icon feature-icon-chart">{'\u{1F4CA}'}</div>
              <h3>Price Comparison</h3>
              <p>Compare prices across sources with fee-inclusive analysis. Detect outliers and suspicious pricing patterns. Understand the true cost before you buy.</p>
              <span className="feature-tag tag-pro">Pro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detection Demo */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Real example</div>
            <h2 className="section-title">What ShopGuard finds</h2>
            <p className="section-desc">Here{`'`}s what a typical scan looks like on a suspicious product page.</p>
          </div>
          <div className="detection-demo fade-up">
            <div className="demo-header">{'\u{1F6E1}\u{FE0F}'} ShopGuard Analysis — Trust Score: 38/100</div>
            <div className="demo-body">
              <div className="demo-item">
                <span className="demo-severity severity-high">High</span>
                <div className="demo-text">
                  <strong>Fake Urgency Detected</strong>
                  <span>{`"`}Only 2 left in stock — order soon!{`"`} — Counter resets on refresh</span>
                </div>
              </div>
              <div className="demo-item">
                <span className="demo-severity severity-high">High</span>
                <div className="demo-text">
                  <strong>Suspicious Review Pattern</strong>
                  <span>78% of 5-star reviews posted within same 48-hour window</span>
                </div>
              </div>
              <div className="demo-item">
                <span className="demo-severity severity-medium">Medium</span>
                <div className="demo-text">
                  <strong>Hidden Shipping Fee</strong>
                  <span>$12.99 shipping added at checkout, not shown on product page</span>
                </div>
              </div>
              <div className="demo-item">
                <span className="demo-severity severity-medium">Medium</span>
                <div className="demo-text">
                  <strong>Confirmshaming</strong>
                  <span>{`"`}No thanks, I don{`'`}t want to save money{`"`} — opt-out link</span>
                </div>
              </div>
              <div className="demo-item">
                <span className="demo-severity severity-low">Low</span>
                <div className="demo-text">
                  <strong>Price Anchoring</strong>
                  <span>Original price $199 shown but never actually sold at that price</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Simple, transparent pricing</h2>
            <p className="section-desc">Start free. Upgrade when you need deeper analysis.</p>
          </div>
          <div className="pricing-grid-4">
            {/* Free */}
            <div className="price-card fade-up">
              <div className="price-tier">Free</div>
              <div className="price-amount">$0</div>
              <div className="price-desc">Free forever. No credit card.</div>
              <ul className="price-features">
                <li>Dark pattern detection (9 types)</li>
                <li>Page data extraction</li>
                <li>Agent-readiness scan</li>
                <li>50 API requests/day</li>
                <li>Chrome Extension</li>
              </ul>
              <a href="https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf" className="price-btn price-btn-outline">
                Install Free Extension
              </a>
            </div>

            {/* Consumer Pro */}
            <div className="price-card popular fade-up fade-up-d1">
              <div className="price-badge">Most Popular</div>
              <div className="price-tier">Consumer Pro</div>
              <div className="price-amount">$4.99 <span>/month</span></div>
              <div className="price-desc">14-day free trial. Cancel anytime.</div>
              <ul className="price-features">
                <li>Everything in Free</li>
                <li>Fake review detection (7 signals)</li>
                <li>Hidden fee scanner</li>
                <li>Price comparison</li>
                <li>200 API requests/day</li>
              </ul>
              <a href="https://clickaround.lemonsqueezy.com/checkout/buy/2e995298-d33c-4ab1-8350-fb7c68363da7" className="price-btn price-btn-fill">
                Start Free Trial
              </a>
            </div>

            {/* Developer */}
            <div className="price-card fade-up fade-up-d2">
              <div className="price-tier">Developer</div>
              <div className="price-amount">$19 <span>/month</span></div>
              <div className="price-desc">For apps and integrations.</div>
              <ul className="price-features">
                <li>Everything in Consumer Pro</li>
                <li>Dedicated API key</li>
                <li>Programmatic access</li>
                <li>Batch analysis</li>
                <li>5,000 API requests/day</li>
              </ul>
              <a href="https://clickaround.lemonsqueezy.com" className="price-btn price-btn-outline">
                Get API Key
              </a>
            </div>

            {/* Enterprise */}
            <div className="price-card fade-up fade-up-d3">
              <div className="price-tier">Enterprise</div>
              <div className="price-amount">$99 <span>/month</span></div>
              <div className="price-desc">Compliance-grade analysis.</div>
              <ul className="price-features">
                <li>Everything in Developer</li>
                <li>Compliance reports</li>
                <li>SLA guarantee</li>
                <li>Priority support</li>
                <li>50,000 API requests/day</li>
              </ul>
              <a href="mailto:clickaround8@gmail.com" className="price-btn price-btn-outline">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Platforms</div>
            <h2 className="section-title">Use it everywhere</h2>
            <p className="section-desc">Browser, terminal, or AI agent — ShopGuard fits your workflow.</p>
          </div>
          <div className="platforms">
            <div className="platform-card fade-up">
              <div className="platform-icon">{'\u{1F310}'}</div>
              <h3>Chrome Extension</h3>
              <p>Real-time protection while you shop</p>
            </div>
            <div className="platform-card fade-up fade-up-d1">
              <div className="platform-icon">{'\u{1F4E6}'}</div>
              <h3>MCP Server</h3>
              <p>For AI agents and coding assistants</p>
              <code>npx shopguard-mcp</code>
            </div>
            <div className="platform-card fade-up fade-up-d2">
              <div className="platform-icon">{'\u{26A1}'}</div>
              <h3>REST API</h3>
              <p>Integrate into any application</p>
              <code>POST /api/analyze</code>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="section section-alt">
        <div className="container-narrow">
          <div className="section-header">
            <div className="section-label">For Developers</div>
            <h2 className="section-title">API Reference</h2>
            <p className="section-desc">REST endpoints ready to integrate in minutes.</p>
          </div>
          <div className="api-endpoints fade-up">
            {[
              { method: 'POST', path: '/api/analyze', desc: 'Full page analysis', tag: 'Free' },
              { method: 'POST', path: '/api/darkpatterns', desc: 'Dark pattern scan (9 types)', tag: 'Free' },
              { method: 'POST', path: '/api/reviews', desc: 'Review authenticity (7 signals)', tag: 'Pro' },
              { method: 'POST', path: '/api/pricing', desc: 'Hidden fee detection', tag: 'Pro' },
            ].map(ep => (
              <div key={ep.path} className="endpoint">
                <span className="endpoint-method">{ep.method}</span>
                <span className="endpoint-path">{ep.path}</span>
                <span className="endpoint-desc">{ep.desc}</span>
                <span className={`feature-tag ${ep.tag === 'Free' ? 'tag-free' : 'tag-pro'}`}>{ep.tag}</span>
              </div>
            ))}
          </div>
          <div className="fade-up fade-up-d1">
            <div className="code-block">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`curl -X POST https://shopguard-api.vercel.app/api/analyze \\
  -H "Authorization: Bearer sg_demo_free" \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<html>...shopping page...</html>"}'`}</pre>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
              Try instantly with demo key <code style={{ background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>sg_demo_free</code>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently asked questions</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-q">Is ShopGuard free?</div>
              <div className="faq-a">Yes. The Chrome Extension and basic API access are free forever with 50 requests/day. Pro features like fake review detection and hidden fee scanning start at $4.99/month.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">Which sites does it work on?</div>
              <div className="faq-a">ShopGuard works on any shopping site — Amazon, eBay, Shopify stores, AliExpress, Walmart, and more. If it has product listings, ShopGuard can analyze it.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">Does it collect my browsing data?</div>
              <div className="faq-a">No. ShopGuard analyzes pages locally in your browser. In Free mode, no data leaves your device. Pro features send page data to our API for analysis, but we never store personal information.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">How accurate is the detection?</div>
              <div className="faq-a">ShopGuard uses evidence-based pattern analysis with 7 statistical signals for reviews and 9 dark pattern classifiers. It flags suspicious patterns with evidence — not accusations. The server pipeline also uses AI classification for additional context.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">Can I use the API for my own product?</div>
              <div className="faq-a">Absolutely. The REST API and MCP Server are built for developers and AI agents. Free tier gives you 50 requests/day, Developer plan gives 5,000, and Enterprise gives 50,000.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q">What{`'`}s the refund policy?</div>
              <div className="faq-a">14-day free trial on all paid subscriptions. After your first payment, full refund within 14 days. No questions asked. <a href="/refund" style={{ color: 'var(--accent)' }}>Read full policy</a>.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2 className="fade-up">Ready to shop smarter?</h2>
          <p className="fade-up fade-up-d1">Join thousands of smart shoppers who never get tricked.</p>
          <div className="fade-up fade-up-d2">
            <a href="https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf" className="btn-primary">
              {'\u{2B07}'} Add to Chrome — Free
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-copy">
            {'\u{1F6E1}\u{FE0F}'} ShopGuard by clickaround &middot; {'\u00A9'} 2026
          </div>
          <div className="footer-links">
            <a href="/terms">Terms of Service</a>
            <a href="/refund">Refund Policy</a>
            <a href="https://gist.github.com/akfldk1028/ccec6da52c9e6a0a19788e0dd5498192">Privacy Policy</a>
            <a href="https://github.com/akfldk1028">GitHub</a>
            <a href="mailto:clickaround8@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
