import type { DifferentiationData } from '@/frameworks/types';

interface Props {
  data: DifferentiationData;
  subPage?: number;
}

export default function Differentiation({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Unique features table */}
      {(all || subPage === 0) && (
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            차별화 요소
          </h3>
          <div className="divide-y text-sm">
            <div className="grid grid-cols-3 gap-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <span>기능</span>
              <span>설명</span>
              <span>경쟁사 부재</span>
            </div>
            {data.uniqueFeatures.map((f, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 py-3">
                <span className="font-medium">{f.feature}</span>
                <span className="text-muted-foreground">{f.description}</span>
                <span className="text-muted-foreground">{f.competitorLack}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub 1: Positioning & Moat */}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-14 space-y-10' : 'space-y-10'}>
          <div className="border-l-2 border-indigo-600 pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Positioning Statement
            </p>
            <p className="mt-3 text-base leading-relaxed">{data.positioningStatement}</p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
              Moat 분석
            </h4>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.moat}</p>
          </div>

          {data.summary && (
            <div className="border-l-2 border-indigo-600 pl-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
                Key Takeaway
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {data.summary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
