import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. SWOT 교차 전략을 수립합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "strategies": [
    {
      "combination": "SO" | "ST" | "WO" | "WT",
      "strategy": "전략 이름",
      "description": "전략 설명 (2-3문장)",
      "relatedSW": "관련 강점 또는 약점",
      "relatedOT": "관련 기회 또는 위협",
      "feasibility": 1~5,
      "impact": 1~5
    }
  ],
  "summary": "전략 조합 종합 요약"
}

각 조합(SO, ST, WO, WT)별로 2-3개씩, 총 8-12개 전략을 도출하세요.
- SO: 강점으로 기회를 활용
- ST: 강점으로 위협을 방어
- WO: 약점을 보완하여 기회를 활용
- WT: 약점과 위협을 최소화`;

export function buildUserMessage(ctx: PipelineContext): string {
  const swot = ctx.swot;
  if (!swot) return `"${ctx.companyName}" 기업의 SWOT 교차 전략을 도출해 주세요.`;

  const parts = [
    `"${ctx.companyName}" 기업의 SWOT 교차 전략을 도출해 주세요.`,
    '',
    'SWOT 분석 결과:',
    `- 강점: ${swot.strengths.join(' / ')}`,
    `- 약점: ${swot.weaknesses.join(' / ')}`,
    `- 기회: ${swot.opportunities.join(' / ')}`,
    `- 위협: ${swot.threats.join(' / ')}`,
  ];

  // TOWS 교차 매트릭스에서 도출된 전략 코드 반영
  if (ctx.towsCrossMatrix?.derivedStrategyCodes?.length) {
    parts.push('');
    parts.push('TOWS 교차 매트릭스에서 도출된 활성 전략 코드:');
    parts.push(ctx.towsCrossMatrix.derivedStrategyCodes.join(', '));
    parts.push('위 전략 코드를 우선적으로 반영하여 구체적인 실행 전략을 도출해 주세요.');
  } else {
    parts.push('');
    parts.push('위 SWOT 요소들을 교차 조합하여 구체적이고 실행 가능한 전략을 도출해 주세요.');
  }

  return parts.join('\n');
}
