import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 기업의 내부역량 평가를 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "capabilities": [
    {
      "area": "역량 영역 (예: 기술력, 브랜드, 재무, 인재, 운영, 혁신)",
      "strengths": [{ "id": "S1", "description": "강점 설명" }],
      "weaknesses": [{ "id": "W1", "description": "약점 설명" }],
      "score": 1~5
    }
  ],
  "overallStrengths": [{ "id": "S1", "description": "핵심 강점" }],
  "overallWeaknesses": [{ "id": "W1", "description": "핵심 약점" }],
  "summary": "내부역량 평가 종합 요약"
}

6-8개 주요 역량 영역을 평가하세요.
강점은 S1~Sn, 약점은 W1~Wn으로 넘버링하세요. 전체 기업 기준으로 일련번호를 부여합니다.

중요 규칙:
- 각 영역에 반드시 강점과 약점을 최소 1개씩 도출하세요.
- overallStrengths는 반드시 4-6개를 도출하세요.
- overallWeaknesses는 반드시 4-6개를 도출하세요. 약점이 없는 기업은 없습니다.
- "데이터가 부족하다", "평가에 한계가 있다" 같은 메타 코멘트는 절대 쓰지 마세요.
- 데이터가 제한적이면 해당 산업의 일반적 맥락에서 합리적으로 추론하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 핵심 강점: ${overview.keyStrengths.join(', ')}`
    : '';

  return `"${ctx.companyName}" 기업의 내부역량을 평가해 주세요.${overviewText}

기술력, 브랜드 파워, 재무 건전성, 인적 자원, 운영 효율성, 혁신 역량 등 주요 영역별로 강점과 약점을 분석하고 점수를 매겨 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 핵심 강점: ${overview.keyStrengths.join(', ')}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 내부역량을 평가해 주세요.${overviewText}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
기술력, 브랜드 파워, 재무 건전성, 인적 자원, 운영 효율성, 혁신 역량 등 주요 영역별로 강점과 약점을 분석하고 점수를 매겨 주세요.`;
}
