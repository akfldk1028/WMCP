'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Crown, ListOrdered, Medal, Trophy } from 'lucide-react';
import { formatKrw, safeParseValuationInput, valuate } from '@/lib/finance/valuation';

const STORAGE_KEY = 'bizscope:finance:lastValuation';

const RANKING_FALLBACK = {
  category: 'saas' as const,
  mau: 0,
  mrr: 0,
  monthlyChurn: 0,
  cac: 0,
  arpu: 0,
  monthlyGrowth: 0,
  grossMargin: 0,
};

interface Bench {
  name: string;
  category: string;
  arr: number;
  growth: number;
  churn: number;
  estimate: number;
  notes: string;
}

/* Public-comp informed seed list. These are illustrative midpoints, not prices. */
const SEED: Bench[] = [
  { name: 'Linear', category: 'SaaS · 협업', arr: 100_000_000_000, growth: 1.5, churn: 0.02, estimate: 1_300_000_000_000, notes: 'PLG, 빠른 성장 + 낮은 이탈' },
  { name: 'Notion', category: 'SaaS · 생산성', arr: 600_000_000_000, growth: 0.5, churn: 0.04, estimate: 13_000_000_000_000, notes: 'B2B2C 전환 진행 중' },
  { name: 'Figma', category: 'SaaS · 디자인', arr: 600_000_000_000, growth: 0.4, churn: 0.03, estimate: 20_000_000_000_000, notes: 'Adobe 인수 무산 후 재성장' },
  { name: 'Cursor', category: 'AI 에이전트 · 코딩', arr: 100_000_000_000, growth: 4.0, churn: 0.05, estimate: 9_000_000_000_000, notes: '폭발적 성장, 고멀티플' },
  { name: 'Perplexity', category: 'AI 에이전트 · 검색', arr: 50_000_000_000, growth: 3.0, churn: 0.06, estimate: 9_000_000_000_000, notes: '경쟁 치열, 차별화 관건' },
  { name: 'Substack', category: '콘텐츠', arr: 45_000_000_000, growth: 0.3, churn: 0.04, estimate: 800_000_000_000, notes: '크리에이터 수수료 모델' },
  { name: 'Gumroad', category: '콘텐츠 · 결제', arr: 25_000_000_000, growth: 0.15, churn: 0.05, estimate: 200_000_000_000, notes: '낮은 성장, 저멀티플' },
];

interface MyEntry {
  estimate: number;
  category: string;
  arr: number;
}

export default function RankingPage() {
  const [me, setMe] = useState<MyEntry | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const safe = safeParseValuationInput(JSON.parse(raw), RANKING_FALLBACK);
      if (safe.mrr <= 0) return; // No meaningful estimate yet — don't show in ranking.
      const v = valuate(safe);
      if (!Number.isFinite(v.range.mid) || v.range.mid <= 0) return;
      setMe({ estimate: v.range.mid, category: safe.category, arr: v.arr });
    } catch {
      /* ignore */
    }
  }, []);

  const list = useMemo(() => {
    const all: (Bench & { isMe?: boolean })[] = [...SEED];
    if (me && me.estimate > 0) {
      all.push({
        name: '🫵 내 작품',
        category: me.category,
        arr: me.arr,
        growth: 0,
        churn: 0,
        estimate: me.estimate,
        notes: '/finance/valuate에서 입력한 내 추정값',
        isMe: true,
      });
    }
    return all.sort((a, b) => b.estimate - a.estimate);
  }, [me]);

  const myRank = me ? list.findIndex((x) => x.isMe) + 1 : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">벤치마크</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            공개 데이터를 바탕으로 한 시드 비교군과 내 추정값을 같이 봅니다. 내 데이터는 브라우저에만 저장됩니다.
          </p>
        </div>
        {myRank ? (
          <div className="rounded-xl border bg-indigo-500/10 px-4 py-3 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">내 순위</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xl font-extrabold text-indigo-500">
              <Crown className="size-4" />
              {myRank}위
            </div>
          </div>
        ) : (
          <Link
            href="/finance/valuate"
            className="rounded-lg border px-4 py-2 text-xs font-semibold transition hover:bg-muted"
          >
            먼저 자가평가하기
          </Link>
        )}
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="grid grid-cols-[40px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>#</span>
          <span>이름 / 카테고리</span>
          <span className="text-right">ARR</span>
          <span className="text-right">추정 가치</span>
        </div>
        {list.map((row, i) => (
          <div
            key={`${row.name}-${i}`}
            className={`grid grid-cols-[40px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b px-5 py-4 text-sm last:border-b-0 ${
              row.isMe ? 'bg-indigo-500/5' : ''
            }`}
          >
            <span className="font-mono text-muted-foreground">
              {i === 0 ? <Trophy className="size-4 text-amber-500" /> : i === 1 ? <Medal className="size-4 text-zinc-400" /> : i === 2 ? <Medal className="size-4 text-amber-700" /> : i + 1}
            </span>
            <div>
              <div className={`font-semibold ${row.isMe ? 'text-indigo-500' : ''}`}>{row.name}</div>
              <div className="text-xs text-muted-foreground">{row.category}</div>
              {row.notes ? <div className="mt-0.5 text-xs text-muted-foreground/70">{row.notes}</div> : null}
            </div>
            <span className="text-right font-mono">{formatKrw(row.arr)}</span>
            <span className="text-right font-mono font-semibold">{formatKrw(row.estimate)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
        <ListOrdered className="mt-0.5 size-4 shrink-0" />
        <div>
          시드 데이터는 공개 자료 기반의 추정 미드포인트입니다. 실제 거래/투자 가격이 아닙니다. 내 데이터는 등록되지
          않으며, 같은 브라우저에서만 보입니다.
        </div>
      </div>
    </div>
  );
}
