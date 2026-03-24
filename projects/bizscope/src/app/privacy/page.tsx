import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — BizScope AI',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        &larr; BizScope AI
      </Link>

      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-6 text-sm text-muted-foreground">Last updated: March 18, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            BizScope AI collects minimal data necessary to provide the service:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Company/Idea inputs:</strong> The company name or idea description you enter for analysis. These are processed in real-time and not permanently stored on our servers.</li>
            <li><strong>License keys:</strong> If you purchase a plan, your license key is stored to verify your subscription status.</li>
            <li><strong>Usage counts:</strong> Free-tier usage is tracked locally in your browser (localStorage) — no server-side tracking.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">2. Chrome Extension</h2>
          <p>The BizScope AI Chrome extension:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Only activates when you explicitly use the context menu, popup, or keyboard shortcut.</li>
            <li>Does not read or collect browsing history.</li>
            <li>Does not inject scripts into web pages.</li>
            <li>Stores your license key and preferences locally using <code>chrome.storage.local</code>.</li>
            <li>Only communicates with <code>bizscope-rho.vercel.app</code> to perform analysis.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">3. AI Processing</h2>
          <p>
            Your inputs are sent to third-party AI providers (Anthropic, OpenAI, xAI, Google) for analysis.
            Each provider has its own privacy policy. We do not store AI-generated reports on our servers
            beyond the duration of your browser session.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">4. Payment</h2>
          <p>
            Payments are processed by LemonSqueezy. We do not store credit card information.
            LemonSqueezy handles all payment data under their own privacy policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">5. Data Storage</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Report data is stored in your browser&apos;s localStorage and is never uploaded.</li>
            <li>License verification data is stored in Upstash Redis (encrypted at rest).</li>
            <li>No cookies are used for tracking.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">6. Contact</h2>
          <p>
            For privacy-related questions, contact us at{' '}
            <a href="mailto:clickaround8@gmail.com" className="text-indigo-600 underline">clickaround8@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
