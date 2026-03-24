import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어와 유사한 성공/실패 사례를 분석합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "successCases": [
    {
      "company": "기업/서비스 이름",
      "industry": "산업/분야",
      "similarity": "이 아이디어와의 유사점 (1-2문장)",
      "strategy": "핵심 성공 전략 (2-3문장)",
      "outcome": "성과 (구체적 수치 포함, 1-2문장)",
      "keyLesson": "핵심 교훈 (1문장)",
      "timeToSuccess": "성공까지 소요 시간 (예: 2년, 18개월 등)"
    }
  ],
  "failureCase": {
    "company": "기업/서비스 이름",
    "industry": "산업/분야",
    "reason": "실패 원인 (2-3문장)",
    "lesson": "교훈 (1-2문장)"
  },
  "implications": ["이 아이디어에 대한 시사점 3-5개"],
  "summary": "유사 사례 종합 평가 (2-3문장)"
}

분석 기준:
- 성공 사례 2-3개: 유사한 문제를 해결한 스타트업/서비스
- 각 사례의 유사성을 구체적으로 설명 (막연한 비교 금지)
- 성과는 가능한 한 구체적 수치 (MAU, 매출, 투자 유치 등)
- 실패 사례 1개: 유사한 시도를 했다가 실패한 사례
- 실패 원인을 구체적으로 분석 (자금 부족, 타이밍, PMF 부재 등)
- 시사점: 성공/실패 사례에서 이 아이디어가 배워야 할 점
- 생존자 편향 경고: 성공 사례만 보고 낙관하지 말 것
- 사례가 부정확하거나 확인 불가능하면 "추정" 표시`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const growth = ctx.growthStrategy;

  const parts = [`다음 사업 아이디어와 유사한 성공/실패 사례를 분석해 주세요.`];

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
      `- 카테고리: ${overview.category}`,
      `- 키워드: ${overview.keywords.join(', ')}`,
    );
  }

  if (growth) {
    const highStrategies = growth.strategies.filter((s) => s.priority === 'high');
    if (highStrategies.length > 0) {
      parts.push(
        '',
        '핵심 성장 전략:',
        ...highStrategies.map((s) => `- ${s.name} (${s.type}): ${s.description}`),
      );
    }
    if (growth.networkEffects.strength !== 'none') {
      parts.push(`\n네트워크 효과: ${growth.networkEffects.description} (${growth.networkEffects.strength})`);
    }
  }

  parts.push(
    '',
    '성공 사례 2-3개와 실패 사례 1개를 구체적 수치와 함께 분석해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const growth = ctx.growthStrategy;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어와 유사한 성공/실패 사례를 분석해 주세요.`,
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
      `- 카테고리: ${overview.category}`,
      `- 키워드: ${overview.keywords.join(', ')}`,
    );
  }

  if (growth) {
    const highStrategies = growth.strategies.filter((s) => s.priority === 'high');
    if (highStrategies.length > 0) {
      parts.push(
        '',
        '핵심 성장 전략:',
        ...highStrategies.map((s) => `- ${s.name} (${s.type}): ${s.description}`),
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
    '성공 사례 2-3개와 실패 사례 1개를 구체적 수치와 함께 분석해 주세요.',
  );

  return parts.join('\n');
}
