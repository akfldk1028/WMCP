import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';

export const metadata = {
  title: '학습 — Maker Finance',
  description:
    '서강대 이석근 교수 「재무 (기업가치 평가를 중심으로)」 + 「재무 101」 핸드아웃을 11개 챕터로 재구성. 모든 표·수식·예제 인터랙티브.',
};

export default function LearnIndex() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <BookOpen className="size-3.5 text-indigo-500" />
          11개 챕터 · 인터랙티브 워크샵
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">기업가치 평가 — 강의 흐름 그대로</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          서강대 이석근 교수의 「재무 (기업가치 평가를 중심으로)」(28장) 강의안과 「재무 101」(16장) 워크샵 핸드아웃을
          페이지 흐름 그대로 재현했습니다. 모든 표·공식·풀이 단계가 직접 입력 가능한 인터랙티브 형태입니다. 챕터 끝에는
          이마트·서강사 케이스 워크샵으로 이어집니다.
        </p>
      </div>

      <ol className="space-y-3">
        {LEARN_CHAPTERS.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/finance/learn/${c.slug}`}
              className="group flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition hover:border-indigo-500/40"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-sm font-bold text-indigo-500">
                  {c.number}
                </div>
                <div>
                  <div className="text-sm font-semibold">{c.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{c.source}</div>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl border bg-gradient-to-r from-indigo-500/5 to-purple-500/5 p-6">
        <h3 className="font-bold">11챕터를 끝냈다면, 워크샵으로</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          서강사·이마트 두 케이스를 직접 풀어보며 DCF 전 과정을 체득합니다.
        </p>
        <Link
          href="/finance/workshop"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          워크샵 시작
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
