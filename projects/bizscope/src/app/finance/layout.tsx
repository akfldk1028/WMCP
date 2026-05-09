import Link from 'next/link';
import { ArrowLeft, Calculator, GraduationCap, ListOrdered, TrendingUp } from 'lucide-react';

const NAV = [
  { href: '/finance/valuate', label: '자가평가', icon: Calculator },
  { href: '/finance/ranking', label: '벤치마크', icon: ListOrdered },
  { href: '/finance/learn', label: '핵심 개념', icon: GraduationCap },
  { href: '/finance/playbook', label: '가치 증대', icon: TrendingUp },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              BizScope
            </Link>
            <Link href="/finance" className="text-sm font-bold tracking-tight">
              <span className="text-indigo-500">Maker</span> Finance
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30 py-6 text-center text-xs text-muted-foreground">
        본 도구의 가치 추정은 참고용이며, 실제 투자/거래의 근거가 되지 않습니다. · 자료 기반: 서강대 이석근 교수 「재무
        (기업가치 평가를 중심으로)」
      </footer>
    </div>
  );
}
