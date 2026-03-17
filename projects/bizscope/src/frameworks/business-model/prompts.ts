import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 수익 모델을 설계합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "models": [
    {
      "modelType": "수익 모델 유형 (예: 구독형, 프리미엄, 마켓플레이스, 광고, 라이선스 등)",
      "description": "모델 설명 (2-3문장)",
      "pricing": "가격 전략 (구체적 가격대 포함)",
      "pros": ["장점 2-3개"],
      "cons": ["단점 2-3개"],
      "recommended": true/false
    }
  ],
  "unitEconomics": [
    {
      "metric": "지표 이름 (예: CAC, LTV, ARPU, Payback Period 등)",
      "value": "추정 값 (구체적 수치)"
    }
  ],
  "summary": "수익 모델 종합 추천 (2-3문장)"
}

분석 기준:
- 3-5개 수익 모델 비교 분석
- recommended는 최대 1-2개만 true로 설정
- unitEconomics는 5-8개 핵심 지표 포함
- 가격은 해당 시장의 실제 가격대 참고
- 수익화가 어려운 모델이면 솔직하게 표현`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;
  const diff = ctx.differentiation;

  const parts = [`다음 사업 아이디어의 수익 모델을 설계해 주세요.`];

  if (idea) {
    parts.push('', `아이디어: ${idea.name}`, `설명: ${idea.description}`);
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
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
      `- SOM: ${market.som.value}`,
    );
  }

  if (diff) {
    parts.push(
      '',
      '차별화 포인트:',
      `- 포지셔닝: ${diff.positioningStatement}`,
      `- 해자: ${diff.moat}`,
    );
  }

  parts.push(
    '',
    '3-5가지 수익 모델을 비교하고, 단위 경제학(Unit Economics) 지표를 추정해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const market = ctx.marketSize;
  const diff = ctx.differentiation;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 수익 모델을 설계해 주세요.`,
  ];

  if (idea) {
    parts.push('', `아이디어: ${idea.name}`, `설명: ${idea.description}`);
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
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
      `- SOM: ${market.som.value}`,
    );
  }

  if (diff) {
    parts.push(
      '',
      '차별화 포인트:',
      `- 포지셔닝: ${diff.positioningStatement}`,
      `- 해자: ${diff.moat}`,
    );
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '3-5가지 수익 모델을 비교하고, 단위 경제학(Unit Economics) 지표를 추정해 주세요.',
  );

  return parts.join('\n');
}
