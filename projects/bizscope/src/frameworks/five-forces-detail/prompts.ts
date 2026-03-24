import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. Porter's 5 Forces 각 축별 상세 분석을 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "axes": [{
    "axis": "rivalry" | "newEntrants" | "supplierPower" | "buyerPower" | "substitutes",
    "label": "축 한글명",
    "score": 1~5,
    "analysis": "상세 분석",
    "pestInfluences": [{ "pestFactor": "PEST 요인명", "influence": "영향 설명", "direction": "increase" | "decrease" | "neutral" }]
  }],
  "overallCompetitiveIntensity": 1~5,
  "summary": "5 Forces 종합 요약"
}

5개 축(rivalry, newEntrants, supplierPower, buyerPower, substitutes) 각각에 대해:
- score는 1(약함)~5(강함)로 평가
- pestInfluences는 각 축에 영향을 미치는 PEST 요인 2-4개를 교차 분석
- direction은 반드시 "increase", "decrease", "neutral" 중 하나`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}`
    : '';

  const pestText = ctx.pest
    ? `\n\nPEST 분석 요약:\n- 주요 요인: ${ctx.pest.factors.slice(0, 8).map((f) => `${f.category.toUpperCase()}: ${f.factor}`).join(', ')}\n- 종합: ${ctx.pest.summary}`
    : '';

  return `"${ctx.companyName}" 기업에 대한 Porter's 5 Forces 각 축별 상세 분석을 수행해 주세요.${overviewText}${pestText}

5개 축 각각에 대해 PEST 요인이 어떤 영향을 미치는지 교차 분석하세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}`
    : '';

  const pestText = ctx.pest
    ? `\n\nPEST 분석 요약:\n- 주요 요인: ${ctx.pest.factors.slice(0, 8).map((f) => `${f.category.toUpperCase()}: ${f.factor}`).join(', ')}\n- 종합: ${ctx.pest.summary}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업에 대한 Porter's 5 Forces 각 축별 상세 분석을 수행해 주세요.${overviewText}${pestText}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
5개 축 각각에 대해 PEST 요인이 어떤 영향을 미치는지 교차 분석하세요.`;
}
