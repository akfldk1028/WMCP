import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. McKinsey 7S 프레임워크로 전략 실행 정렬 분석을 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "items": [
    {
      "element": "strategy" | "structure" | "systems" | "shared-values" | "style" | "staff" | "skills",
      "label": "요소 한글 이름",
      "currentState": "현재 상태 설명",
      "requiredChange": "필요한 변화 설명",
      "difficulty": 1~5,
      "impact": 1~5,
      "relatedStrategies": ["관련 전략명 목록"]
    }
  ],
  "summary": "7S 정렬 종합 요약"
}

7개 요소(Strategy, Structure, Systems, Shared Values, Style, Staff, Skills) 모두 분석하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const strategies = ctx.strategyCombination?.strategies ?? [];

  const strategyList = strategies.length > 0
    ? `\n\n도출된 전략:\n${strategies.map((s) => `- [${s.combination}] ${s.strategy}: ${s.description}`).join('\n')}`
    : '';

  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}`
    : '';

  return `"${ctx.companyName}" 기업의 McKinsey 7S 정렬 분석을 수행해 주세요.${overviewText}${strategyList}

위 전략들을 실행하기 위해 7S 각 요소가 어떻게 정렬되어야 하는지 분석해 주세요.
relatedStrategies에는 관련된 전략의 이름을 넣어 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const strategies = ctx.strategyCombination?.strategies ?? [];

  const strategyList = strategies.length > 0
    ? `\n\n도출된 전략:\n${strategies.map((s) => `- [${s.combination}] ${s.strategy}: ${s.description}`).join('\n')}`
    : '';

  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 McKinsey 7S 정렬 분석을 수행해 주세요.${overviewText}${strategyList}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
위 전략들을 실행하기 위해 7S 각 요소가 어떻게 정렬되어야 하는지 분석해 주세요.
relatedStrategies에는 관련된 전략의 이름을 넣어 주세요.`;
}
