import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { WebMCPRegistration } from './webmcp';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bizscope.vercel.app'),
  title: {
    default: 'BizScope AI — AI 비즈니스 전략 보고서',
    template: '%s | BizScope AI',
  },
  description:
    'AI가 20가지 프레임워크로 생성하는 컨설팅급 비즈니스 전략 보고서. PEST, SWOT, TOWS, 7S, Porter 5 Forces 분석 + 아이디어 타당성 검증.',
  keywords: ['비즈니스 전략', 'AI 분석', 'SWOT', 'PEST', '전략 보고서', '경영 컨설팅', 'BizScope AI', '아이디어 검증'],
  authors: [{ name: 'BizScope AI' }],
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
  openGraph: {
    title: 'BizScope AI — AI 비즈니스 전략 보고서',
    description: 'AI가 20가지 프레임워크로 생성하는 컨설팅급 전략 보고서',
    siteName: 'BizScope AI',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizScope AI — AI 비즈니스 전략 보고서',
    description: 'AI가 20가지 프레임워크로 생성하는 컨설팅급 전략 보고서',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <WebMCPRegistration />
        {children}
      </body>
    </html>
  );
}
