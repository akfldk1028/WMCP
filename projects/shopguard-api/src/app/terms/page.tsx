export const metadata = {
  title: 'Terms of Service — ShopGuard',
};

export default function TermsPage() {
  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="nav-logo">
            <span style={{ fontSize: 22 }}>{'\u{1F6E1}\u{FE0F}'}</span>
            ShopGuard
          </a>
          <div className="nav-links">
            <a href="/#features">Features</a>
            <a href="/#pricing">Pricing</a>
            <a href="/#api">API</a>
          </div>
        </div>
      </nav>

      <div className="legal-page container-narrow">
        <a href="/" className="legal-back">{'\u2190'} Back to ShopGuard</a>
        <h1 className="legal-title fade-up">Terms of Service</h1>
        <p className="legal-date fade-up">Last updated: February 24, 2026</p>

        <div className="legal-summary fade-up fade-up-d1">
          <strong>Summary</strong>
          <p>
            ShopGuard provides shopping analysis tools (API, Chrome Extension, MCP Server).
            Free tier has 50 req/day, Pro is $49/mo with a 14-day free trial.
            {"Don't"} abuse it or resell access. Analysis results are informational, not legal advice.
          </p>
        </div>

        <div className="legal-content fade-up fade-up-d2">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using ShopGuard products and services ({'"'}Services{'"'}), including the ShopGuard API, Chrome Extension, and MCP Server, you agree to be bound by these Terms of Service. If you do not agree, do not use the Services.</p>

          <h2>2. Description of Services</h2>
          <p>ShopGuard provides AI-powered shopping protection tools that detect fake reviews, hidden fees, and dark patterns on e-commerce pages. Services are delivered as:</p>
          <ul>
            <li><strong>ShopGuard API</strong> — REST API for programmatic analysis of shopping pages</li>
            <li><strong>ShopGuard Chrome Extension</strong> — Browser extension for real-time shopping page analysis</li>
            <li><strong>ShopGuard MCP Server</strong> — Model Context Protocol server for AI agent integration</li>
          </ul>

          <h2>3. Subscription Plans</h2>
          <p><strong>Free Tier:</strong> Limited to 50 API requests per day. Includes page data extraction, dark pattern detection, and agent-readiness scanning.</p>
          <p><strong>Pro Tier:</strong> $49/month subscription. Includes all Free features plus review authenticity analysis (7 statistical signals), hidden fee detection, and price comparison. Billed monthly via Lemon Squeezy.</p>

          <h2>4. Payment and Billing</h2>
          <p>Pro subscriptions are billed monthly through our payment processor, Lemon Squeezy. By subscribing, you authorize recurring charges. You may cancel at any time; cancellation takes effect at the end of the current billing period.</p>

          <h2>5. Free Trial</h2>
          <p>New Pro subscribers receive a <strong>14-day free trial</strong>. You will not be charged during the trial period. If you do not cancel before the trial ends, your subscription will automatically begin and you will be charged.</p>

          <h2>6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Services for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, decompile, or disassemble the Services</li>
            <li>Share, resell, or redistribute your API key or subscription access</li>
            <li>Exceed rate limits or abuse the Services in a way that degrades performance for others</li>
            <li>Use the Services to harm, harass, or deceive consumers or businesses</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>All rights, title, and interest in the Services, including software, documentation, and branding, are owned by ShopGuard. Your use of the Services does not grant you ownership of any intellectual property.</p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>The Services are provided {'"'}as is{'"'} without warranties of any kind, express or implied. ShopGuard analysis results are <strong>informational only</strong> and do not constitute legal, financial, or professional advice. We do not guarantee the accuracy, completeness, or reliability of any analysis.</p>

          <h2>9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, ShopGuard and its operator shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Services.</p>

          <h2>10. Termination</h2>
          <p>We may suspend or terminate your access to the Services at any time for violation of these Terms. You may stop using the Services at any time by canceling your subscription.</p>

          <h2>11. Modifications</h2>
          <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the Services after changes constitutes acceptance.</p>

          <h2>12. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:clickaround8@gmail.com">clickaround8@gmail.com</a>.</p>
        </div>
      </div>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-copy">{'\u{1F6E1}\u{FE0F}'} ShopGuard by clickaround</div>
          <div className="footer-links">
            <a href="/terms">Terms</a>
            <a href="/refund">Refund Policy</a>
            <a href="https://gist.github.com/akfldk1028/ccec6da52c9e6a0a19788e0dd5498192">Privacy</a>
          </div>
        </div>
      </footer>
    </>
  );
}
