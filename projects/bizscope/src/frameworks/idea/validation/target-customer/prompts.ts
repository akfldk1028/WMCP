import type { PipelineContext } from '../../../types';
import { buildIdeaLines } from '../../../shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 타겟 고객을 심층 분석합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "personas": [
    {
      "name": "페르소나 이름 (예: 김민수)",
      "age": "나이대 (예: 30대 초반)",
      "occupation": "직업/역할",
      "income": "소득 수준 (선택, 예: 연 5000만원)",
      "pain": "핵심 고통점 (1-2문장)",
      "currentSolution": "현재 해결 방법 (1-2문장)",
      "desiredOutcome": "원하는 결과 (1-2문장)",
      "willingnessToPay": "지불 의향 (예: 월 2-3만원, 건당 5000원 등)"
    }
  ],
  "customerJourney": [
    {
      "stage": "여정 단계 (예: 인지, 탐색, 구매, 사용, 추천)",
      "action": "고객 행동 (1문장)",
      "touchpoint": "접점 채널 (예: SNS, 검색, 앱스토어 등)",
      "painPoint": "해당 단계의 불편/고통점 (1문장)",
      "opportunity": "우리의 개입 기회 (1문장)"
    }
  ],
  "currentAlternatives": [
    {
      "name": "현재 대안 이름",
      "usage": "사용 방식/빈도 (1문장)",
      "satisfaction": "high | medium | low",
      "switchingBarrier": "전환 장벽 (1문장)"
    }
  ],
  "willingnessAnalysis": [
    {
      "segment": "고객 세그먼트 이름",
      "priceRange": "지불 가능 가격대 (예: 월 1-3만원)",
      "paymentModel": "선호 결제 모델 (예: 구독형, 건당 과금, 프리미엄 등)",
      "reasoning": "근거 (1-2문장)"
    }
  ],
  "summary": "타겟 고객 종합 평가 (2-3문장)"
}

분석 기준:
- 페르소나 3-4개: 각기 다른 세그먼트를 대표하는 구체적 인물 프로필
- 고객 여정 5단계: 인지 → 탐색 → 구매 → 사용 → 추천/이탈
- 현재 대안 3-5개: 고객이 실제로 사용 중인 대체 방법
- 지불 의향 분석: 세그먼트별 현실적 가격 수용도
- 지불 의향이 낮은 세그먼트는 솔직하게 표현
- 전환 장벽이 높은 경우 그 이유를 구체적으로 명시`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;

  const parts = [`다음 사업 아이디어의 타겟 고객을 심층 분석해 주세요.`];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 문제: ${overview.problemStatement}`,
      `- 솔루션: ${overview.solution}`,
      `- 타겟 유저: ${overview.targetUser}`,
      `- 고유 가치: ${overview.uniqueValue}`,
      `- 카테고리: ${overview.category}`,
    );
  }

  parts.push(
    '',
    '3-4개 상세 페르소나, 고객 여정 맵, 현재 대안 분석, 지불 의향 분석을 포함해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 타겟 고객을 심층 분석해 주세요.`,
  ];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 문제: ${overview.problemStatement}`,
      `- 솔루션: ${overview.solution}`,
      `- 타겟 유저: ${overview.targetUser}`,
      `- 고유 가치: ${overview.uniqueValue}`,
      `- 카테고리: ${overview.category}`,
    );
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '3-4개 상세 페르소나, 고객 여정 맵, 현재 대안 분석, 지불 의향 분석을 포함해 주세요.',
  );

  return parts.join('\n');
}
