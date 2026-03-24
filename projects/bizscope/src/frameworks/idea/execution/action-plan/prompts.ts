import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 실행 계획을 수립하고 최종 판정을 내립니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "milestones": [
    {
      "phase": "단계 이름",
      "timeline": "소요 기간 (예: 1-3개월차)",
      "deliverables": ["산출물 2-4개"],
      "budget": "예상 비용 (선택, 예: $5,000-10,000)"
    }
  ],
  "keyMetrics": [
    {
      "metric": "핵심 지표 이름",
      "target": "목표 수치",
      "timeline": "달성 시점"
    }
  ],
  "teamRequirements": [
    {
      "role": "역할 이름",
      "count": 1,
      "priority": "critical" | "important" | "nice-to-have"
    }
  ],
  "financialProjection": {
    "year1": { "revenue": "매출", "cost": "비용", "profit": "손익" },
    "year2": { "revenue": "매출", "cost": "비용", "profit": "손익" },
    "year3": { "revenue": "매출", "cost": "비용", "profit": "손익" }
  },
  "scoreCard": {
    "dimensions": [
      {
        "dimension": "Problem Severity (문제 심각도)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "Market Size (시장 규모)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "Timing (타이밍)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "Competitive Moat (경쟁 해자)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "Unit Economics (단위 경제성)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "Feasibility (실현 가능성)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "GTM Clarity (시장 진입 명확성)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "Risk Level (리스크 수준)",
        "score": 1-10,
        "evidence": "근거 1문장 (역점수: 리스크가 낮을수록 높은 점수)",
        "verdict": "strong|adequate|weak|critical"
      },
      {
        "dimension": "Scalability (확장성)",
        "score": 1-10,
        "evidence": "근거 1문장",
        "verdict": "strong|adequate|weak|critical"
      }
    ],
    "totalScore": 소수점 1자리 평균,
    "confidence": "high|medium|low"
  },
  "verdict": {
    "score": 1~10,
    "recommendation": "strong-go" | "go" | "conditional" | "no-go",
    "reasoning": "판정 근거 (3-5문장, 핵심 논리를 명확하게)"
  },
  "summary": "실행 계획 종합 요약 (2-3문장)"
}

스코어카드 채점 기준:
- 8-10: strong — 강력한 근거가 있는 강점
- 5-7: adequate — 보통이나 개선 여지 있음
- 3-4: weak — 약점, 보완 필요
- 1-2: critical — 치명적 약점, 사업 진행 전 반드시 해결 필요
- totalScore = 9개 dimension score의 평균 (소수점 1자리)
- confidence: 리서치 데이터 풍부도에 따라 high/medium/low

분석 기준:
- 마일스톤 3-5단계 (12-18개월 로드맵)
- 핵심 지표(KPI) 5-8개
- 팀 구성은 소규모 스타트업 기준 (1인 개발자도 가능)
- 재무 추정은 보수적으로. 낙관적 시나리오 금지
- verdict.score: 1(사업 불가) ~ 10(즉시 실행)
- verdict는 scoreCard의 9개 차원 평가를 종합한 최종 판단
- no-go 판정도 주저하지 말 것. 솔직한 판단이 가장 중요`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;
  const competitors = ctx.competitorScan;
  const diff = ctx.differentiation;
  const biz = ctx.businessModel;
  const gtm = ctx.goToMarket;
  const risk = ctx.riskAssessment;

  const parts = [`다음 사업 아이디어의 실행 계획을 수립하고 최종 판정을 내려주세요.`];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '=== 아이디어 개요 ===',
      `문제: ${overview.problemStatement}`,
      `솔루션: ${overview.solution}`,
      `타겟: ${overview.targetUser}`,
      `고유 가치: ${overview.uniqueValue}`,
    );
  }

  if (market) {
    parts.push(
      '',
      '=== 시장 ===',
      `TAM: ${market.tam.value} / SAM: ${market.sam.value} / SOM: ${market.som.value}`,
      `성장률: ${market.growthRate}`,
    );
  }

  if (competitors) {
    parts.push(
      '',
      `=== 경쟁 (${competitors.competitors.length}개 서비스) ===`,
      `시장 공백: ${competitors.marketGaps.join(' / ')}`,
    );
  }

  if (diff) {
    parts.push(
      '',
      '=== 차별화 ===',
      `포지셔닝: ${diff.positioningStatement}`,
      `해자: ${diff.moat}`,
    );
  }

  if (biz) {
    const recommended = biz.models.filter((m) => m.recommended);
    parts.push(
      '',
      '=== 수익 모델 ===',
      ...recommended.map((m) => `- ${m.modelType}: ${m.pricing}`),
      `단위 경제: ${biz.unitEconomics.map((e) => `${e.metric}=${e.value}`).join(', ')}`,
    );
  }

  if (gtm) {
    parts.push(
      '',
      '=== GTM ===',
      `주요 채널: ${gtm.channels.filter((c) => c.priority === 'high').map((c) => c.channel).join(', ')}`,
      `얼리어답터: ${gtm.earlyAdopters}`,
    );
  }

  if (risk) {
    parts.push(
      '',
      '=== 리스크 ===',
      `전체 리스크 수준: ${risk.overallRiskLevel}`,
      `주요 리스크: ${risk.risks.filter((r) => r.probability * r.impact >= 12).map((r) => r.risk).join(' / ') || '없음'}`,
    );
  }

  parts.push(
    '',
    '위 모든 분석을 종합하여:',
    '1. 실행 계획(milestones, keyMetrics, teamRequirements, financialProjection)을 수립하고',
    '2. 9개 차원 스코어카드(scoreCard)를 채점한 뒤',
    '3. 최종 판정(verdict)을 내려주세요.',
    '',
    'scoreCard의 9개 차원을 각각 독립적으로 평가하세요. 근거 없는 높은 점수는 금지.',
    'no-go 판정도 주저하지 마세요. 솔직한 판단이 가장 가치 있습니다.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  // Reuse the same context assembly as buildUserMessage
  const baseMessage = buildUserMessage(ctx);

  const parts = [
    baseMessage,
    '',
    '=== 추가 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 분석 결과와 리서치 데이터를 모두 종합하여 판단하세요.',
    '리서치 데이터가 풍부하면 confidence를 "high"로, 부족하면 "low"로 설정하세요.',
  ];

  return parts.join('\n');
}
