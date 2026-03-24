import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 시장 환경을 분석합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "pestSummary": [
    {
      "category": "political | economic | social | technological",
      "keyFactor": "핵심 요인 (1문장)",
      "impact": "영향 설명 (1-2문장)",
      "direction": "positive | negative | neutral"
    }
  ],
  "techTrends": [
    {
      "trend": "기술 트렌드 이름",
      "relevance": "이 아이디어와의 관련성 (1-2문장)",
      "timeframe": "영향 시기 (예: 1-2년 내, 3-5년 내, 이미 진행중)"
    }
  ],
  "regulatoryEnvironment": [
    {
      "regulation": "규제/법률 이름",
      "status": "existing | upcoming | proposed",
      "impact": "사업에 미치는 영향 (1-2문장)"
    }
  ],
  "consumerBehavior": [
    {
      "trend": "소비자 행동 변화 트렌드",
      "evidence": "근거/데이터 (1문장)",
      "implication": "사업적 시사점 (1문장)"
    }
  ],
  "marketMaturity": "emerging | growing | mature | declining",
  "maturityReasoning": "시장 성숙도 판단 근거 (2-3문장)",
  "summary": "시장 환경 종합 평가 (2-3문장)"
}

분석 기준:
- PEST 요약: 카테고리별 2-3개씩, 총 8-12개 요인
- 기술 트렌드 3-5개: 이 아이디어에 직접 영향을 미치는 기술 변화
- 규제 환경 3-5개: 관련 법률/규제/정책 현황 및 변화 방향
- 소비자 행동 변화 3-5개: 타겟 시장의 소비 패턴 변화
- 시장 성숙도는 객관적 근거에 기반해 판단
- 불리한 환경 요인도 솔직하게 기술`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;

  const parts = [`다음 사업 아이디어의 시장 환경을 분석해 주세요.`];

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
    );
  }

  if (market) {
    parts.push(
      '',
      '시장 규모:',
      `- TAM: ${market.tam.value}`,
      `- SAM: ${market.sam.value}`,
      `- 성장률: ${market.growthRate}`,
      `- 트렌드: ${market.trends.join(', ')}`,
    );
  }

  parts.push(
    '',
    'PEST 요약, 기술 트렌드, 규제 환경, 소비자 행동 변화, 시장 성숙도를 분석해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 시장 환경을 분석해 주세요.`,
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
    );
  }

  if (market) {
    parts.push(
      '',
      '시장 규모:',
      `- TAM: ${market.tam.value}`,
      `- SAM: ${market.sam.value}`,
      `- 성장률: ${market.growthRate}`,
      `- 트렌드: ${market.trends.join(', ')}`,
    );
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    'PEST 요약, 기술 트렌드, 규제 환경, 소비자 행동 변화, 시장 성숙도를 분석해 주세요.',
  );

  return parts.join('\n');
}
