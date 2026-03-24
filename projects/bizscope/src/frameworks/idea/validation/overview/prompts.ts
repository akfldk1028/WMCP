import type { PipelineContext } from '../../../types';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어를 분석하여 핵심 요소를 정리합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "ideaName": "아이디어 이름 (간결하게)",
  "problemStatement": "이 아이디어가 해결하려는 문제 (2-3문장)",
  "problemSeverity": 1~10,
  "solution": "제안하는 해결책 (2-3문장)",
  "solutionFit": 1~10,
  "targetUser": "핵심 타겟 사용자 (구체적 페르소나)",
  "personas": [
    {
      "name": "페르소나 이름 (예: 김대리, Sarah 등)",
      "age": "나이대 (예: 30대 초반)",
      "occupation": "직업/역할",
      "pain": "핵심 고통점 (1-2문장, 구체적 상황 포함)",
      "behavior": "현재 문제 해결 방식 (1-2문장, 어떤 대안을 쓰고 있는지)",
      "willingness": "지불 의향 수준 (높음/중간/낮음 + 근거 1문장)"
    }
  ],
  "uniqueValue": "기존 대안 대비 고유 가치 제안 (1-2문장)",
  "marketTiming": {
    "timing": "early | right | late",
    "reasoning": "시장 진입 타이밍 판단 근거 (2-3문장, 기술 성숙도/규제/소비자 준비도 포함)"
  },
  "category": "비즈니스 카테고리 (예: SaaS, 마켓플레이스, 모바일앱 등)",
  "keywords": ["관련 키워드 5-8개"]
}

분석 기준:
- 문제가 실제로 존재하는지, 충분히 고통스러운지 평가
- problemSeverity: 1(불편 수준) ~ 10(생존 위협). 5 이하면 "있으면 좋은" 수준이므로 솔직히 표현
- solutionFit: 1(문제와 무관) ~ 10(완벽 해결). 해결책이 문제의 핵심을 정확히 타격하는지 판단
- 타겟 사용자가 구체적이고 도달 가능한지 검토
- personas는 2-3개 작성. 각 페르소나는 실제 존재할 법한 구체적 인물로 묘사
- 각 페르소나의 pain은 추상적 니즈가 아닌 구체적 상황/시나리오로 작성
- 고유 가치가 정말 차별적인지 냉정하게 판단
- marketTiming: 너무 이르면(시장 미형성) early, 적절하면 right, 이미 레드오션이면 late로 판단
- 타이밍 근거에 기술 트렌드, 규제 환경, 소비자 인식 변화 등 구체적 요인 포함`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  if (!idea) return `아이디어 정보가 없습니다. 일반적인 분석을 수행해 주세요.`;

  const parts = [
    `다음 사업 아이디어를 분석해 주세요.`,
    '',
    `아이디어 이름: ${idea.name}`,
  ];

  if (idea.document) {
    parts.push(
      '',
      '=== 기획서 전문 ===',
      idea.document.slice(0, 20000),
      '===',
      '',
      '위 기획서에서 문제 정의, 솔루션, 타겟 사용자, 핵심 기능, 수익 모델 등을 자동 추출하여 분석해 주세요.',
    );
  } else {
    parts.push(`설명: ${idea.description}`);
  }

  if (idea.targetMarket) {
    parts.push(`타겟 시장: ${idea.targetMarket}`);
  }

  parts.push(
    '',
    '문제-해결책 적합성, 타겟 사용자, 고유 가치 제안을 중심으로 분석해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어를 분석해 주세요.`,
  ];

  if (idea) {
    parts.push(
      '',
      `아이디어 이름: ${idea.name}`,
    );
    if (idea.document) {
      parts.push(
        '',
        '=== 기획서 전문 ===',
        idea.document.slice(0, 20000),
        '===',
      );
    } else {
      parts.push(`설명: ${idea.description}`);
    }
    if (idea.targetMarket) {
      parts.push(`타겟 시장: ${idea.targetMarket}`);
    }
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '문제-해결책 적합성, 타겟 사용자, 고유 가치 제안을 중심으로 분석해 주세요.',
  );

  return parts.join('\n');
}
