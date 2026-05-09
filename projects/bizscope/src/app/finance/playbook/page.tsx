import Link from 'next/link';
import { ArrowRight, Flame, TrendingUp, Zap } from 'lucide-react';

export const metadata = {
  title: '가치 증대 플레이북 — Maker Finance',
  description: '같은 매출이라도 가치가 3배 차이 나는 이유. 메이커가 당장 적용할 7가지 레버.',
};

interface Lever {
  num: number;
  title: string;
  hook: string;
  body: string;
  impact: string;
}

const LEVERS: Lever[] = [
  {
    num: 1,
    title: '월 이탈률을 절반으로',
    hook: 'Churn은 Multiple을 가장 빨리 깎는다.',
    body: '월 5% → 2.5% 이탈로만 줄여도 LTV가 2배. 같은 ARR에서 Multiple이 1.5~2배 뛴다. 가격 인상보다 먼저, 이탈 사유 5건 인터뷰부터.',
    impact: 'Multiple +50~80%',
  },
  {
    num: 2,
    title: '연간 결제 비중 끌어올리기',
    hook: '현금이 빨리 들어오면 할인율 부담이 줄어든다.',
    body: '월간 → 연간 전환 시 (a) Churn 체감, (b) FCF 앞당김, (c) 운전자본 부담 감소. 15% 할인 제공해도 가치 평가는 +20% 이상 가능.',
    impact: 'DCF +15~25%',
  },
  {
    num: 3,
    title: '매출 집중도 분산',
    hook: '한 고객이 30%를 차지하면 Multiple은 깎인다.',
    body: '상위 1개 고객이 매출 30% 이상이면 투자자/인수자는 위험 할인 적용. Top10 비중을 단계적으로 50% 이하로 낮추면 동일 ARR에 더 높은 가격이 매겨진다.',
    impact: 'Multiple +20~40%',
  },
  {
    num: 4,
    title: '총이익률 60% → 80%',
    hook: '같은 매출, 더 높은 마진 = 더 높은 FCF.',
    body: '인프라 비용 최적화, 모델/추론 비용 통제, 결제 수수료 협상. AI 에이전트는 토큰 비용이 마진의 핵심. 마진 +20%p는 DCF 30~40% 상승.',
    impact: 'DCF +30~40%',
  },
  {
    num: 5,
    title: '확장 매출(Expansion) 만들기',
    hook: '같은 고객이 더 많이 쓰면 Net Revenue Retention이 100%를 넘는다.',
    body: '시트 추가, 기능 업그레이드, 사용량 기반 결제. NRR 120%는 Multiple을 가장 강하게 끌어올리는 단일 지표. 신규 획득보다 ROI가 높다.',
    impact: 'Multiple +40~70%',
  },
  {
    num: 6,
    title: '문서화된 운영 = 매각 가능 회사',
    hook: '대표 머릿속에만 있는 회사는 평가받기 어렵다.',
    body: '온보딩, 환불, 인시던트, 보안 — 핵심 SOP를 위키로 공개. 인수자/투자자는 "대표가 빠져도 굴러가는가"를 본다. 같은 숫자에 +10~20% 프리미엄.',
    impact: 'Multiple +10~20%',
  },
  {
    num: 7,
    title: '증빙 가능한 데이터 적층',
    hook: '주장 대신 측정값.',
    body: '외부에서 검증 가능한 코호트 분석, 트래픽 출처, 결제 로그를 6개월 이상 쌓는다. "성장 중"이라는 말과 "지난 12주 코호트가 8% MoM 성장"은 가치 평가에서 완전히 다른 수치를 만든다.',
    impact: '신뢰도 +20~30점',
  },
];

export default function PlaybookPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <Flame className="size-3.5 text-rose-500" />
          Why & How to increase valuation
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">가치 증대 플레이북</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          같은 ARR이라도 어떤 메이커는 3배 가격을 받고, 어떤 메이커는 절반 가격에 팔린다. 차이를 만드는 7개 레버.
          자료 §4 「Why and How to increase valuation」 기반.
        </p>
      </div>

      <ol className="space-y-4">
        {LEVERS.map((lev) => (
          <li key={lev.num} className="rounded-2xl border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 font-bold text-indigo-500">
                {lev.num}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="text-lg font-bold">{lev.title}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    <TrendingUp className="size-3" />
                    {lev.impact}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-indigo-500">{lev.hook}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lev.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border bg-gradient-to-r from-rose-500/5 to-orange-500/5 p-6">
        <div className="flex items-center gap-3">
          <Zap className="size-5 text-rose-500" />
          <h3 className="font-bold">한 가지만 바꿔본다면 #1 (이탈률)부터.</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          이탈률은 LTV / Multiple / FCF 세 군데를 동시에 끌어올린다. 같은 노력 대비 가장 큰 리프팅.
        </p>
        <Link
          href="/finance/valuate"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          이탈률을 바꿔서 시뮬레이션
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
