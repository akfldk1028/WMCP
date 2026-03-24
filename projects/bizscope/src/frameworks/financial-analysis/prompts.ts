import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 재무 현황 분석을 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "incomeStatement": [{ "year": "연도", "revenue": "매출", "operatingProfit": "영업이익", "netIncome": "당기순이익" }],
  "costStructure": [{ "category": "비용 항목", "amount": "금액", "percentage": "비중" }],
  "growthIndicators": [{ "metric": "성장성 지표명", "value": "수치", "interpretation": "해석" }],
  "stabilityIndicators": [{ "metric": "안정성 지표명", "value": "수치", "interpretation": "해석" }],
  "profitabilityIndicators": [{ "metric": "수익성 지표명", "value": "수치", "interpretation": "해석" }],
  "lossAnalysis": "적자 원인 분석 (해당시)",
  "summary": "재무 종합 요약"
}

손익계산서 기반 3개년 트렌드, 비용 항목별 분해, 적자 원인 분석을 수행하세요.
incomeStatement는 최근 3개년, costStructure는 4-6개 항목, 각 지표군은 3-5개씩 작성하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 매출: ${overview.revenue ?? '정보 없음'}\n- 직원 수: ${overview.employees ?? '정보 없음'}`
    : '';

  return `"${ctx.companyName}" 기업의 재무 현황을 분석해 주세요.${overviewText}

손익계산서 기반 3개년 트렌드, 비용 항목별 분해, 성장성/안정성/수익성 지표 분석을 수행하세요.
적자 기업인 경우 적자 원인 분석도 포함해 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 매출: ${overview.revenue ?? '정보 없음'}\n- 직원 수: ${overview.employees ?? '정보 없음'}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 재무 현황을 분석해 주세요.${overviewText}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
손익계산서 기반 3개년 트렌드, 비용 항목별 분해, 성장성/안정성/수익성 지표 분석을 수행하세요.`;
}
