import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 도출된 전략과 기업의 현행 전략을 비교 분석합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "comparisons": [
    {
      "strategyLabel": "A",
      "strategyName": "전략 이름",
      "currentStrategy": "기업이 현재 실행 중인 관련 전략 (2-3문장)",
      "sevenSComparison": "7S 관점에서의 비교 분석 (2-3문장)",
      "verdict": "match" | "supplement" | "missing"
    }
  ],
  "summary": "전체 비교 분석 종합 요약 (3-5문장)"
}

판정 기준:
- match: 도출 전략과 현행 전략이 이미 일치하거나 매우 유사
- supplement: 현행 전략이 존재하나 보완이 필요
- missing: 현행 전략에 해당 영역이 부재하여 신규 도입 필요

주의사항:
- 우선순위 매트릭스의 상위 전략들을 A, B, C... 순으로 비교
- 7S(전략, 구조, 시스템, 공유가치, 스타일, 인력, 역량) 관점을 반드시 반영
- 기업의 공개된 전략, 보도자료, IR 등에서 추론한 현행 전략을 기술`;

export function buildUserMessage(ctx: PipelineContext): string {
  const parts: string[] = [`"${ctx.companyName}" 기업의 도출 전략과 현행 전략을 비교해 주세요.`];

  if (ctx.priorityMatrix) {
    const ranked = [...ctx.priorityMatrix.strategies]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
    const labels = 'ABCDEFGHIJ';
    parts.push('\n[우선순위 전략]');
    ranked.forEach((s, i) => {
      parts.push(`${labels[i]}. ${s.strategy} (난이도: ${s.difficulty}, 영향력: ${s.impact}, 구간: ${s.quadrant})`);
    });
  }

  if (ctx.sevenS) {
    parts.push('\n[7S 분석 결과]');
    ctx.sevenS.items.forEach((item) => {
      parts.push(`- ${item.label}: 현재(${item.currentState}) → 변화 필요(${item.requiredChange})`);
    });
  }

  if (ctx.companyOverview) {
    parts.push(`\n[기업 개요]\n${ctx.companyOverview.description}`);
    if (ctx.companyOverview.keyStrengths.length > 0) {
      parts.push(`핵심 강점: ${ctx.companyOverview.keyStrengths.join(', ')}`);
    }
  }

  parts.push('\n위 전략들을 기업의 현행 전략과 비교하고 match/supplement/missing으로 판정해 주세요.');

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const parts: string[] = [`다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 도출 전략과 현행 전략을 비교해 주세요.`];

  if (ctx.priorityMatrix) {
    const ranked = [...ctx.priorityMatrix.strategies]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
    const labels = 'ABCDEFGHIJ';
    parts.push('\n[우선순위 전략]');
    ranked.forEach((s, i) => {
      parts.push(`${labels[i]}. ${s.strategy} (난이도: ${s.difficulty}, 영향력: ${s.impact}, 구간: ${s.quadrant})`);
    });
  }

  if (ctx.sevenS) {
    parts.push('\n[7S 분석 결과]');
    ctx.sevenS.items.forEach((item) => {
      parts.push(`- ${item.label}: 현재(${item.currentState}) → 변화 필요(${item.requiredChange})`);
    });
  }

  if (ctx.companyOverview) {
    parts.push(`\n[기업 개요]\n${ctx.companyOverview.description}`);
    if (ctx.companyOverview.keyStrengths.length > 0) {
      parts.push(`핵심 강점: ${ctx.companyOverview.keyStrengths.join(', ')}`);
    }
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '위 전략들을 기업의 현행 전략과 비교하고 match/supplement/missing으로 판정해 주세요.',
  );

  return parts.join('\n');
}
