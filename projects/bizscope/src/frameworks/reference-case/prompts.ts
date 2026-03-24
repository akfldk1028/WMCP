import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 타산업/경쟁사 성공사례 레퍼런스 분석을 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "cases": [{
    "company": "기업명",
    "industry": "산업",
    "strategy": "핵심 전략",
    "outcome": "성과/결과",
    "applicability": "대상 기업에 대한 적용 가능성"
  }],
  "implications": ["시사점 목록"],
  "summary": "레퍼런스 분석 종합 요약"
}

도출된 전략과 관련된 타산업 또는 글로벌 성공사례 1~3개를 분석하세요.
각 사례의 핵심 전략, 성과, 대상 기업에 대한 적용 가능성을 구체적으로 서술하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}`
    : '';

  const strategyText = ctx.strategyCombination
    ? `\n\n도출된 전략:\n${ctx.strategyCombination.strategies.slice(0, 5).map((s) => `- [${s.combination}] ${s.strategy}: ${s.description}`).join('\n')}`
    : '';

  return `"${ctx.companyName}" 기업을 위한 타산업/글로벌 성공사례 레퍼런스 분석을 수행해 주세요.${overviewText}${strategyText}

위 기업의 전략 방향과 관련된 성공사례 1~3개를 분석하고, 시사점을 도출해 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}`
    : '';

  const strategyText = ctx.strategyCombination
    ? `\n\n도출된 전략:\n${ctx.strategyCombination.strategies.slice(0, 5).map((s) => `- [${s.combination}] ${s.strategy}: ${s.description}`).join('\n')}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업을 위한 타산업/글로벌 성공사례 레퍼런스 분석을 수행해 주세요.${overviewText}${strategyText}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
전략 방향과 관련된 성공사례 1~3개를 분석하고, 시사점을 도출해 주세요.`;
}
