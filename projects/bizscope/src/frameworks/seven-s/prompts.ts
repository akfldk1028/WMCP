import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 도출된 전략들을 McKinsey 7S 프레임워크로 재분류합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "items": [
    {
      "element": "strategy"|"structure"|"systems"|"shared-values"|"style"|"staff"|"skills",
      "label": "요소 한글 이름",
      "currentState": "현재 상태",
      "requiredChange": "필요한 변화",
      "difficulty": 1~5,
      "impact": 1~5,
      "relatedStrategies": ["관련 전략명"],
      "executionStatus": "not-started"|"in-progress"|"completed",
      "progress": 0~100
    }
  ],
  "strategyClassification": [
    {
      "strategyId": "전략 ID",
      "strategyName": "전략명",
      "sevenSElement": "해당 7S 요소",
      "rationale": "분류 근거"
    }
  ],
  "summary": "7S 재분류 종합 요약"
}

7개 요소 모두 분석하되, 각 요소에 해당하는 전략들을 재분류하세요.
strategyClassification에서 모든 도출 전략을 빠짐없이 7S 요소에 배정하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const strategies = ctx.strategyCombination?.strategies ?? [];

  const strategyList = strategies.length > 0
    ? `\n\n도출된 전략 (총 ${strategies.length}개):\n${strategies.map((s) => `- [${s.combination}] ${s.id ? `(${s.id}) ` : ''}${s.strategy}: ${s.description}`).join('\n')}`
    : '';

  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}`
    : '';

  return `"${ctx.companyName}" 기업의 도출된 전략들을 McKinsey 7S 프레임워크로 재분류해 주세요.${overviewText}${strategyList}

위 전략들을 7S 각 요소(Strategy, Structure, Systems, Shared Values, Style, Staff, Skills)에 배정하세요.
각 7S 요소의 현재 상태와 필요한 변화를 분석하고, 모든 전략을 빠짐없이 strategyClassification에 포함시키세요.
relatedStrategies에는 해당 7S 요소에 배정된 전략의 이름을 넣어 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const strategies = ctx.strategyCombination?.strategies ?? [];

  const strategyList = strategies.length > 0
    ? `\n\n도출된 전략 (총 ${strategies.length}개):\n${strategies.map((s) => `- [${s.combination}] ${s.id ? `(${s.id}) ` : ''}${s.strategy}: ${s.description}`).join('\n')}`
    : '';

  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 도출된 전략들을 McKinsey 7S 프레임워크로 재분류해 주세요.${overviewText}${strategyList}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
위 전략들을 7S 각 요소에 배정하고, 각 요소의 현재 상태와 필요한 변화를 분석하세요.
모든 전략을 빠짐없이 strategyClassification에 포함시키세요.
relatedStrategies에는 해당 7S 요소에 배정된 전략의 이름을 넣어 주세요.`;
}
