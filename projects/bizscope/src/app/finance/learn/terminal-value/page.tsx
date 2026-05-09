import { Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import TerminalValueSimulator from './Simulator';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'terminal-value')!;

const METHODS_TABLE: { group: 'DCF' | 'Multiple' | 'Others'; name: string; formula: string; assumption: string; modeled: boolean }[] = [
  { group: 'DCF', name: 'Growing Perpetuity', formula: 'CV = FCF_T+1 / (WACC − g)', assumption: 'FCF는 NOPLAT보다 변동폭이 커서 normalize한 FCF 추정 필요', modeled: true },
  { group: 'DCF', name: 'Value Driver Formula', formula: 'CV = NOPLAT × (1 − g/ROIC) / (WACC − g)', assumption: 'Growing 공식을 ROIC와 g로 표시 — 동일 결과', modeled: true },
  { group: 'DCF', name: 'Convergence Formula', formula: 'CV = NOPLAT / WACC', assumption: '모든 초과수익이 사라지는 시장균형 (ROIC = WACC)', modeled: true },
  { group: 'DCF', name: 'Aggressive Formula', formula: 'CV = NOPLAT / (WACC − g)', assumption: 'ROIC가 무한대로 증가하는 가정 — 가치 과대평가 주의', modeled: true },
  { group: 'Multiple', name: 'P/E Multiple Method', formula: 'CV = Net Income × P/E (예측 multiple)', assumption: '일정 기간 후의 P/E 예측이 어려움', modeled: true },
  { group: 'Multiple', name: 'EBITDA Multiple Method', formula: 'CV = EBITDA × EV/EBITDA (예측 multiple)', assumption: '예측 multiple 자체에 대한 예측 어려움', modeled: true },
  { group: 'Others', name: 'Liquidation-value Approach', formula: '예측기간 종료 후 자산매각 수익 추정 − 부채 상환', assumption: '회사의 liquidation이 확실한 경우에 국한', modeled: false },
  { group: 'Others', name: 'Replacement-cost Approach', formula: '회사 자산을 대체하는 데 필요한 cost', assumption: '유형자산에 국한 · 대체 가능 자산이 일부에 해당', modeled: false },
];

export default function TerminalValuePage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>Terminal Value(=Continuing Value)는 명시적 예측 이후의 영구 가치를 한 숫자로 압축한다. 산출 방식은 8가지.</Headline>
        <p className="text-sm leading-relaxed text-muted-foreground">
          DCF 기업가치의 50~80%를 Terminal Value가 차지하는 경우가 많기 때문에, 어떤 방식을 선택하느냐에 따라 결과가 크게
          달라진다. 본 페이지의 시뮬레이터로 같은 입력값에 6가지 방식을 동시 적용해 비교해본다.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold">8가지 방식 — 슬라이드 16 원본 표</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs">
                <th className="px-3 py-2 text-left font-semibold">Approach</th>
                <th className="px-3 py-2 text-left font-semibold">방식</th>
                <th className="px-3 py-2 text-left font-semibold">공식</th>
                <th className="px-3 py-2 text-left font-semibold">가정</th>
              </tr>
            </thead>
            <tbody>
              {METHODS_TABLE.map((m) => (
                <tr key={m.name} className={`border-b last:border-b-0 ${m.modeled ? '' : 'bg-muted/20'}`}>
                  <td className="px-3 py-2 text-xs">{m.group}</td>
                  <td className="px-3 py-2 text-xs font-medium">{m.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{m.formula}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{m.assumption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="note">
          본 시뮬레이터는 Liquidation·Replacement-cost를 제외한 6가지 방식만 모델링. 두 방식은 회사·자산별 특수 케이스라
          숫자만으로 자동화하기 어려움.
        </Callout>
      </section>

      <TerminalValueSimulator />

      <Formula>
        선택 가이드: 가장 보수적 = Convergence (ROIC=WACC) · 가장 공격적 = Aggressive · 일반적 권장 = Value Driver
      </Formula>
    </ChapterShell>
  );
}
