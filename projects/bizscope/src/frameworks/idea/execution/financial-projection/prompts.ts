import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 3개년 재무 전망을 작성합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "monthly": [
    {
      "month": "1" | "2" | ... | "36",
      "revenue": 0,
      "cost": 0,
      "profit": 0,
      "users": 0
    }
  ],
  "yearly": [
    {
      "year": "1년차" | "2년차" | "3년차",
      "revenue": "연간 매출 (예: $120,000)",
      "cost": "연간 비용 (예: $80,000)",
      "profit": "연간 손익 (예: $40,000 또는 -$20,000)",
      "users": "연말 누적 사용자 수 (예: 5,000명)",
      "keyAssumptions": ["핵심 가정 2-3개"]
    }
  ],
  "scenarios": [
    {
      "scenario": "optimistic | base | pessimistic",
      "year3Revenue": "3년차 매출 (예: $500,000)",
      "year3Profit": "3년차 손익 (예: $150,000)",
      "probability": "확률 (예: 20%)",
      "keyAssumption": "핵심 가정 (1문장)"
    }
  ],
  "fundingPlan": [
    {
      "stage": "자금 조달 단계 (예: 부트스트랩, 시드, 시리즈A)",
      "amount": "조달 금액 (예: $50K)",
      "timing": "시점 (예: 출시 전, 6개월 후)",
      "use": "자금 용도 (예: 개발비, 마케팅비, 인건비)",
      "source": "자금 출처 (예: 자기자본, 엔젤투자, VC)"
    }
  ],
  "keyMetrics": [
    {
      "metric": "지표 이름 (예: MRR, ARR, 이탈률, 전환율 등)",
      "year1": "1년차 목표 (예: $5,000)",
      "year2": "2년차 목표 (예: $25,000)",
      "year3": "3년차 목표 (예: $80,000)"
    }
  ],
  "summary": "재무 전망 종합 평가 (2-3문장)"
}

분석 기준:
- monthly: 최소 12개월, 최대 36개월. revenue/cost/profit은 숫자(number)로
- yearly: 3개년. revenue/cost/profit은 문자열(통화 포함)
- 시나리오 3개: optimistic (확률 15-25%), base (확률 50-60%), pessimistic (확률 20-30%)
- 1년차는 특히 보수적으로 추정. 대부분의 스타트업이 1년차에 적자
- 자금 조달 계획: 1인 개발자/소규모 팀 기준. 대규모 VC 투자 가정 금지
- 핵심 지표 5-8개: MRR, ARR, 이탈률, 전환율, DAU/MAU 등
- 모든 수치에 가정과 근거를 포함
- 비현실적으로 높은 성장률 금지`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const unit = ctx.unitEconomics;

  const parts = [`다음 사업 아이디어의 3개년 재무 전망을 작성해 주세요.`];

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

  if (unit) {
    parts.push(
      '',
      '단위 경제성:',
      `- CAC: ${unit.cac.value}`,
      `- LTV: ${unit.ltv.value}`,
      `- LTV/CAC: ${unit.ltvCacRatio.value} (${unit.ltvCacRatio.verdict})`,
      `- 손익분기: ${unit.breakEvenPoint.months} (고객 ${unit.breakEvenPoint.customers})`,
      `- 월 소각률: ${unit.monthlyBurnRate}`,
      `- 매출 총이익률: ${unit.margins.gross}`,
    );
  }

  parts.push(
    '',
    '월별 전망(12-36개월), 연간 전망(3년), 3개 시나리오, 자금 조달 계획을 포함해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const unit = ctx.unitEconomics;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 3개년 재무 전망을 작성해 주세요.`,
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

  if (unit) {
    parts.push(
      '',
      '단위 경제성:',
      `- CAC: ${unit.cac.value}`,
      `- LTV: ${unit.ltv.value}`,
      `- LTV/CAC: ${unit.ltvCacRatio.value} (${unit.ltvCacRatio.verdict})`,
      `- 손익분기: ${unit.breakEvenPoint.months} (고객 ${unit.breakEvenPoint.customers})`,
      `- 월 소각률: ${unit.monthlyBurnRate}`,
      `- 매출 총이익률: ${unit.margins.gross}`,
    );
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '월별 전망(12-36개월), 연간 전망(3년), 3개 시나리오, 자금 조달 계획을 포함해 주세요.',
  );

  return parts.join('\n');
}
