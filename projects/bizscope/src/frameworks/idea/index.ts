/**
 * Idea analysis module — barrel export for all 15 section generators.
 *
 * Structure:
 *   validation/  — CH01: 아이디어 검증 (overview, target-customer)
 *   market/      — CH02: 시장 분석 (size, environment, competitor-scan, competitor-positioning)
 *   strategy/    — CH03: 전략 수립 (differentiation, business-model, unit-economics, go-to-market, growth-strategy)
 *   execution/   — CH04: 실행 & 판정 (financial-projection, risk-assessment, reference-case, action-plan)
 */

// CH01: Validation
export { generate as generateIdeaOverview, generateWithResearch as generateIdeaOverviewWithResearch } from './validation/overview';
export { generate as generateIdeaTargetCustomer, generateWithResearch as generateIdeaTargetCustomerWithResearch } from './validation/target-customer';

// CH02: Market
export { generate as generateMarketSize, generateWithResearch as generateMarketSizeWithResearch } from './market/size';
export { generate as generateMarketEnvironment, generateWithResearch as generateMarketEnvironmentWithResearch } from './market/environment';
export { generate as generateCompetitorScan, generateWithResearch as generateCompetitorScanWithResearch } from './market/competitor-scan';
export { generate as generateCompetitorPositioning, generateWithResearch as generateCompetitorPositioningWithResearch } from './market/competitor-positioning';

// CH03: Strategy
export { generate as generateDifferentiation, generateWithResearch as generateDifferentiationWithResearch } from './strategy/differentiation';
export { generate as generateBusinessModel, generateWithResearch as generateBusinessModelWithResearch } from './strategy/business-model';
export { generate as generateUnitEconomics, generateWithResearch as generateUnitEconomicsWithResearch } from './strategy/unit-economics';
export { generate as generateGoToMarket, generateWithResearch as generateGoToMarketWithResearch } from './strategy/go-to-market';
export { generate as generateGrowthStrategy, generateWithResearch as generateGrowthStrategyWithResearch } from './strategy/growth-strategy';

// CH04: Execution
export { generate as generateFinancialProjection, generateWithResearch as generateFinancialProjectionWithResearch } from './execution/financial-projection';
export { generate as generateRiskAssessment, generateWithResearch as generateRiskAssessmentWithResearch } from './execution/risk-assessment';
export { generate as generateIdeaReferenceCase, generateWithResearch as generateIdeaReferenceCaseWithResearch } from './execution/reference-case';
export { generate as generateActionPlan, generateWithResearch as generateActionPlanWithResearch } from './execution/action-plan';
