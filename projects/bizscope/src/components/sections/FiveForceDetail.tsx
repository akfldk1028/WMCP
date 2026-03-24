import type { FiveForceDetailData } from '@/frameworks/types';

interface Props {
  data: FiveForceDetailData;
  subPage?: number;
}

const AXIS_LABELS: Record<string, string> = {
  rivalry: '기존 경쟁',
  newEntrants: '잠재 진입자',
  supplierPower: '공급자 교섭력',
  buyerPower: '구매자 교섭력',
  substitutes: '대체재 위협',
};

export default function FiveForceDetail({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {(all || subPage === 0) && (
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
              종합 경쟁 강도
            </span>
            <span className="text-2xl font-bold">{data.overallCompetitiveIntensity}/5</span>
          </div>
          <div className="space-y-0 divide-y">
            {data.axes.map((axis) => (
              <div key={axis.axis} className="py-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{axis.label || AXIS_LABELS[axis.axis] || axis.axis}</h4>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`h-2 w-6 rounded-sm ${i < axis.score ? 'bg-indigo-600' : 'bg-muted'}`} />
                    ))}
                    <span className="ml-2 text-sm font-bold tabular-nums">{axis.score}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{axis.analysis}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-8' : 'space-y-8'}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            PEST 교차 영향
          </h3>
          {data.axes.map((axis) => (
            axis.pestInfluences.length > 0 && (
              <div key={axis.axis}>
                <h4 className="text-sm font-semibold">{axis.label || AXIS_LABELS[axis.axis]}</h4>
                <div className="mt-2 space-y-0 divide-y">
                  {axis.pestInfluences.map((inf, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <span className={`mt-0.5 shrink-0 text-xs font-bold ${
                        inf.direction === 'increase' ? 'text-red-500' : inf.direction === 'decrease' ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}>
                        {inf.direction === 'increase' ? '\u25B2' : inf.direction === 'decrease' ? '\u25BC' : '\u25CF'}
                      </span>
                      <div>
                        <span className="text-sm font-medium">{inf.pestFactor}</span>
                        <p className="text-xs text-muted-foreground">{inf.influence}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </div>
      )}
    </div>
  );
}
