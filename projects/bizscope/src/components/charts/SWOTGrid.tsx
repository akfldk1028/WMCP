'use client';

import type { SWOTData } from '@/frameworks/types';

interface SWOTGridProps {
  data: SWOTData;
}

interface QuadrantProps {
  title: string;
  prefix: string;
  items: string[];
  bgClass: string;
  titleClass: string;
  badgeBg: string;
}

function Quadrant({ title, prefix, items, bgClass, titleClass, badgeBg }: QuadrantProps) {
  return (
    <div className={`rounded-lg p-4 ${bgClass} min-h-[160px]`}>
      <h3 className={`text-base font-bold mb-3 ${titleClass}`}>
        <span className="text-2xl">{prefix.charAt(0)}</span>
        <span className="text-sm">{title.slice(1)}</span>
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-gray-800">
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${badgeBg}`}
            >
              {prefix}{i + 1}
            </span>
            <span className="leading-snug">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SWOTGrid({ data }: SWOTGridProps) {
  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700 border border-slate-200">
        환경분석으로부터 도출한 기회(O) 및 위기(T) 요인과 내부역량분석을 통하여 도출한
        강점(S)/약점(W)으로 SWOT 전략 List를 나열할 수 있음
      </div>

      {/* S/W side by side */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Quadrant
          title="trength"
          prefix="S"
          items={data.strengths}
          bgClass="bg-sky-50 border border-sky-200"
          titleClass="text-sky-800"
          badgeBg="bg-sky-500"
        />
        <Quadrant
          title="eakness"
          prefix="W"
          items={data.weaknesses}
          bgClass="bg-rose-50 border border-rose-200"
          titleClass="text-rose-800"
          badgeBg="bg-rose-400"
        />
      </div>

      {/* O/T side by side */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Quadrant
          title="pportunity"
          prefix="O"
          items={data.opportunities}
          bgClass="bg-emerald-50 border border-emerald-200"
          titleClass="text-emerald-800"
          badgeBg="bg-emerald-500"
        />
        <Quadrant
          title="hreat"
          prefix="T"
          items={data.threats}
          bgClass="bg-amber-50 border border-amber-200"
          titleClass="text-amber-800"
          badgeBg="bg-amber-500"
        />
      </div>
    </div>
  );
}
