import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 경쟁사 비교 분석을 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "competitors": [
    {
      "name": "경쟁사명",
      "strengths": ["강점 목록"],
      "weaknesses": ["약점 목록"],
      "marketShare": "시장점유율 (추정)",
      "keyDifferentiator": "핵심 차별화 요소"
    }
  ],
  "gaps": [
    {
      "area": "비교 영역",
      "ourPosition": "우리 기업의 현재 포지션",
      "competitorBest": "경쟁사 중 최고 수준",
      "gap": "격차 설명",
      "action": "대응 방안"
    }
  ],
  "summary": "경쟁사 비교 종합 요약"
}

3-5개 주요 경쟁사를 분석하고, 4-6개 영역에서 Gap 분석을 수행하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 핵심 강점: ${overview.keyStrengths.join(', ')}`
    : '';

  const swotText = ctx.swot
    ? `\n\nSWOT 요약:\n- 강점: ${ctx.swot.strengths.slice(0, 3).join(', ')}\n- 약점: ${ctx.swot.weaknesses.slice(0, 3).join(', ')}`
    : '';

  return `"${ctx.companyName}" 기업의 경쟁사 비교 분석을 수행해 주세요.${overviewText}${swotText}

주요 경쟁사를 식별하고, 각 경쟁사의 강점/약점을 분석한 후, 우리 기업과의 Gap 분석을 수행해 주세요.`;
}
