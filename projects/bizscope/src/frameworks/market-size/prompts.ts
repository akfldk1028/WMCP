import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 시장 규모를 추정합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "tam": {
    "value": "금액 (예: $50B, 약 60조원)",
    "description": "전체 시장 규모 산출 근거 (2-3문장)"
  },
  "sam": {
    "value": "금액",
    "description": "서비스 가능 시장 산출 근거 (2-3문장)"
  },
  "som": {
    "value": "금액",
    "description": "실제 확보 가능 시장 산출 근거 (2-3문장)"
  },
  "growthRate": "연간 성장률 (예: CAGR 12.5%)",
  "trends": ["시장 트렌드 3-5개"],
  "summary": "시장 규모 종합 평가 (2-3문장)"
}

분석 기준:
- TAM: 전체 시장 규모 (top-down 방식)
- SAM: 실제 타겟할 수 있는 세그먼트 (지역, 유형 등 필터)
- SOM: 1-3년 내 현실적으로 확보 가능한 점유율
- 과대 추정 금지. 근거가 불분명하면 보수적으로 추정
- 성장률은 구체적 수치와 출처 근거를 포함`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;

  const parts = [`다음 사업 아이디어의 시장 규모를 추정해 주세요.`];

  if (idea) {
    parts.push('', `아이디어: ${idea.name}`, `설명: ${idea.description}`);
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
    );
  }

  parts.push('', 'TAM/SAM/SOM을 구체적 금액과 산출 근거와 함께 제시해 주세요.');

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 시장 규모를 추정해 주세요.`,
  ];

  if (idea) {
    parts.push('', `아이디어: ${idea.name}`, `설명: ${idea.description}`);
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
    );
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    'TAM/SAM/SOM을 구체적 금액과 산출 근거와 함께 제시해 주세요.',
  );

  return parts.join('\n');
}
