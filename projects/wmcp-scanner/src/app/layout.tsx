import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebMCP Scanner - Is Your Site Agent-Ready?',
  description: 'Free AI agent readiness scanner. Check WebMCP compatibility, get an A-F grade, and actionable recommendations to make your site work with AI agents.',
  openGraph: {
    title: 'WebMCP Scanner - Is Your Site Agent-Ready?',
    description: 'Free AI agent readiness scanner. Get your WebMCP compatibility grade instantly.',
    type: 'website',
    siteName: 'WebMCP Scanner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebMCP Scanner - Is Your Site Agent-Ready?',
    description: 'Free AI agent readiness scanner. Get your WebMCP compatibility grade instantly.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
