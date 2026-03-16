import type { SevenSData } from '@/frameworks/types';
import SevenSPyramid from '@/components/charts/SevenSPyramid';

interface Props {
  data: SevenSData;
  subPage?: number;
}

const EL: Record<string, string> = {
  strategy: 'Strategy', structure: 'Structure', systems: 'Systems',
  'shared-values': 'Shared Values', style: 'Style', staff: 'Staff', skills: 'Skills',
};

export default function SevenSAlignment({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {(all || subPage === 0) && <SevenSPyramid items={data.items} />}

      {(all || subPage === 1) && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">변화 요구사항</h3>
          <div className="mt-4 divide-y">
            {data.items.map((item) => (
              <div key={item.element} className="grid grid-cols-[120px_1fr_auto] gap-4 py-3.5 text-sm">
                <span className="font-bold">{EL[item.element] ?? item.label}</span>
                <span className="text-muted-foreground">{item.requiredChange}</span>
                <div className="flex gap-1">
                  {item.relatedStrategies.map((s, j) => (
                    <code key={j} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold">{s}</code>
                  ))}
                </div>
              </div>
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
