import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 핵심 성과지표(KPI) 분석을 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "kpis": [{ "metric": "지표명", "value": "수치", "trend": "up" | "down" | "stable", "benchmark": "업계 벤치마크" }],
  "marketPosition": "시장 지위 분석",
  "industryComparison": "동종업계 비교",
  "summary": "KPI 종합 요약"
}

5-8개 핵심 지표를 구체적 수치와 함께 분석하세요. MAU, 거래액, 다운로드, 시장 점유율 등.
trend는 반드시 "up", "down", "stable" 중 하나여야 합니다.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 매출: ${overview.revenue ?? '정보 없음'}\n- 직원 수: ${overview.employees ?? '정보 없음'}`
    : '';

  return `"${ctx.companyName}" 기업의 핵심 성과지표(KPI)를 분석해 주세요.${overviewText}

MAU, 거래액(GMV), 앱 다운로드, 시장 점유율, 매출 성장률 등 5-8개 핵심 지표를 구체적 수치와 함께 분석하세요.
각 지표의 추세(trend)와 업계 벤치마크를 포함해 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 매출: ${overview.revenue ?? '정보 없음'}\n- 직원 수: ${overview.employees ?? '정보 없음'}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 핵심 성과지표(KPI)를 분석해 주세요.${overviewText}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
MAU, 거래액(GMV), 앱 다운로드, 시장 점유율, 매출 성장률 등 5-8개 핵심 지표를 구체적 수치와 함께 분석하세요.`;
}
