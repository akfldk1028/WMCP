'use client';

import type { FinancialAnalysisData } from '@/frameworks/types';
import dynamic from 'next/dynamic';

const IncomeChart = dynamic(() => import('@/components/charts/IncomeChart'), { ssr: false });

interface Props {
  data: FinancialAnalysisData;
  subPage?: number;
}

/** Try to parse a currency string like "약 258.9조원" or "$161.4B" into a number */
function parseAmount(s: string): number | null {
  if (!s) return null;
  const clean = s.replace(/[^0-9.\-조억백만TBMK]/g, '');
  const num = parseFloat(clean.replace(/[^0-9.\-]/g, ''));
  if (isNaN(num)) return null;
  if (s.includes('조')) return num * 1e12;
  if (s.includes('억')) return num * 1e8;
  if (s.includes('T')) return num * 1e12;
  if (s.includes('B')) return num * 1e9;
  if (s.includes('M')) return num * 1e6;
  return num;
}

export default function FinancialAnalysis({ data, subPage }: Props) {
  const all = subPage === undefined;

  // Build chart data from AI-generated income statement
  const chartData = data.incomeStatement.map(row => ({
    year: row.year,
    revenue: parseAmount(row.revenue),
    operatingIncome: parseAmount(row.operatingProfit),
    netIncome: parseAmount(row.netIncome),
  }));

  const hasChartData = chartData.some(d => d.revenue !== null);

  return (
    <div>
      {(all || subPage === 0) && (
        <div className="space-y-10">
          {/* Chart */}
          {hasChartData && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">손익 추이 차트</h3>
              <div className="mt-4">
                <IncomeChart data={chartData} />
              </div>
            </div>
          )}

          {/* Table */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">손익 추이</h3>
            {data.incomeStatement.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-4 font-semibold text-muted-foreground">항목</th>
                      {data.incomeStatement.map((row) => (
                        <th key={row.year} className="pb-2 pr-4 font-semibold text-muted-foreground">{row.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2.5 pr-4 font-medium">매출</td>
                      {data.incomeStatement.map((row) => (
                        <td key={row.year} className="py-2.5 pr-4 tabular-nums">{row.revenue}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2.5 pr-4 font-medium">영업이익</td>
                      {data.incomeStatement.map((row) => (
                        <td key={row.year} className="py-2.5 pr-4 tabular-nums">{row.operatingProfit}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-medium">당기순이익</td>
                      {data.incomeStatement.map((row) => (
                        <td key={row.year} className="py-2.5 pr-4 tabular-nums">{row.netIncome}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {data.costStructure.length > 0 && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">비용 구조</h3>
              <div className="mt-4 space-y-0 divide-y">
                {data.costStructure.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-medium">{c.category}</span>
                    <div className="flex items-center gap-3">
                      {c.amount && <span className="text-sm tabular-nums">{c.amount}</span>}
                      {c.percentage && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">{c.percentage}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {(all || subPage === 1) && (
        <div className={all ? 'mt-16 space-y-10' : 'space-y-10'}>
          {[
            { title: '성장성 지표', items: data.growthIndicators },
            { title: '안정성 지표', items: data.stabilityIndicators },
            ...(data.profitabilityIndicators ? [{ title: '수익성 지표', items: data.profitabilityIndicators }] : []),
          ].map(({ title, items }) => items.length > 0 && (
            <div key={title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">{title}</h3>
              <div className="mt-4 space-y-0 divide-y">
                {items.map((ind, i) => (
                  <div key={i} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{ind.metric}</span>
                      <span className="text-sm font-bold tabular-nums text-indigo-600">{ind.value}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{ind.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {data.lossAnalysis && (
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">적자 원인 분석</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.lossAnalysis}</p>
            </div>
          )}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">종합</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{data.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
