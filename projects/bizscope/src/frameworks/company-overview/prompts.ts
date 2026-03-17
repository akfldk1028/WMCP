import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 기업 분석 보고서를 작성합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "description": "기업에 대한 종합적 설명 (2-3문단)",
  "industry": "주요 산업 분야",
  "founded": "설립 연도 (알 수 있는 경우)",
  "headquarters": "본사 위치",
  "employees": "직원 수 규모",
  "revenue": "매출 규모",
  "mainProducts": ["주력 제품/서비스 목록"],
  "keyStrengths": ["핵심 강점 목록"],
  "recentNews": ["최근 주요 동향/뉴스"]
}`;

export function buildUserMessage(ctx: PipelineContext): string {
  return `다음 기업에 대한 종합적인 개요를 작성해 주세요: "${ctx.companyName}"

해당 기업의 산업, 주요 제품/서비스, 핵심 강점, 최근 동향 등을 포함해 주세요.
mainProducts, keyStrengths, recentNews는 각각 3-5개 항목으로 작성해 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 종합적인 개요를 작성해 주세요.

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
mainProducts, keyStrengths, recentNews는 각각 3-5개 항목으로 작성해 주세요.`;
}
