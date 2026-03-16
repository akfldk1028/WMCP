import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 기업의 내부역량 평가를 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "capabilities": [
    {
      "area": "역량 영역 (예: 기술력, 브랜드, 재무, 인재, 운영, 혁신)",
      "strengths": ["해당 영역의 강점들"],
      "weaknesses": ["해당 영역의 약점들"],
      "score": 1~5
    }
  ],
  "overallStrengths": ["기업 전체 핵심 강점 3-5개"],
  "overallWeaknesses": ["기업 전체 핵심 약점 3-5개"],
  "summary": "내부역량 평가 종합 요약"
}

6-8개 주요 역량 영역을 평가하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 핵심 강점: ${overview.keyStrengths.join(', ')}`
    : '';

  return `"${ctx.companyName}" 기업의 내부역량을 평가해 주세요.${overviewText}

기술력, 브랜드 파워, 재무 건전성, 인적 자원, 운영 효율성, 혁신 역량 등 주요 영역별로 강점과 약점을 분석하고 점수를 매겨 주세요.`;
}
