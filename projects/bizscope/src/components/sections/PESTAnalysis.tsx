import type { PESTData } from '@/frameworks/types';
import PESTTable from '@/components/charts/PESTTable';
import FiveForceRadar from '@/components/charts/FiveForceRadar';

interface Props {
  data: PESTData;
  subPage?: number;
}

export default function PESTAnalysis({ data, subPage }: Props) {
  const all = subPage === undefined;

  return (
    <div>
      {(all || subPage === 0) && <PESTTable factors={data.factors} />}

      {(all || subPage === 1) && data.factors.length > 0 && (
        <div className={all ? 'mt-14' : ''}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            Porter&apos;s Five Forces
          </h3>
          <div className="mt-4">
            <FiveForceRadar factors={data.factors} />
          </div>
        </div>
      )}

      {(all || subPage === 2) && (
        <div className={all ? 'mt-14' : ''}>
          <div className="border-l-2 border-indigo-600 pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-600">
              Key Takeaway
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
