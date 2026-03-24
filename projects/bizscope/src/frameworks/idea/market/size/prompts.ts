import type { PipelineContext } from '../../../types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 시장 규모를 추정합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "tam": {
    "value": "금액 (예: $50B, 약 60조원)",
    "description": "전체 시장 규모 산출 근거 (2-3문장)",
    "methodology": "산출 방법론 (top-down/bottom-up/유사시장 비교 등) + 참조 데이터 소스 + 계산 과정 요약"
  },
  "sam": {
    "value": "금액",
    "description": "서비스 가능 시장 산출 근거 (2-3문장)",
    "methodology": "TAM에서 SAM 도출 시 적용한 필터(지역, 세그먼트, 고객유형 등) + 필터링 비율 근거"
  },
  "som": {
    "value": "금액",
    "description": "실제 확보 가능 시장 산출 근거 (2-3문장)",
    "methodology": "목표 점유율 % + 점유율 산정 근거 (유사 스타트업 초기 성과, 채널 도달률 등)"
  },
  "growthRate": "연간 성장률 (예: CAGR 12.5%)",
  "timingAnalysis": {
    "timing": "early | right | late",
    "reasoning": "시장 진입 타이밍 근거 (2-3문장, 시장 성숙 단계/기술 채택 곡선/규제 변화 포함)"
  },
  "marketDrivers": [
    {
      "driver": "시장 성장 동인 이름",
      "description": "동인 설명 (1-2문장)",
      "impact": "high | medium | low"
    }
  ],
  "marketBarriers": [
    {
      "barrier": "시장 진입 장벽 이름",
      "description": "장벽 설명 (1-2문장)",
      "severity": "high | medium | low"
    }
  ],
  "trends": ["시장 트렌드 3-5개"],
  "summary": "시장 규모 종합 평가 (2-3문장)"
}

분석 기준:
- TAM: 전체 시장 규모 (top-down 방식). methodology에 계산 과정을 투명하게 공개
- SAM: 실제 타겟할 수 있는 세그먼트 (지역, 유형 등 필터). 필터링 근거를 구체적으로 제시
- SOM: 1-3년 내 현실적으로 확보 가능한 점유율. 유사 스타트업의 초기 성과 데이터 참조
- 과대 추정 금지. 근거가 불분명하면 보수적으로 추정
- 성장률은 구체적 수치와 출처 근거를 포함
- marketDrivers는 3-5개, 시장 성장을 이끄는 구체적 요인 (기술 변화, 규제, 소비자 행동 등)
- marketBarriers는 3-5개, 신규 진입자가 극복해야 할 장벽 (규제, 네트워크 효과, 자본 요구 등)
- timingAnalysis: 지금이 진입 적기인지 냉정하게 판단. 이미 과열된 시장이면 late로 표시`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;

  const parts = [`다음 사업 아이디어의 시장 규모를 추정해 주세요.`];

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
