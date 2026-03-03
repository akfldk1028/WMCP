import './globals.css';
import { WebMCPRegistration } from './webmcp';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'ShopGuard — Evidence-Based Shopping Protection',
    template: '%s — ShopGuard',
  },
  description: 'Free Chrome extension that detects fake reviews, hidden fees, and dark patterns on any shopping site. 14 dark pattern types, 7 review signals, price analysis.',
  keywords: ['fake review checker', 'dark pattern detector', 'hidden fees', 'shopping protection', 'fakespot alternative', 'honey alternative', 'online shopping safety'],
  authors: [{ name: 'ShopGuard by clickaround' }],
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: 'ShopGuard — Never Get Tricked Again',
    description: 'Free Chrome extension that detects fake reviews, hidden fees, and 14 types of dark patterns on any shopping site.',
    url: 'https://shopguard-api.vercel.app',
    siteName: 'ShopGuard',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopGuard — Evidence-Based Shopping Protection',
    description: 'Free Chrome extension. Detects fake reviews, hidden fees, and dark patterns.',
  },
  alternates: {
    canonical: 'https://shopguard-api.vercel.app',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
  metadataBase: new URL('https://shopguard-api.vercel.app'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WebMCPRegistration />
        {children}
      </body>
    </html>
  );
}
