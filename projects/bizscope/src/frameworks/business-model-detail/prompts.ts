import type { PipelineContext } from '../types';

export const SYSTEM_PROMPT = `당신은 한국의 경영전략 컨설턴트입니다. 사업모델 상세 분석을 수행합니다.
반드시 유효한 JSON으로만 응답하세요. 마크다운이나 설명 텍스트 없이 JSON만 출력합니다.

JSON 스키마:
{
  "businessModelType": "사업 모델 유형 (예: 플랫폼, SaaS, 커머스 등)",
  "revenueStreams": [{ "name": "수익원 이름", "description": "설명", "percentage": "비중" }],
  "platformComponents": ["플랫폼 구성요소"],
  "valueChain": ["가치사슬 단계"],
  "commissionStructure": "수수료 구조 설명",
  "keyPartners": ["핵심 파트너"],
  "summary": "사업모델 종합 요약"
}

사업모델을 3C(Content/Community/Commerce) 또는 해당 기업의 비즈니스 모델 프레임워크로 분석하세요.
revenueStreams는 3-6개, valueChain은 4-8단계, keyPartners는 3-5개로 작성하세요.`;

export function buildUserMessage(ctx: PipelineContext): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 매출: ${overview.revenue ?? '정보 없음'}`
    : '';

  return `"${ctx.companyName}" 기업의 사업모델을 3C(Content/Community/Commerce) 또는 해당 기업의 비즈니스 모델로 분석하고, 수익 구조를 구체적으로 설명하세요.${overviewText}

각 수익원의 비중(percentage)을 포함하고, 가치사슬과 수수료 구조를 상세히 분석해 주세요.`;
}

export function buildWebMCPUserMessage(ctx: PipelineContext, research: string): string {
  const overview = ctx.companyOverview;
  const overviewText = overview
    ? `\n\n기업 개요:\n- 산업: ${overview.industry}\n- 설명: ${overview.description}\n- 주력 제품: ${overview.mainProducts.join(', ')}\n- 매출: ${overview.revenue ?? '정보 없음'}`
    : '';

  return `다음 리서치 데이터를 기반으로 "${ctx.companyName}" 기업의 사업모델을 상세 분석해 주세요.${overviewText}

=== 리서치 데이터 ===
${research.slice(0, 15000)}
===

위 데이터에 기반해서만 분석하세요. 데이터에 없는 내용은 추측하지 마세요.
사업모델을 3C(Content/Community/Commerce) 또는 해당 기업의 비즈니스 모델로 분석하고, 수익 구조를 구체적으로 설명하세요.`;
}
