import type { Metadata } from 'next';
import { WaitlistForm } from './waitlist-form';

export const metadata: Metadata = {
  title: 'ShopGuard for Sellers — E-commerce Compliance Tools',
  description: 'Automated dark pattern compliance scanning, weekly reports, and fix guides for e-commerce sellers. Starting at \u20A99,900/month.',
};

export default function SellerPage() {
  return (
    <>
      {/* Nav */}
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="nav-logo">
            <img src="/logo.png" alt="" width={24} height={24} style={{ borderRadius: 4 }} />
            ShopGuard
          </a>
          <div className="nav-links">
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How it works</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#api">API</a>
            <a href="/seller">For Sellers</a>
            <a href="/#pricing" className="nav-cta">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="fade-up">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Coming Soon
            </div>
          </div>
          <h1 className="fade-up fade-up-d1">
            Is your store<br />
            <em>trustworthy?</em>
          </h1>
          <p className="hero-sub fade-up fade-up-d2">
            ShopGuard scans your e-commerce pages for dark patterns, fake urgency, and hidden fees — before your customers find them.
          </p>
          <p className="hero-note fade-up fade-up-d3">
            Your store might be losing customers to dark patterns you don{`'`}t even know about.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-label">The problem</div>
            <h2 className="section-title">Compliance is no longer optional</h2>
            <p className="section-desc">Regulations are tightening. Customers are leaving. Ignorance is not a defense.</p>
          </div>
          <div className="steps">
            <div className="feature-card fade-up" style={{ textAlign: 'center' }}>
              <div className="feature-icon feature-icon-lock" style={{ margin: '0 auto 16px' }}>{'\u{1F6A8}'}</div>
              <h3>EU DSA Fines</h3>
              <p>Up to <strong>6% of global revenue</strong> for manipulative design patterns. Enforcement is active.</p>
            </div>
            <div className="feature-card fade-up fade-up-d1" style={{ textAlign: 'center' }}>
              <div className="feature-icon feature-icon-shield" style={{ margin: '0 auto 16px' }}>{'\u{1F4DC}'}</div>
              <h3>Korea E-commerce Law</h3>
              <p>Strengthened regulations in <strong>2025</strong> targeting deceptive pricing and fake urgency tactics.</p>
            </div>
            <div className="feature-card fade-up fade-up-d2" style={{ textAlign: 'center' }}>
              <div className="feature-icon feature-icon-chart" style={{ margin: '0 auto 16px' }}>{'\u{1F4C9}'}</div>
              <h3>Trust = Conversion</h3>
              <p>Stores flagged for dark patterns see <strong>up to 30% drop</strong> in conversion rates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">How it works</div>
            <h2 className="section-title">Compliance in 3 steps</h2>
            <p className="section-desc">No code changes. No integration. Just your store URL.</p>
          </div>
          <div className="steps">
            <div className="step fade-up">
              <div className="step-num">1</div>
              <h3>Enter your store URL</h3>
              <p>Point ShopGuard at your store. We crawl your product pages, checkout flow, and signup forms.</p>
            </div>
            <div className="step fade-up fade-up-d1">
              <div className="step-num">2</div>
              <h3>Get a compliance report</h3>
              <p>Receive a detailed breakdown of dark patterns, deceptive pricing, and manipulative UI found on your site.</p>
            </div>
            <div className="step fade-up fade-up-d2">
              <div className="step-num">3</div>
              <h3>Fix with guided recommendations</h3>
              <p>Each issue comes with severity, evidence, and step-by-step fix instructions. No guesswork.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Seller tools</div>
            <h2 className="section-title">Everything you need to stay compliant</h2>
            <p className="section-desc">Automated scanning and actionable insights for your store.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card featured fade-up">
              <div className="feature-icon feature-icon-shield">{'\u{1F6E1}\u{FE0F}'}</div>
              <h3>Store Compliance Scan</h3>
              <p>Full-site scan covering 14 dark pattern types, deceptive pricing, fake urgency, confirmshaming, and hidden fees. Get a compliance score with evidence for every finding.</p>
            </div>
            <div className="feature-card fade-up fade-up-d1">
              <div className="feature-icon feature-icon-bot">{'\u{1F4CA}'}</div>
              <h3>Weekly Dark Pattern Report</h3>
              <p>Automated weekly scans delivered to your inbox. Track your compliance score over time.</p>
            </div>
            <div className="feature-card fade-up fade-up-d1">
              <div className="feature-icon feature-icon-search">{'\u{1F527}'}</div>
              <h3>Fix Guides &amp; Recommendations</h3>
              <p>Every issue includes severity rating, UI evidence, and specific code-level fix instructions.</p>
            </div>
            <div className="feature-card fade-up fade-up-d2">
              <div className="feature-icon feature-icon-money">{'\u{1F3C6}'}</div>
              <h3>Competitor Benchmarking</h3>
              <p>See how your compliance score stacks up against competitors in your category.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Simple seller pricing</h2>
            <p className="section-desc">One plan. Everything included.</p>
          </div>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <div className="price-card fade-up" style={{ border: '2px solid var(--accent)' }}>
              <div className="price-badge">Seller</div>
              <div style={{ paddingTop: 8 }} />
              <div className="price-tier">ShopGuard for Sellers</div>
              <div className="price-amount">{'\u20A9'}9,900 <span>/month</span></div>
              <div className="price-desc">14-day free trial. Cancel anytime.</div>
              <ul className="price-features">
                <li>Full store compliance scan</li>
                <li>Weekly dark pattern reports</li>
                <li>Fix guides &amp; recommendations</li>
                <li>Competitor benchmarking</li>
                <li>1,000 API requests/day</li>
                <li>Email support</li>
              </ul>
              <button className="price-btn price-btn-fill" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="cta-section">
        <div className="container">
          <h2 className="fade-up">Get early access</h2>
          <p className="fade-up fade-up-d1">Join the waitlist and be first to know when Seller tools launch.</p>
          <div className="fade-up fade-up-d2">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-copy">
            <img src="/logo.png" alt="" width={18} height={18} style={{ borderRadius: 3, verticalAlign: 'middle', marginRight: 6 }} />ShopGuard by clickaround &middot; {'\u00A9'} 2026
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
