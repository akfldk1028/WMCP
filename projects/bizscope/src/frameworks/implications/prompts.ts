import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 종합 분석을 바탕으로 시사점과 액션 아이템을 도출합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "keyInsights": ["핵심 시사점 5-7개"],
  "actionItems": [
    {
      "priority": "high" | "medium" | "low",
      "action": "실행 과제",
      "timeline": "실행 시기 (예: 단기 1-3개월)",
      "owner": "담당 부서/역할",
      "expectedOutcome": "기대 효과"
    }
  ],
  "roadmap": "3단계 실행 로드맵 (단기/중기/장기)",
  "conclusion": "최종 결론 및 제언"
}

actionItems은 8-12개, priority별로 고르게 분배하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const parts: string[] = [`"${ctx.companyName}" 기업의 종합 분석 결과를 바탕으로 시사점과 액션 아이템을 도출해 주세요.`];

  if (ctx.companyOverview) {
    parts.push(`\n기업: ${ctx.companyOverview.industry} - ${ctx.companyOverview.description.slice(0, 200)}`);
  }

  if (ctx.swot) {
    parts.push(`\nSWOT 요약:\n- 강점: ${ctx.swot.strengths.slice(0, 3).join(', ')}\n- 약점: ${ctx.swot.weaknesses.slice(0, 3).join(', ')}\n- 기회: ${ctx.swot.opportunities.slice(0, 3).join(', ')}\n- 위협: ${ctx.swot.threats.slice(0, 3).join(', ')}`);
  }

  if (ctx.priorityMatrix) {
    const topStrategies = ctx.priorityMatrix.topPicks;
    parts.push(`\n최우선 전략: ${topStrategies.join(', ')}`);
  }

  if (ctx.competitor) {
    const compNames = ctx.competitor.competitors.map((c) => c.name).join(', ');
    parts.push(`\n주요 경쟁사: ${compNames}`);
  }

  if (ctx.sevenS) {
    const highImpact = ctx.sevenS.items
      .filter((i) => i.impact >= 4)
      .map((i) => `${i.label}: ${i.requiredChange}`)
      .slice(0, 3);
    if (highImpact.length > 0) {
      parts.push(`\n7S 주요 변화 필요: ${highImpact.join(' / ')}`);
    }
  }

  parts.push('\n위 분석 결과를 종합하여 실행 가능한 시사점, 구체적 액션 아이템, 로드맵을 도출해 주세요.');

  return parts.join('\n');
}
