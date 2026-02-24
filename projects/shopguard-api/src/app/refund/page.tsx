export const metadata = {
  title: 'Refund Policy — ShopGuard',
};

export default function RefundPage() {
  return (
    <div className="container" style={{ paddingTop: 60, paddingBottom: 60, maxWidth: 720 }}>
      <a href="/" style={{ color: 'var(--accent-blue)', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        {'\u2190'} ShopGuard API
      </a>

      <div className="fade-up" style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Refund Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Last updated: February 24, 2026</p>
      </div>

      {/* Quick summary */}
      <div className="glass-card fade-up fade-up-delay-1" style={{ padding: 24, marginBottom: 40 }}>
        <p style={{ color: 'var(--accent-cyan)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>TL;DR</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
          14-day free trial — cancel anytime, no charge. After your first payment, full refund within 14 days. After that, cancel anytime and keep access until the end of your billing period.
        </p>
      </div>

      <div className="legal-content fade-up fade-up-delay-2">
        <h2>Free Trial</h2>
        <p>All Pro subscriptions include a <strong>14-day free trial</strong>. During the trial, you have full access to Pro features at no charge. If ShopGuard is not right for you, simply cancel before the trial ends and you will not be charged.</p>

        <h2>Subscription Refunds</h2>
        <p>If you are not satisfied with your Pro subscription, you may request a <strong>full refund within 14 days</strong> of your first payment. To request a refund, email <a href="mailto:clickaround8@gmail.com">clickaround8@gmail.com</a> with your account details.</p>

        <h2>After 14 Days</h2>
        <p>After the 14-day refund window, subscriptions are non-refundable. You may cancel your subscription at any time, and you will continue to have access until the end of your current billing period.</p>

        <h2>How to Cancel</h2>
        <p>You can cancel your subscription at any time through:</p>
        <ul>
          <li>Your Lemon Squeezy customer portal</li>
          <li>Emailing <a href="mailto:clickaround8@gmail.com">clickaround8@gmail.com</a></li>
        </ul>
        <p>Cancellation takes effect at the end of your current billing period. You will not be charged again after cancellation.</p>

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

      <footer style={{ marginTop: 60, paddingTop: 24, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12, flexWrap: 'wrap' }}>
          <a href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>Terms</a>
          <a href="/refund" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14 }}>Refund Policy</a>
          <a href="https://gist.github.com/akfldk1028/ccec6da52c9e6a0a19788e0dd5498192" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14 }}>Privacy</a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>ShopGuard by clickaround</p>
      </footer>
    </div>
  );
}
