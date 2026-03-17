import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 Go-to-Market 전략을 수립합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "channels": [
    {
      "channel": "마케팅/유통 채널 이름",
      "strategy": "해당 채널 활용 전략 (2-3문장)",
      "cost": "예상 비용 수준 (예: 월 $500-1000, 무료, 고비용 등)",
      "priority": "high" | "medium" | "low"
    }
  ],
  "launchPhases": [
    {
      "phase": "단계 이름 (예: MVP 검증, 초기 성장, 스케일업)",
      "duration": "소요 기간 (예: 1-3개월)",
      "goals": ["목표 2-3개"],
      "actions": ["실행 항목 3-5개"]
    }
  ],
  "earlyAdopters": "얼리어답터 프로필 및 확보 전략 (2-3문장)",
  "summary": "GTM 전략 종합 평가 (2-3문장)"
}

분석 기준:
- 채널 5-7개 제안 (유료/무료 혼합)
- 론칭 3단계: MVP 검증 → 초기 성장 → 스케일업
- 1인 개발자 또는 소규모 팀 기준으로 현실적 전략
- 대기업식 마케팅 예산 가정 금지
- 채널 비용은 초기 스타트업 기준으로 추정`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;
  const biz = ctx.businessModel;

  const parts = [`다음 사업 아이디어의 GTM(Go-to-Market) 전략을 수립해 주세요.`];

  if (idea) {
    parts.push('', `아이디어: ${idea.name}`, `설명: ${idea.description}`);
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 타겟 유저: ${overview.targetUser}`,
      `- 카테고리: ${overview.category}`,
      `- 고유 가치: ${overview.uniqueValue}`,
    );
  }

  if (market) {
    parts.push('', `시장 성장률: ${market.growthRate}`);
  }

  if (biz) {
    const recommended = biz.models.filter((m) => m.recommended);
    if (recommended.length > 0) {
      parts.push(
        '',
        '추천 수익 모델:',
        ...recommended.map((m) => `- ${m.modelType}: ${m.pricing}`),
      );
    }
  }

  parts.push(
    '',
    '소규모 팀/1인 개발자 기준으로 현실적인 GTM 전략을 수립해 주세요.',
    '3단계 론칭 계획과 채널별 전략을 포함해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;
  const biz = ctx.businessModel;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 GTM 전략을 수립해 주세요.`,
  ];

  if (idea) {
    parts.push('', `아이디어: ${idea.name}`, `설명: ${idea.description}`);
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 타겟 유저: ${overview.targetUser}`,
      `- 카테고리: ${overview.category}`,
      `- 고유 가치: ${overview.uniqueValue}`,
    );
  }

  if (market) {
    parts.push('', `시장 성장률: ${market.growthRate}`);
  }

  if (biz) {
    const recommended = biz.models.filter((m) => m.recommended);
    if (recommended.length > 0) {
      parts.push(
        '',
        '추천 수익 모델:',
        ...recommended.map((m) => `- ${m.modelType}: ${m.pricing}`),
      );
    }
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '소규모 팀/1인 개발자 기준으로 현실적인 GTM 전략을 수립해 주세요.',
  );

  return parts.join('\n');
}
