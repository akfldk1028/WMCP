import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. TOWS 교차 매트릭스(Weihrich 1982)를 작성합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

TOWS 교차 매트릭스란:
- SWOT의 각 요소를 번호 매기고 (S1, S2, ..., W1, W2, ..., O1, O2, ..., T1, T2, ...)
- 강점/약점(행) × 기회/위협(열)의 교차점에서 전략적 연관성이 있는 셀을 활성화
- 활성 셀마다 전략코드를 부여 (예: "S1O3" = 강점1로 기회3을 활용)

JSON 스키마:
{
  "cells": [
    {
      "swType": "S" 또는 "W",
      "swIndex": 1부터 시작하는 번호,
      "otType": "O" 또는 "T",
      "otIndex": 1부터 시작하는 번호,
      "active": true,
      "strategyCode": "S1O3"
    }
  ],
  "derivedStrategyCodes": ["S1O3", "S2T1", ...],
  "summary": "TOWS 교차 분석 종합 요약 (3-4문장)"
}

주의사항:
- active가 true인 셀만 배열에 포함하세요
- 각 조합(SO, ST, WO, WT)에서 최소 3개 이상 활성 셀을 선정하세요
- 총 12~20개 활성 셀이 적절합니다
- strategyCode는 "S{n}O{m}" 또는 "S{n}T{m}" 또는 "W{n}O{m}" 또는 "W{n}T{m}" 형식`;

export function buildUserMessage(ctx: PipelineContext): string {
  const swot = ctx.swot;
  if (!swot) return `"${ctx.companyName}" 기업의 TOWS 교차 매트릭스를 작성해 주세요.`;

  const numberedList = (items: string[], prefix: string) =>
    items.map((item, i) => `${prefix}${i + 1}: ${item}`).join('\n');

  return `"${ctx.companyName}" 기업의 TOWS 교차 매트릭스를 작성해 주세요.

SWOT 분석 결과:

[강점 - Strengths]
${numberedList(swot.strengths, 'S')}

[약점 - Weaknesses]
${numberedList(swot.weaknesses, 'W')}

[기회 - Opportunities]
${numberedList(swot.opportunities, 'O')}

[위협 - Threats]
${numberedList(swot.threats, 'T')}

위 요소들의 교차점을 분석하여 전략적으로 유의미한 조합을 선별하고 활성화해 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const swot = ctx.swot;
  if (!swot) return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 TOWS 교차 매트릭스를 작성해 주세요.\n\n=== 리서치 데이터 ===\n${research.slice(0, 15000)}\n===\n\n위 데이터에 기반해서만 분석하세요.`;

  const numberedList = (items: string[], prefix: string) =>
    items.map((item, i) => `${prefix}${i + 1}: ${item}`).join('\n');

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 TOWS 교차 매트릭스를 작성해 주세요.

SWOT 분석 결과:

[강점 - Strengths]
${numberedList(swot.strengths, 'S')}

[약점 - Weaknesses]
${numberedList(swot.weaknesses, 'W')}

[기회 - Opportunities]
${numberedList(swot.opportunities, 'O')}

[위협 - Threats]
${numberedList(swot.threats, 'T')}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
위 요소들의 교차점을 분석하여 전략적으로 유의미한 조합을 선별하고 활성화해 주세요.`;
}
