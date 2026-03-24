import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 경쟁 환경을 분석합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "competitors": [
    {
      "name": "경쟁 서비스/제품 이름",
      "description": "서비스 설명 (1-2문장)",
      "url": "웹사이트 URL (알 수 있는 경우)",
      "funding": "투자 유치 규모 (예: $10M Series A, 비공개 등)",
      "users": "사용자 수/규모 (예: MAU 50만, 기업 고객 200개 등)",
      "pricing": "가격 정책 요약 (예: 무료/프리미엄 $29/월, 엔터프라이즈 커스텀 등)",
      "foundedYear": "설립 연도 (알 수 있는 경우, 예: 2020)",
      "strengths": ["강점 2-3개"],
      "weaknesses": ["약점 2-3개"]
    }
  ],
  "indirectCompetitors": [
    {
      "name": "간접 경쟁사 이름",
      "description": "서비스 설명 (1문장)",
      "overlapArea": "우리 아이디어와 겹치는 영역 (1문장)",
      "threatLevel": "high | medium | low"
    }
  ],
  "substitutes": [
    {
      "name": "대체재 이름 (예: 엑셀 수작업, 기존 프로세스 등)",
      "description": "대체 방법 설명 (1문장)",
      "switchingCost": "전환 비용 수준 (높음/중간/낮음 + 근거 1문장)"
    }
  ],
  "marketGaps": ["기존 경쟁사가 채우지 못하는 시장 공백 3-5개"],
  "summary": "경쟁 환경 종합 평가 (2-3문장)"
}

분석 기준:
- 직접 경쟁사(competitors) 5-8개: 동일한 문제를 동일한 방식으로 해결하는 서비스
- 각 경쟁사의 funding, users, pricing, foundedYear를 최대한 구체적으로 기입. 정보가 없으면 "비공개" 또는 "추정: ~" 형식
- 간접 경쟁사(indirectCompetitors) 3-5개: 다른 방식으로 유사한 문제를 해결하는 서비스
- 대체재(substitutes) 2-3개: 고객이 현재 사용 중인 비제품 솔루션 (수작업, 기존 프로세스 등)
- 각 경쟁사의 강점/약점을 구체적으로 분석
- 시장 공백은 실제 진입 가능한 기회인지 평가
- 경쟁이 치열하면 솔직하게 표현. "블루오션"이라고 안일하게 판단하지 말 것`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;

  const parts = [`다음 사업 아이디어의 경쟁 서비스를 분석해 주세요.`];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
    if (idea.targetMarket) {
      parts.push(`타겟 시장: ${idea.targetMarket}`);
    }
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

  parts.push(
    '',
    '유사 서비스 5-8개를 찾아 각각의 강점/약점을 분석하고, 시장 공백을 도출해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 경쟁 서비스를 분석해 주세요.`,
  ];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
    if (idea.targetMarket) {
      parts.push(`타겟 시장: ${idea.targetMarket}`);
    }
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

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '유사 서비스 5-8개를 찾아 각각의 강점/약점을 분석하고, 시장 공백을 도출해 주세요.',
  );

  return parts.join('\n');
}
