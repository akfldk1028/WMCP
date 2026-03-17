import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어를 분석하여 핵심 요소를 정리합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "ideaName": "아이디어 이름 (간결하게)",
  "problemStatement": "이 아이디어가 해결하려는 문제 (2-3문장)",
  "solution": "제안하는 해결책 (2-3문장)",
  "targetUser": "핵심 타겟 사용자 (구체적 페르소나)",
  "uniqueValue": "기존 대안 대비 고유 가치 제안 (1-2문장)",
  "category": "비즈니스 카테고리 (예: SaaS, 마켓플레이스, 모바일앱 등)",
  "keywords": ["관련 키워드 5-8개"]
}

분석 기준:
- 문제가 실제로 존재하는지, 충분히 고통스러운지 평가
- 해결책이 문제와 정확히 매칭되는지 확인
- 타겟 사용자가 구체적이고 도달 가능한지 검토
- 고유 가치가 정말 차별적인지 냉정하게 판단`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  if (!idea) return `아이디어 정보가 없습니다. 일반적인 분석을 수행해 주세요.`;

  const parts = [
    `다음 사업 아이디어를 분석해 주세요.`,
    '',
    `아이디어 이름: ${idea.name}`,
    `설명: ${idea.description}`,
  ];

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
      `설명: ${idea.description}`,
    );
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
