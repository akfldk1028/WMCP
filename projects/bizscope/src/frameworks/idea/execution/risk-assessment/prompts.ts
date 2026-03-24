import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 리스크를 평가합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "risks": [
    {
      "category": "market" | "technical" | "financial" | "regulatory" | "competitive",
      "risk": "리스크 설명 (1-2문장)",
      "probability": 1~5,
      "impact": 1~5,
      "mitigation": "완화 전략 (1-2문장)"
    }
  ],
  "overallRiskLevel": "low" | "medium" | "high",
  "summary": "리스크 종합 평가 (2-3문장)"
}

분석 기준:
- 6-10개 리스크를 5개 카테고리에 걸쳐 도출
- 각 카테고리당 최소 1개 이상 포함
- probability: 1(매우 낮음) ~ 5(거의 확실)
- impact: 1(미미함) ~ 5(치명적)
- 리스크를 과소평가하지 말 것. 현실적으로 평가
- overallRiskLevel은 전체 리스크의 가중평균 기반 판단
- 완화 전략도 현실적이고 구체적으로 작성`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;
  const competitors = ctx.competitorScan;
  const biz = ctx.businessModel;

  const parts = [`다음 사업 아이디어의 리스크를 평가해 주세요.`];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 솔루션: ${overview.solution}`,
      `- 타겟 유저: ${overview.targetUser}`,
      `- 카테고리: ${overview.category}`,
    );
  }

  if (market) {
    parts.push(
      '',
      '시장 규모:',
      `- SOM: ${market.som.value}`,
      `- 성장률: ${market.growthRate}`,
    );
  }

  if (competitors && competitors.competitors.length > 0) {
    parts.push(
      '',
      `경쟁사 ${competitors.competitors.length}개 확인됨:`,
      ...competitors.competitors.slice(0, 5).map((c) => `- ${c.name}`),
    );
  }

  if (biz) {
    const recommended = biz.models.filter((m) => m.recommended);
    if (recommended.length > 0) {
      parts.push(
        '',
        '추천 수익 모델:',
        ...recommended.map((m) => `- ${m.modelType}`),
      );
    }
  }

  parts.push(
    '',
    '시장, 기술, 재무, 규제, 경쟁 카테고리별로 리스크를 솔직하게 평가해 주세요.',
    '리스크를 과소평가하지 마세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;
  const competitors = ctx.competitorScan;
  const biz = ctx.businessModel;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 리스크를 평가해 주세요.`,
  ];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 솔루션: ${overview.solution}`,
      `- 타겟 유저: ${overview.targetUser}`,
      `- 카테고리: ${overview.category}`,
    );
  }

  if (market) {
    parts.push(
      '',
      '시장 규모:',
      `- SOM: ${market.som.value}`,
      `- 성장률: ${market.growthRate}`,
    );
  }

  if (competitors && competitors.competitors.length > 0) {
    parts.push(
      '',
      `경쟁사 ${competitors.competitors.length}개 확인됨:`,
      ...competitors.competitors.slice(0, 5).map((c) => `- ${c.name}`),
    );
  }

  if (biz) {
    const recommended = biz.models.filter((m) => m.recommended);
    if (recommended.length > 0) {
      parts.push(
        '',
        '추천 수익 모델:',
        ...recommended.map((m) => `- ${m.modelType}`),
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
    '시장, 기술, 재무, 규제, 경쟁 카테고리별로 리스크를 솔직하게 평가해 주세요.',
  );

  return parts.join('\n');
}
