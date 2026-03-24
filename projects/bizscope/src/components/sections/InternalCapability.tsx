import type { InternalCapabilityData } from '@/frameworks/types';
import ScoreBar from '@/components/charts/ScoreBar';

interface Props {
  data: InternalCapabilityData;
  subPage?: number;
}

export default function InternalCapability({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {/* Sub 0: Capability areas */}
      {(all || subPage === 0) && (
        <div className="space-y-6">
          {data.capabilities.map((cap) => (
            <div key={cap.area}>
              {/* Area header */}
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-sm font-bold">{cap.area}</h4>
                <div className="w-28"><ScoreBar score={cap.score} /></div>
              </div>
              {/* S/W columns */}
              <div className="mt-3 grid grid-cols-2 gap-8">
                <div>
                  {cap.strengths.map((s, i) => (
                    <p key={i} className="py-1 text-sm text-muted-foreground">
                      <span className="mr-2 text-xs font-bold text-sky-600">{s.id}</span>{s.description}
                    </p>
                  ))}
                  {cap.strengths.length === 0 && <p className="py-1 text-sm text-muted-foreground/50">—</p>}
                </div>
                <div>
                  {cap.weaknesses.map((w, i) => (
                    <p key={i} className="py-1 text-sm text-muted-foreground">
                      <span className="mr-2 text-xs font-bold text-rose-500">{w.id}</span>{w.description}
                    </p>
                  ))}
                  {cap.weaknesses.length === 0 && <p className="py-1 text-sm text-muted-foreground/50">—</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub 1: Overall S/W */}
      {(all || subPage === 1) && (
        <div className={`grid gap-12 md:grid-cols-2 ${all ? 'mt-14' : ''}`}>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-600">종합 강점</h4>
            <div className="mt-3 divide-y">
              {data.overallStrengths.map((s, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <span className="w-5 shrink-0 text-sm font-bold tabular-nums text-sky-600">{s.id}</span>
                  <p className="text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-rose-500">종합 약점</h4>
            <div className="mt-3 divide-y">
              {data.overallWeaknesses.map((w, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <span className="w-5 shrink-0 text-sm font-bold tabular-nums text-rose-500">{w.id}</span>
                  <p className="text-sm leading-relaxed">{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub 2: Takeaway */}
      {(all || subPage === 2) && (
        <div className={all ? 'mt-14' : ''}>
          <div className="border-l-2 border-indigo-600 pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">Key Takeaway</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
