import type { PipelineContext } from '@/frameworks/types';
import { buildIdeaLines } from '@/frameworks/shared';

export const SYSTEM_PROMPT = `당신은 비즈니스 타당성 분석가입니다. 사업 아이디어의 성장 전략을 수립합니다.
장밋빛 전망 금지. 솔직하고 현실적으로 평가하세요.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "strategies": [
    {
      "type": "viral | content | partnership | paid | community | product-led",
      "name": "전략 이름",
      "description": "전략 설명 (2-3문장)",
      "cost": "예상 비용 (예: 월 $500-1000, 무료, 고비용 등)",
      "expectedImpact": "예상 효과 (예: 월 신규 유저 500명, 전환율 5% 등)",
      "timeline": "실행 시점/기간 (예: 출시 후 1-3개월)",
      "priority": "high | medium | low"
    }
  ],
  "networkEffects": {
    "type": "direct | indirect | data | none",
    "description": "네트워크 효과 설명 (1-2문장)",
    "strength": "strong | moderate | weak | none"
  },
  "expansionStages": [
    {
      "stage": "확장 단계 이름 (예: 초기 니치, 인접 시장, 대중 시장)",
      "timeline": "예상 시기 (예: 0-6개월)",
      "target": "타겟 사용자/시장",
      "strategy": "핵심 전략 (1-2문장)",
      "kpi": "핵심 성과 지표 (예: MAU 1만명)"
    }
  ],
  "internationalExpansion": {
    "feasibility": "high | medium | low",
    "priorityMarkets": ["우선 진출 시장 2-3개"],
    "barriers": ["해외 진출 장벽 2-3개"],
    "timeline": "예상 시기 (예: 2년차 이후)"
  },
  "partnerships": [
    {
      "partner": "파트너 유형/이름",
      "type": "파트너십 유형 (예: 기술 통합, 채널 파트너, 콘텐츠 제휴)",
      "benefit": "기대 효과 (1문장)",
      "feasibility": "high | medium | low"
    }
  ],
  "summary": "성장 전략 종합 평가 (2-3문장)"
}

분석 기준:
- 성장 전략 5-7개: viral, content, partnership, paid, community, product-led 중 해당되는 것
- 네트워크 효과: 없으면 none으로 솔직하게 표기
- 확장 단계 3-4단계: 현실적 타임라인과 KPI
- 해외 진출: 불필요하거나 비현실적이면 feasibility: low로 표기
- 파트너십 3-5개: 실현 가능성 기반으로 평가
- 1인/소규모 팀 기준. 대기업식 전략 금지
- 바이럴이 불가능한 제품이면 솔직하게 표현`;

export function buildUserMessage(ctx: PipelineContext): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const gtm = ctx.goToMarket;

  const parts = [`다음 사업 아이디어의 성장 전략을 수립해 주세요.`];

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
      `- 카테고리: ${overview.category}`,
    );
  }

  if (gtm) {
    const highChannels = gtm.channels.filter((c) => c.priority === 'high');
    if (highChannels.length > 0) {
      parts.push(
        '',
        'GTM 핵심 채널:',
        ...highChannels.map((c) => `- ${c.channel}: ${c.strategy}`),
      );
    }
    parts.push(`\n얼리어답터: ${gtm.earlyAdopters}`);
  }

  parts.push(
    '',
    '성장 전략, 네트워크 효과, 확장 단계, 해외 진출, 파트너십을 포함해 주세요.',
  );

  return parts.join('\n');
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const idea = ctx.ideaInput;
  const overview = ctx.ideaOverview;
  const gtm = ctx.goToMarket;

  const parts = [
    `다음 리서치 데이터를 기반으로 사업 아이디어의 성장 전략을 수립해 주세요.`,
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
      `- 카테고리: ${overview.category}`,
    );
  }

  if (gtm) {
    const highChannels = gtm.channels.filter((c) => c.priority === 'high');
    if (highChannels.length > 0) {
      parts.push(
        '',
        'GTM 핵심 채널:',
        ...highChannels.map((c) => `- ${c.channel}: ${c.strategy}`),
      );
    }
    parts.push(`\n얼리어답터: ${gtm.earlyAdopters}`);
  }

  parts.push(
    '',
    '=== 리서치 데이터 ===',
    research.slice(0, 15000),
    '===',
    '',
    '위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.',
    '성장 전략, 네트워크 효과, 확장 단계, 해외 진출, 파트너십을 포함해 주세요.',
  );

  return parts.join('\n');
}
