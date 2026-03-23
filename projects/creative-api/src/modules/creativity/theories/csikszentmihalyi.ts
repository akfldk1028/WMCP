/** Csikszentmihalyi's Systems Model — Individual × Domain × Field 검증 */

/** 시스템 모델의 3자 검증 결과 */
export interface SystemsValidation {
  individual: { score: number; notes: string };
  domain: { score: number; notes: string };
  field: { score: number; notes: string };
  approved: boolean;
}

/**
 * 시스템 모델 검증: 아이디어가 3자 모두에서 인정받는지
 * - Individual: 생성 에이전트가 만들었으면 OK (항상 통과)
 * - Domain: Graph DB에 관련 지식이 있는지
 * - Field: 시장/전문가 관점에서 유효한지
 */
export function validateSystemsModel(
  individualScore: number,
  domainNodeCount: number,
  fieldValidationScore: number
): SystemsValidation {
  const domainScore = Math.min(100, domainNodeCount * 10);
  const approved = individualScore >= 50 && domainScore >= 30 && fieldValidationScore >= 50;

  return {
    individual: {
      score: individualScore,
      notes: individualScore >= 50 ? 'Agent generated viable idea' : 'Idea lacks substance',
    },
    domain: {
      score: domainScore,
      notes: domainNodeCount > 0
        ? `${domainNodeCount} related nodes in knowledge graph`
        : 'No domain knowledge found — consider immersion phase',
    },
    field: {
      score: fieldValidationScore,
      notes: fieldValidationScore >= 50
        ? 'Field validation passed'
        : 'Needs field expert review',
    },
    approved,
  };
}
