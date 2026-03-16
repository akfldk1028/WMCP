import type { TOWSData } from '@/frameworks/types';
import TOWSHeatmap from '@/components/charts/TOWSHeatmap';

interface Props {
  data: TOWSData;
  subPage?: number;
}

export default function TOWSCrossMatrix({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {(all || subPage === 0) && (
        <TOWSHeatmap strengths={data.strengths} weaknesses={data.weaknesses} opportunities={data.opportunities} threats={data.threats} cells={data.cells} />
      )}

      {(all || subPage === 1) && data.derivedStrategyCodes.length > 0 && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            도출 전략 코드 <span className="ml-2 text-foreground">{data.derivedStrategyCodes.length}</span>
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.derivedStrategyCodes.map((code) => (
              <code key={code} className="rounded bg-muted px-2.5 py-1 text-xs font-bold">{code}</code>
            ))}
          </div>
        </div>
      )}

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
