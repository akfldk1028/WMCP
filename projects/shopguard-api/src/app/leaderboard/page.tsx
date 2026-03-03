import type { Metadata } from 'next';
import { CopyLinkButton } from './copy-link';

export const metadata: Metadata = {
  title: 'Dark Pattern Leaderboard 2026 — Which Shopping Sites Trick You Most?',
  description:
    'We analyzed the top e-commerce sites for manipulative design patterns. See which shopping sites use the most dark patterns — ranked and graded.',
};

const sites = [
  { rank: 1, name: 'Temu', score: 'F', patterns: 11, worst: 'Fake urgency, forced account creation, hidden fees', category: 'Marketplace' },
  { rank: 2, name: 'Wish', score: 'F', patterns: 10, worst: 'Fake scarcity, bait-and-switch, drip pricing', category: 'Marketplace' },
  { rank: 3, name: 'AliExpress', score: 'D', patterns: 8, worst: 'Fake social proof, countdown timers, misdirection', category: 'Marketplace' },
  { rank: 4, name: 'Booking.com', score: 'D', patterns: 8, worst: 'Fake urgency, confirmshaming, hidden fees', category: 'Travel' },
  { rank: 5, name: 'Amazon', score: 'C', patterns: 6, worst: 'Fake reviews, subscribe traps, dark ads', category: 'Marketplace' },
  { rank: 6, name: 'Walmart', score: 'C', patterns: 5, worst: 'Preselection, disguised ads, price anchoring', category: 'Retail' },
  { rank: 7, name: 'eBay', score: 'B', patterns: 4, worst: 'Fake urgency, forced continuity', category: 'Marketplace' },
  { rank: 8, name: 'Target', score: 'B', patterns: 3, worst: 'Preselection, nagging popups', category: 'Retail' },
  { rank: 9, name: 'Shopify Stores', score: 'B', patterns: 3, worst: 'Varies by store — countdown timers common', category: 'Platform' },
  { rank: 10, name: 'Apple Store', score: 'A', patterns: 1, worst: 'Minor: price anchoring on trade-in', category: 'Direct' },
];

const gradeColors: Record<string, string> = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  F: '#dc2626',
};

const gradeBg: Record<string, string> = {
  A: '#f0fdf4',
  B: '#f7fee7',
  C: '#fefce8',
  D: '#fff7ed',
  F: '#fef2f2',
};

const categoryColors: Record<string, { bg: string; color: string }> = {
  Marketplace: { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  Travel: { bg: '#f0f9ff', color: '#0284c7' },
  Retail: { bg: '#fdf4ff', color: '#a21caf' },
  Platform: { bg: '#fff7ed', color: '#c2410c' },
  Direct: { bg: '#ecfdf5', color: '#059669' },
};

export default function LeaderboardPage() {
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
            <a href="https://chromewebstore.google.com/detail/shopguard/befjaannnnnhcnmbgjhcakhjgmjcjklf" className="nav-cta">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="container">
          <div className="fade-up">
            <div className="section-label">Dark Pattern Leaderboard</div>
          </div>
          <h1 className="fade-up fade-up-d1" style={{ fontSize: 52 }}>
            Which shopping sites<br />
            <em>trick you the most?</em>
          </h1>
          <p className="hero-sub fade-up fade-up-d2">
            We analyzed the top e-commerce sites for manipulative design patterns. Here are the results.
          </p>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {/* Table header (hidden on mobile via CSS) */}
          <div className="lb-header fade-up">
            <span>Rank</span>
            <span>Site</span>
            <span>Grade</span>
            <span>Patterns</span>
            <span>Worst offenses</span>
            <span>Category</span>
          </div>

          {/* Table rows */}
          {sites.map((site) => (
            <div
              key={site.rank}
              className={`lb-row fade-up ${site.rank <= 3 ? '' : `fade-up-d${Math.min(site.rank - 1, 4)}`}`}
            >
              {/* Rank */}
              <span
                className="lb-rank"
                style={{
                  fontWeight: 800,
                  fontSize: site.rank <= 3 ? 20 : 16,
                  color: site.rank <= 3 ? gradeColors[site.score] : 'var(--text-muted)',
                }}
              >
                #{site.rank}
              </span>

              {/* Site name */}
              <span className="lb-name" style={{ fontWeight: 700, fontSize: 16 }}>
                {site.name}
              </span>

              {/* Grade */}
              <span
                className="lb-grade"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: gradeBg[site.score],
                  color: gradeColors[site.score],
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                {site.score}
              </span>

              {/* Pattern count */}
              <span className="lb-patterns" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{site.patterns}</span>
                {' '}found
              </span>

              {/* Worst patterns */}
              <span className="lb-worst" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {site.worst}
              </span>

              {/* Category badge */}
              <span
                className="lb-category"
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  background: categoryColors[site.category]?.bg || 'var(--bg-muted)',
                  color: categoryColors[site.category]?.color || 'var(--text-muted)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {site.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="section section-alt">
        <div className="container-narrow">
          <div className="section-header">
            <div className="section-label">Methodology</div>
            <h2 className="section-title">How we score</h2>
          </div>
          <div
            className="fade-up"
            style={{
              padding: 28,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          >
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              ShopGuard scans each site{`'`}s checkout flow, product pages, and account creation for
              {' '}<strong style={{ color: 'var(--text)' }}>14 types of dark patterns</strong>.
              Sites are graded <strong style={{ color: 'var(--text)' }}>A</strong> (cleanest) to
              {' '}<strong style={{ color: 'var(--text)' }}>F</strong> (most manipulative)
              based on pattern count, severity, and prevalence.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              {Object.entries(gradeColors).map(([grade, color]) => (
                <div
                  key={grade}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color,
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: gradeBg[grade],
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {grade}
                  </span>
                  {grade === 'A' && '0\u20132 patterns'}
                  {grade === 'B' && '3\u20134 patterns'}
                  {grade === 'C' && '5\u20136 patterns'}
                  {grade === 'D' && '7\u20138 patterns'}
                  {grade === 'F' && '9+ patterns'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-header">
            <div className="section-label">Try it yourself</div>
            <h2 className="section-title">Check any site yourself</h2>
            <p className="section-desc">
              Install the free Chrome Extension and scan any shopping site for dark patterns in seconds.
            </p>
          </div>
          <div className="fade-up">
            <a
              href="https://chromewebstore.google.com/detail/shopguard/befjaannnnnhcnmbgjhcakhjgmjcjklf"
              className="btn-primary"
            >
              {'\u{2B07}'} Add to Chrome — Free
            </a>
          </div>
        </div>
      </section>

      {/* Share */}
      <section className="section section-alt" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            Share this leaderboard
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Help others shop smarter. Share the results.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="https://twitter.com/intent/tweet?text=Which%20shopping%20sites%20trick%20you%20the%20most%3F%20Check%20the%20Dark%20Pattern%20Leaderboard%20by%20ShopGuard&url=https%3A%2F%2Fshopguard-api.vercel.app%2Fleaderboard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              Share on X
            </a>
            <a
              href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fshopguard-api.vercel.app%2Fleaderboard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              Share on LinkedIn
            </a>
            <a
              href="https://www.reddit.com/submit?url=https%3A%2F%2Fshopguard-api.vercel.app%2Fleaderboard&title=Dark%20Pattern%20Leaderboard%202026%20%E2%80%94%20Which%20Shopping%20Sites%20Trick%20You%20Most%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              Share on Reddit
            </a>
            <CopyLinkButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-copy">
            <img src="/logo.png" alt="" width={18} height={18} style={{ borderRadius: 3, verticalAlign: 'middle', marginRight: 6 }} />ShopGuard by clickaround {'\u00B7'} {'\u00A9'} 2026
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
