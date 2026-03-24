import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 경쟁 서비스의 포지셔닝 맵을 작성합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "axes": {
    "x": {
      "label": "X축 이름 (예: 가격)",
      "lowEnd": "낮은 쪽 설명 (예: 저가)",
      "highEnd": "높은 쪽 설명 (예: 고가)"
    },
    "y": {
      "label": "Y축 이름 (예: 기능 범위)",
      "lowEnd": "낮은 쪽 설명 (예: 단순)",
      "highEnd": "높은 쪽 설명 (예: 종합)"
    }
  },
  "positions": [
    {
      "name": "서비스/제품 이름",
      "x": 0-100,
      "y": 0-100,
      "size": "small | medium | large",
      "isOurs": false
    }
  ],
  "indirectCompetitors": [
    {
      "name": "간접 경쟁사 이름",
      "overlapArea": "겹치는 영역 (1문장)",
      "threatLevel": "high | medium | low"
    }
  ],
  "substitutes": [
    {
      "name": "대체재 이름",
      "description": "대체 방법 설명 (1문장)",
      "switchingCost": "전환 비용 수준 및 근거 (1문장)"
    }
  ],
  "vulnerabilities": [
    {
      "competitor": "경쟁사 이름",
      "weakness": "약점 (1문장)",
      "exploitStrategy": "공략 전략 (1문장)"
    }
  ],
  "marketWhitespace": ["시장 공백 영역 3-5개"],
  "summary": "경쟁 포지셔닝 종합 평가 (2-3문장)"
}

분석 기준:
- 2축 포지셔닝 맵: 해당 시장에서 가장 의미 있는 2개 축 선택
- 경쟁사 + 우리 서비스 포함 총 6-10개 포지셔닝
- 우리 서비스(isOurs: true)는 반드시 1개 포함
- size: 시장 점유율/인지도 기반 (large/medium/small)
- 간접 경쟁사 3-5개: 다른 카테고리에서 유사한 니즈를 충족하는 서비스
- 대체재 2-3개: 제품이 아닌 기존 해결 방법 (수작업, 기존 프로세스 등)
- 경쟁사 약점 3-5개: 구체적이고 공략 가능한 약점
- 시장 공백: 현재 아무도 충분히 커버하지 못하는 영역`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const scan = ctx.competitorScan;

  const parts = [`다음 경쟁 분석 결과를 바탕으로 포지셔닝 맵을 작성해 주세요.`];

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

  if (scan) {
    parts.push(
      '',
      '경쟁 서비스 스캔 결과:',
      ...scan.competitors.map((c) =>
        `- ${c.name}: ${c.description} (강점: ${c.strengths.join(', ')} / 약점: ${c.weaknesses.join(', ')})`
      ),
      '',
      `시장 공백: ${scan.marketGaps.join(', ')}`,
    );
  }

  parts.push(
    '',
    '2축 포지셔닝 맵, 간접 경쟁사, 대체재, 경쟁사 약점, 시장 공백을 분석해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const scan = ctx.competitorScan;

  const parts = [
    `다음 리서치 데이터를 기반으로 경쟁 포지셔닝 맵을 작성해 주세요.`,
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

  if (scan) {
    parts.push(
      '',
      '경쟁 서비스 스캔 결과:',
      ...scan.competitors.map((c) =>
        `- ${c.name}: ${c.description} (강점: ${c.strengths.join(', ')} / 약점: ${c.weaknesses.join(', ')})`
      ),
    );
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '2축 포지셔닝 맵, 간접 경쟁사, 대체재, 경쟁사 약점, 시장 공백을 분석해 주세요.',
  );

  return parts.join('\n');
}
