import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 차별화 포인트를 분석합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "uniqueFeatures": [
    {
      "feature": "차별화 기능/특성 이름",
      "description": "기능 설명 (1-2문장)",
      "competitorLack": "경쟁사가 이를 제공하지 못하는 이유 (1문장)",
      "defensibility": "이 차별화가 복제되기까지 예상 기간 (예: 3-6개월, 1-2년, 복제 불가 등)"
    }
  ],
  "positioningMap": {
    "xAxis": "X축 기준 (예: 가격, 사용 편의성 등)",
    "yAxis": "Y축 기준 (예: 기능 수준, 전문성 등)",
    "ourPosition": { "x": "high | mid | low", "y": "high | mid | low" },
    "competitorPositions": [
      { "name": "경쟁사 이름", "x": "high | mid | low", "y": "high | mid | low" }
    ]
  },
  "positioningStatement": "포지셔닝 선언문 (For [타겟], who [니즈], [제품]은 [카테고리] that [핵심 차별점] 형식)",
  "moat": "경쟁 해자 분석 (2-3문장, 진입장벽이 약하면 솔직히 인정)",
  "moatStrength": 1~10,
  "sustainabilityAnalysis": {
    "shortTerm": "단기(1년 이내) 차별화 지속 가능성 (1-2문장)",
    "midTerm": "중기(1-3년) 차별화 유지 전략 및 위험 요인 (1-2문장)",
    "longTerm": "장기(3년+) 차별화 진화 방향 및 경쟁사 추격 가능성 (1-2문장)"
  },
  "summary": "차별화 전략 종합 평가 (2-3문장)"
}

분석 기준:
- 차별화 기능 3-5개 도출, 각 기능의 방어 가능 기간(defensibility) 명시
- positioningMap: 해당 시장에서 가장 의미 있는 2개 축을 선정하고 자사와 주요 경쟁사 3-5개를 배치
- 포지셔닝은 Geoffrey Moore 형식 준수
- moatStrength: 1(해자 없음, 누구나 복제 가능) ~ 10(강력한 구조적 진입장벽)
- 경쟁 해자(moat)가 약하면 솔직하게 "해자가 약함"이라고 명시
- sustainabilityAnalysis: 시간 경과에 따른 차별화 지속 가능성을 단기/중기/장기로 분석
- 기술적 차별화, 비즈니스 모델 차별화, UX 차별화, 데이터/네트워크 효과 등 다각도 분석
- 차별화가 일시적이면(경쟁사가 6개월 내 복제 가능) 솔직히 표현`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const competitors = ctx.competitorScan;

  const parts = [`다음 사업 아이디어의 차별화 포인트를 분석해 주세요.`];

  if (idea) {
    parts.push('', ...buildIdeaLines(idea));
  }

  if (overview) {
    parts.push(
      '',
      '아이디어 분석 결과:',
      `- 솔루션: ${overview.solution}`,
      `- 타겟 유저: ${overview.targetUser}`,
      `- 고유 가치: ${overview.uniqueValue}`,
    );
  }

  if (competitors) {
    parts.push(
      '',
      '경쟁사 분석 결과:',
      ...competitors.competitors.map(
        (c) => `- ${c.name}: 강점(${c.strengths.join(', ')}) / 약점(${c.weaknesses.join(', ')})`,
      ),
      '',
      `시장 공백: ${competitors.marketGaps.join(' / ')}`,
    );
  }

  parts.push(
    '',
    '경쟁사 대비 차별화 기능, 포지셔닝 선언문, 경쟁 해자를 분석해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const competitors = ctx.competitorScan;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 차별화 포인트를 분석해 주세요.`,
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
      `- 고유 가치: ${overview.uniqueValue}`,
    );
  }

  if (competitors) {
    parts.push(
      '',
      '경쟁사 분석 결과:',
      ...competitors.competitors.map(
        (c) => `- ${c.name}: 강점(${c.strengths.join(', ')}) / 약점(${c.weaknesses.join(', ')})`,
      ),
      '',
      `시장 공백: ${competitors.marketGaps.join(' / ')}`,
    );
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '경쟁사 대비 차별화 기능, 포지셔닝 선언문, 경쟁 해자를 분석해 주세요.',
  );

  return parts.join('\n');
}
