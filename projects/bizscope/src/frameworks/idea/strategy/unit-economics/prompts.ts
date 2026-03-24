import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 단위 경제성(Unit Economics)을 분석합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "cac": {
    "value": "고객 획득 비용 (예: $50-80)",
    "breakdown": "비용 구성 (예: 광고 60%, 콘텐츠 20%, 세일즈 20%)",
    "benchmark": "업계 벤치마크 (선택, 예: 유사 SaaS 평균 $60-120)"
  },
  "ltv": {
    "value": "고객 생애 가치 (예: $300-500)",
    "calculation": "산출 근거 (예: ARPU $25 × 평균 유지 16개월)",
    "benchmark": "업계 벤치마크 (선택)"
  },
  "ltvCacRatio": {
    "value": "LTV/CAC 비율 (예: 4.2x)",
    "verdict": "healthy | marginal | unsustainable"
  },
  "breakEvenPoint": {
    "months": "손익분기 도달 시점 (예: 14-18개월)",
    "customers": "필요 고객 수 (예: 유료 500명)",
    "revenue": "필요 월 매출 (예: $12,500)",
    "assumptions": "핵심 가정 (1-2문장)"
  },
  "monthlyBurnRate": "월간 소각률 (예: $3,000-5,000)",
  "runway": "자금 소진 시점 (예: 초기 자본 $50K 기준 10-15개월)",
  "margins": {
    "gross": "매출 총이익률 (예: 75-80%)",
    "contribution": "공헌 이익률 (예: 55-65%)",
    "reasoning": "마진 산출 근거 (1-2문장)"
  },
  "sensitivityAnalysis": [
    {
      "variable": "변수 이름 (예: 고객 이탈률)",
      "optimistic": "낙관 시나리오 (예: 월 3% → LTV $833)",
      "base": "기본 시나리오 (예: 월 5% → LTV $500)",
      "pessimistic": "비관 시나리오 (예: 월 8% → LTV $312)"
    }
  ],
  "summary": "단위 경제성 종합 평가 (2-3문장)"
}

분석 기준:
- LTV/CAC 비율: 3:1 이상이면 healthy, 2:1~3:1이면 marginal, 2:1 미만이면 unsustainable
- 손익분기점: 보수적 가정 기반. 스타트업 초기 실패율 고려
- 월간 소각률: 1인/소규모 팀 기준으로 현실적 추정
- 민감도 분석 4-6개 변수: 이탈률, CAC, ARPU, 전환율, 성장률 등
- 마진이 낮은 사업 모델이면 솔직하게 경고
- 모든 수치에 산출 근거를 포함`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const biz = ctx.businessModel;

  const parts = [`다음 사업 아이디어의 단위 경제성(Unit Economics)을 분석해 주세요.`];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 타겟 유저: ${overview.targetUser}`,
      `- 카테고리: ${overview.category}`,
    );
  }

  if (biz) {
    const recommended = biz.models.filter((m) => m.recommended);
    if (recommended.length > 0) {
      parts.push(
        '',
        '추천 수익 모델:',
        ...recommended.map((m) => `- ${m.modelType}: ${m.pricing} — ${m.description}`),
      );
    }
    if (biz.unitEconomics.length > 0) {
      parts.push(
        '',
        '기존 Unit Economics 추정:',
        ...biz.unitEconomics.map((e) => `- ${e.metric}: ${e.value}`),
      );
    }
  }

  parts.push(
    '',
    'CAC, LTV, LTV/CAC 비율, 손익분기점, 소각률, 마진, 민감도 분석을 포함해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const biz = ctx.businessModel;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 단위 경제성을 분석해 주세요.`,
  ];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 타겟 유저: ${overview.targetUser}`,
      `- 카테고리: ${overview.category}`,
    );
  }

  if (biz) {
    const recommended = biz.models.filter((m) => m.recommended);
    if (recommended.length > 0) {
      parts.push(
        '',
        '추천 수익 모델:',
        ...recommended.map((m) => `- ${m.modelType}: ${m.pricing} — ${m.description}`),
      );
    }
    if (biz.unitEconomics.length > 0) {
      parts.push(
        '',
        '기존 Unit Economics 추정:',
        ...biz.unitEconomics.map((e) => `- ${e.metric}: ${e.value}`),
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
    'CAC, LTV, LTV/CAC 비율, 손익분기점, 소각률, 마진, 민감도 분석을 포함해 주세요.',
  );

  return parts.join('\n');
}
