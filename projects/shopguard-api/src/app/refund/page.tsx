export const metadata = {
  title: 'Refund Policy — ShopGuard',
};

export default function RefundPage() {
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
        <h1 className="legal-title fade-up">Refund Policy</h1>
        <p className="legal-date fade-up">Last updated: February 25, 2026</p>

        <div className="legal-summary fade-up fade-up-d1">
          <strong>Summary</strong>
          <p>
            14-day free trial — cancel anytime, no charge.
            After your first payment, full refund within 14 days.
            After that, cancel anytime and keep access until the end of your billing period.
          </p>
        </div>

        <div className="legal-content fade-up fade-up-d2">
          <h2>Free Trial</h2>
          <p>All paid subscriptions (Consumer Pro, Developer, Enterprise) include a <strong>14-day free trial</strong>. During the trial, you have full access to your plan{`'`}s features at no charge. If ShopGuard is not right for you, simply cancel before the trial ends and you will not be charged.</p>

          <h2>Subscription Refunds</h2>
          <p>If you are not satisfied with your paid subscription, you may request a <strong>full refund within 14 days</strong> of your first payment. To request a refund, email <a href="mailto:clickaround8@gmail.com">clickaround8@gmail.com</a> with your account details.</p>

          <h2>After 14 Days</h2>
          <p>After the 14-day refund window, subscriptions are non-refundable. You may cancel your subscription at any time, and you will continue to have access until the end of your current billing period.</p>

          <h2>How to Cancel</h2>
          <p>You can cancel your subscription at any time through:</p>
          <ul>
            <li>Your Lemon Squeezy customer portal</li>
            <li>Emailing <a href="mailto:clickaround8@gmail.com">clickaround8@gmail.com</a></li>
          </ul>
          <p>Cancellation takes effect at the end of your current billing period. You will not be charged again.</p>

          <h2>Exceptions</h2>
          <p>We may issue refunds outside of this policy at our discretion in cases of:</p>
          <ul>
            <li>Extended service outages caused by us</li>
            <li>Billing errors or duplicate charges</li>
            <li>Other exceptional circumstances</li>
          </ul>

          <h2>Contact</h2>
          <p>For refund requests or billing questions, email <a href="mailto:clickaround8@gmail.com">clickaround8@gmail.com</a>.</p>
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
