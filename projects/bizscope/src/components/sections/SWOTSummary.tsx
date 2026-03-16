import type { SWOTData } from '@/frameworks/types';
import SWOTGrid from '@/components/charts/SWOTGrid';

interface Props {
  data: SWOTData;
  subPage?: number;
}

export default function SWOTSummary({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {(all || subPage === 0) && <SWOTGrid data={data} />}

      {(all || subPage === 1) && (
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
