import type { KeyEnvVariablesData } from '@/frameworks/types';

interface Props {
  data: KeyEnvVariablesData;
  subPage?: number;
}

export default function KeyEnvVariables({ data, subPage }: Props) {
  const all = subPage === undefined;

  const renderVar = (v: { id: string; label: string; probability: number; impact: number; priorityScore: number; description: string }, isOpp: boolean) => (
    <div key={v.id} className="py-3.5">
      <div className="flex items-center gap-3">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${isOpp ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {v.id}
        </span>
        <span className="flex-1 font-semibold">{v.label}</span>
        <span className="text-sm font-bold tabular-nums text-indigo-600">{v.priorityScore.toFixed(2)}</span>
      </div>
      <p className="ml-11 mt-1 text-sm text-muted-foreground">{v.description}</p>
      <div className="ml-11 mt-1 flex gap-4 text-xs text-muted-foreground/70">
        <span>발생확률: {(v.probability * 100).toFixed(0)}%</span>
        <span>영향도: {v.impact}/5</span>
      </div>
    </div>
  );

  return (
    <div>
      {(all || subPage === 0) && (
        <div className="space-y-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-600">
            기회 ({data.opportunities.length}개)
          </h3>
          <div className="divide-y">{data.opportunities.map(v => renderVar(v, true))}</div>
        </div>
      )}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-6' : 'space-y-6'}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-500">
            위협 ({data.threats.length}개)
          </h3>
          <div className="divide-y">{data.threats.map(v => renderVar(v, false))}</div>
        </div>
      )}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-16 space-y-6' : 'space-y-6'}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            우선순위 종합 (확률 &times; 영향도)
          </h3>
          <div className="divide-y">
            {data.priorityRanking.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 py-2.5">
                <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-indigo-600">{i + 1}</span>
                <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${item.id.startsWith('O') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {item.id}
                </span>
                <span className="flex-1 text-sm">{item.label}</span>
                <span className="text-sm font-bold tabular-nums">{item.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </div>
      )}
    </div>
  );
}
