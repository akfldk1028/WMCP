import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { WebMCPRegistration } from './webmcp';
import { getMessages, detectLocale } from '@/i18n';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const defaultMessages = getMessages('ko');

/**
 * Static metadata — always Korean. Next.js static `metadata` export cannot
 * vary per-request. To support per-locale SEO, migrate to `generateMetadata()`.
 * TODO: Convert to generateMetadata() when i18n routing (app/[locale]/) is added.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bizscope.vercel.app'),
  title: {
    default: defaultMessages.ui.meta.title,
    template: defaultMessages.ui.meta.titleTemplate,
  },
  description: defaultMessages.ui.meta.description,
  keywords: ['비즈니스 전략', 'AI 분석', 'SWOT', 'PEST', '전략 보고서', '경영 컨설팅', 'BizScope AI', '아이디어 검증',
             'business strategy', 'AI analysis', 'strategy report', 'idea validation'],
  authors: [{ name: 'BizScope AI' }],
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
  openGraph: {
    title: defaultMessages.ui.meta.ogTitle,
    description: defaultMessages.ui.meta.ogDescription,
    siteName: 'BizScope AI',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultMessages.ui.meta.ogTitle,
    description: defaultMessages.ui.meta.ogDescription,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const acceptLang = hdrs.get('accept-language');
  const cookieHeader = hdrs.get('cookie');
  const locale = detectLocale(null, acceptLang, cookieHeader);

  return (
    <html lang={locale} className={cn("font-sans", geist.variable)} suppressHydrationWarning data-locale={locale}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <WebMCPRegistration />
        {children}
      </body>
    </html>
  );
}
