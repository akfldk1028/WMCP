// Re-export from section-types.ts (separated to avoid circular deps with i18n)
export type { CompanySectionType, IdeaSectionType, SectionType, ReportMode } from './section-types';
import type { CompanySectionType, IdeaSectionType, SectionType, ReportMode } from './section-types';

export const COMPANY_SECTION_ORDER: CompanySectionType[] = [
  'company-overview',
  'business-model-detail',
  'kpi-performance',
  'financial-analysis',
  'pest-analysis',
  'five-forces-detail',
  'pest-forces-matrix',
  'key-env-variables',
  'internal-capability',
  'swot-summary',
  'tows-cross-matrix',
  'strategy-combination',
  'seven-s-alignment',
  'priority-matrix',
  'strategy-current-comparison',
  'competitor-comparison',
  'reference-case',
  'final-implications',
];

export const IDEA_SECTION_ORDER: IdeaSectionType[] = [
  'idea-overview',
  'idea-target-customer',
  'market-size',
  'market-environment',
  'competitor-scan',
  'competitor-positioning',
  'differentiation',
  'business-model',
  'unit-economics',
  'go-to-market',
  'growth-strategy',
  'financial-projection',
  'risk-assessment',
  'idea-reference-case',
  'action-plan',
];

/** @deprecated Use COMPANY_SECTION_ORDER */
export const SECTION_ORDER: SectionType[] = COMPANY_SECTION_ORDER;

export function getSectionOrder(mode: ReportMode): SectionType[] {
  return mode === 'idea' ? IDEA_SECTION_ORDER : COMPANY_SECTION_ORDER;
}

import { getMessages } from '@/i18n';
import type { Locale } from '@/i18n';

/** Get section titles for a locale. Defaults to 'ko'. */
export function getSectionTitles(locale?: Locale | string | null): Record<SectionType, string> {
  return getMessages(locale).sections.titles;
}

/** Default section titles (Korean) for backward compatibility. */
export const SECTION_TITLES: Record<SectionType, string> = getSectionTitles('ko');

export interface IdeaInput {
  name: string;
  description: string;
  targetMarket?: string;
  /** Full markdown document (기획서) — when provided, AI parses this instead of short description */
  document?: string;
}

export interface Report {
  id: string;
  companyName: string;
  industry?: string;
  mode: ReportMode;
  ideaInput?: IdeaInput;
  createdAt: number;
  updatedAt: number;
  sections: ReportSection[];
  status: 'draft' | 'generating' | 'completed' | 'error';
}

export interface ReportSection {
  type: SectionType;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  data: SectionData | null;
  error?: string;
}

export type SectionData =
  | CompanyOverviewData
  | BusinessModelDetailData
  | KPIPerformanceData
  | FinancialAnalysisData
  | PESTData
  | FiveForceDetailData
  | PESTForcesMatrixData
  | KeyEnvVariablesData
  | InternalCapabilityData
  | SWOTData
  | TOWSData
  | StrategyCombinationData
  | SevenSData
  | PriorityMatrixData
  | StrategyCurrentComparisonData
  | CompetitorData
  | ReferenceCaseData
  | ImplicationsData
  | IdeaOverviewData
  | IdeaTargetCustomerData
  | MarketSizeData
  | MarketEnvironmentData
  | CompetitorScanData
  | CompetitorPositioningData
  | DifferentiationData
  | BusinessModelData
  | UnitEconomicsData
  | GoToMarketData
  | GrowthStrategyData
  | FinancialProjectionData
  | RiskAssessmentData
  | IdeaReferenceCaseData
  | ActionPlanData;

// --- Company section data types ---

export interface CompanyOverviewData {
  type: 'company-overview';
  description: string;
  industry: string;
  founded?: string;
  headquarters?: string;
  employees?: string;
  revenue?: string;
  mainProducts: string[];
  keyStrengths: string[];
  recentNews: string[];
  // New fields for reference-level depth
  governance?: {
    ceo?: string;
    majorShareholders?: string[];
    boardComposition?: string;
  };
  investmentHistory?: {
    event: string;
    year: string;
    amount?: string;
    description: string;
  }[];
  companyValuation?: string;
  timeline?: { year: string; event: string }[];
}

// ② Business Model Detail [NEW]
export interface BusinessModelDetailData {
  type: 'business-model-detail';
  businessModelType: string; // e.g. "3C (Content/Community/Commerce)", "Platform", etc.
  revenueStreams: {
    name: string;
    description: string;
    percentage?: string; // share of total revenue
  }[];
  platformComponents?: string[];
  valueChain: string[];
  commissionStructure?: string;
  keyPartners?: string[];
  summary: string;
}

// ③ KPI Performance [NEW]
export interface KPIPerformanceData {
  type: 'kpi-performance';
  kpis: {
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    benchmark?: string;
  }[];
  marketPosition: string;
  industryComparison?: string;
  summary: string;
}

// ④ Financial Analysis [NEW]
export interface FinancialAnalysisData {
  type: 'financial-analysis';
  incomeStatement: {
    year: string;
    revenue: string;
    operatingProfit: string;
    netIncome: string;
  }[];
  costStructure: {
    category: string;
    amount?: string;
    percentage?: string;
  }[];
  growthIndicators: {
    metric: string;
    value: string;
    interpretation: string;
  }[];
  stabilityIndicators: {
    metric: string;
    value: string;
    interpretation: string;
  }[];
  profitabilityIndicators?: {
    metric: string;
    value: string;
    interpretation: string;
  }[];
  lossAnalysis?: string;
  summary: string;
}

export type PESTCategory = 'political' | 'economic' | 'social' | 'technological';

export interface FiveForceScore {
  buyerPower: number;
  supplierPower: number;
  newEntrants: number;
  substitutes: number;
  rivalry: number;
}

export interface PESTFactor {
  id: string;
  category: PESTCategory;
  factor: string;
  description: string;
  implication: string;
  probability: number; // 0-1
  impact: number; // 1-5
  classification: 'opportunity' | 'threat';
  fiveForces: FiveForceScore;
}

export interface PESTData {
  type: 'pest-analysis';
  factors: PESTFactor[];
  summary: string;
}

// ⑥ Five Forces Detail [NEW]
export interface FiveForceAxisDetail {
  axis: 'rivalry' | 'newEntrants' | 'supplierPower' | 'buyerPower' | 'substitutes';
  label: string;
  score: number; // 1-5
  analysis: string;
  pestInfluences: {
    pestFactor: string;
    influence: string;
    direction: 'increase' | 'decrease' | 'neutral';
  }[];
}

export interface FiveForceDetailData {
  type: 'five-forces-detail';
  axes: FiveForceAxisDetail[];
  overallCompetitiveIntensity: number; // 1-5
  summary: string;
}

// ⑦ PEST × 5Forces Matrix [NEW, pure computation]
export interface PESTForcesMatrixCell {
  pestFactorId: string;
  pestFactor: string;
  pestCategory: PESTCategory;
  axis: string;
  influenceScore: number; // -5 to +5
}

export interface PESTForcesMatrixData {
  type: 'pest-forces-matrix';
  cells: PESTForcesMatrixCell[];
  axisImpactSummary: {
    axis: string;
    totalImpact: number;
    topInfluencers: string[];
  }[];
  priorityRanking: {
    pestFactor: string;
    totalInfluence: number;
    rank: number;
  }[];
  summary: string;
}

// ⑧ Key Environment Variables [replaces MatrixData]
export interface EnvVariable {
  id: string; // O1, O2, T1, T2, etc.
  label: string;
  classification: 'opportunity' | 'threat';
  probability: number; // 0-1
  impact: number; // 1-5
  priorityScore: number; // probability * impact
  description: string;
}

export interface KeyEnvVariablesData {
  type: 'key-env-variables';
  opportunities: EnvVariable[];
  threats: EnvVariable[];
  priorityRanking: { id: string; label: string; score: number }[];
  summary: string;
}

/** @deprecated Use KeyEnvVariablesData — kept for backward compat */
export interface MatrixPoint {
  id: string;
  label: string;
  possibility: number; // 0-1
  impact: number; // 1-5
  classification: 'opportunity' | 'threat';
  quadrant: 'high-high' | 'high-low' | 'low-high' | 'low-low';
}

/** @deprecated Use KeyEnvVariablesData */
export interface MatrixData {
  type: 'possibility-impact-matrix';
  points: MatrixPoint[];
}

export interface CapabilityItem {
  area: string;
  strengths: { id: string; description: string }[];
  weaknesses: { id: string; description: string }[];
  score: number; // 1-5
}

export interface InternalCapabilityData {
  type: 'internal-capability';
  capabilities: CapabilityItem[];
  overallStrengths: { id: string; description: string }[];
  overallWeaknesses: { id: string; description: string }[];
  summary: string;
}

export interface SWOTData {
  type: 'swot-summary';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary: string;
}

// --- TOWS Cross-Matrix (Weihrich 1982) ---

export interface TOWSCell {
  swType: 'S' | 'W';
  swIndex: number;
  otType: 'O' | 'T';
  otIndex: number;
  active: boolean;
  strategyCode: string; // e.g. "S1O6"
}

export interface TOWSData {
  type: 'tows-cross-matrix';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  cells: TOWSCell[];
  derivedStrategyCodes: string[];
  summary: string;
}

// --- Strategy-Current Comparison ---

export interface StrategyComparison {
  strategyLabel: string; // "A", "B", etc.
  strategyName: string;
  currentStrategy: string;
  sevenSComparison: string;
  verdict: 'match' | 'supplement' | 'missing';
  status?: 'completed' | 'in-progress' | 'planned';
}

export interface StrategyCurrentComparisonData {
  type: 'strategy-current-comparison';
  comparisons: StrategyComparison[];
  summary: string;
}

export interface StrategyItem {
  id: string;
  combination: 'SO' | 'ST' | 'WO' | 'WT';
  strategy: string;
  description: string;
  relatedSW: string;
  relatedOT: string;
  feasibility: number; // 1-5
  impact: number; // 1-5
}

export interface StrategyCombinationData {
  type: 'strategy-combination';
  strategies: StrategyItem[];
  summary: string;
}

export type SevenSElement =
  | 'strategy'
  | 'structure'
  | 'systems'
  | 'shared-values'
  | 'style'
  | 'staff'
  | 'skills';

export interface SevenSItem {
  element: SevenSElement;
  label: string;
  currentState: string;
  requiredChange: string;
  difficulty: number; // 1-5
  impact: number; // 1-5
  relatedStrategies: string[];
  executionStatus?: 'not-started' | 'in-progress' | 'completed';
  progress?: number; // 0-100
}

export interface SevenSData {
  type: 'seven-s-alignment';
  items: SevenSItem[];
  strategyClassification?: {
    strategyId: string;
    strategyName: string;
    sevenSElement: SevenSElement;
    rationale: string;
  }[];
  summary: string;
}

export interface PrioritizedStrategy {
  id: string;
  strategy: string;
  difficulty: number;
  impact: number;
  quadrant: 'quick-win' | 'major-project' | 'fill-in' | 'thankless';
  rank: number;
}

export interface PriorityMatrixData {
  type: 'priority-matrix';
  strategies: PrioritizedStrategy[];
  topPicks: string[];
}

export interface CompetitorProfile {
  name: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: string;
  keyDifferentiator: string;
  revenue?: string;
  employees?: string;
  founded?: string;
}

export interface GapItem {
  area: string;
  ourPosition: string;
  competitorBest: string;
  gap: string;
  action: string;
}

export interface CompetitorData {
  type: 'competitor-comparison';
  competitors: CompetitorProfile[];
  gaps: GapItem[];
  summary: string;
}

// ⑰ Reference Case [NEW]
export interface ReferenceCaseData {
  type: 'reference-case';
  cases: {
    company: string;
    industry: string;
    strategy: string;
    outcome: string;
    applicability: string;
  }[];
  implications: string[];
  summary: string;
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  action: string;
  timeline: string;
  owner: string;
  expectedOutcome: string;
}

export interface ImplicationsData {
  type: 'final-implications';
  keyInsights: string[];
  actionItems: ActionItem[];
  roadmap: string;
  techRoadmap?: string;
  recommendedPartners?: { name: string; reason: string }[];
  conclusion: string;
}

// --- Idea section data types ---

export interface IdeaOverviewData {
  type: 'idea-overview';
  ideaName: string;
  problemStatement: string;
  solution: string;
  targetUser: string;
  uniqueValue: string;
  category: string;
  keywords: string[];
}

export interface MarketSizeEntry {
  value: string;
  description: string;
}

export interface MarketSizeData {
  type: 'market-size';
  tam: MarketSizeEntry;
  sam: MarketSizeEntry;
  som: MarketSizeEntry;
  growthRate: string;
  trends: string[];
  summary: string;
}

export interface ScannedCompetitor {
  name: string;
  description: string;
  url?: string;
  funding?: string;
  users?: string;
  strengths: string[];
  weaknesses: string[];
}

export interface CompetitorScanData {
  type: 'competitor-scan';
  competitors: ScannedCompetitor[];
  marketGaps: string[];
  summary: string;
}

export interface UniqueFeature {
  feature: string;
  description: string;
  competitorLack: string;
}

export interface DifferentiationData {
  type: 'differentiation';
  uniqueFeatures: UniqueFeature[];
  positioningStatement: string;
  moat: string;
  summary: string;
}

export interface RevenueModel {
  modelType: string;
  description: string;
  pricing: string;
  pros: string[];
  cons: string[];
  recommended: boolean;
}

export interface UnitEconomic {
  metric: string;
  value: string;
}

export interface BusinessModelData {
  type: 'business-model';
  models: RevenueModel[];
  unitEconomics: UnitEconomic[];
  summary: string;
}

export interface GTMChannel {
  channel: string;
  strategy: string;
  cost: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LaunchPhase {
  phase: string;
  duration: string;
  goals: string[];
  actions: string[];
}

export interface GoToMarketData {
  type: 'go-to-market';
  channels: GTMChannel[];
  launchPhases: LaunchPhase[];
  earlyAdopters: string;
  summary: string;
}

export interface RiskItem {
  category: 'market' | 'technical' | 'financial' | 'regulatory' | 'competitive';
  risk: string;
  probability: number; // 1-5
  impact: number; // 1-5
  mitigation: string;
}

export interface RiskAssessmentData {
  type: 'risk-assessment';
  risks: RiskItem[];
  overallRiskLevel: 'low' | 'medium' | 'high';
  summary: string;
}

export interface Milestone {
  phase: string;
  timeline: string;
  deliverables: string[];
  budget?: string;
}

export interface KeyMetric {
  metric: string;
  target: string;
  timeline: string;
}

export interface TeamRequirement {
  role: string;
  count: number;
  priority: 'critical' | 'important' | 'nice-to-have';
}

export interface YearProjection {
  revenue: string;
  cost: string;
  profit: string;
}

export interface Verdict {
  score: number; // 1-10
  recommendation: 'strong-go' | 'go' | 'conditional' | 'no-go';
  reasoning: string;
}

export interface ScoreDimension {
  dimension: string;
  score: number; // 1-10
  evidence: string;
  verdict: 'strong' | 'adequate' | 'weak' | 'critical';
}

export interface ScoreCard {
  dimensions: ScoreDimension[];
  totalScore: number; // weighted average
  confidence: 'high' | 'medium' | 'low';
}

export interface ActionPlanData {
  type: 'action-plan';
  milestones: Milestone[];
  keyMetrics: KeyMetric[];
  teamRequirements: TeamRequirement[];
  financialProjection: {
    year1: YearProjection;
    year2: YearProjection;
    year3: YearProjection;
  };
  verdict: Verdict;
  scoreCard?: ScoreCard;
  summary: string;
}

// --- New idea section data types (expanded 8→15) ---

export interface PersonaDetail {
  name: string;
  age: string;
  occupation: string;
  income?: string;
  pain: string;
  currentSolution: string;
  desiredOutcome: string;
  willingnessToPay: string;
}

export interface CustomerJourneyStep {
  stage: string;
  action: string;
  touchpoint: string;
  painPoint: string;
  opportunity: string;
}

export interface IdeaTargetCustomerData {
  type: 'idea-target-customer';
  personas: PersonaDetail[];
  customerJourney: CustomerJourneyStep[];
  currentAlternatives: {
    name: string;
    usage: string;
    satisfaction: 'high' | 'medium' | 'low';
    switchingBarrier: string;
  }[];
  willingnessAnalysis: {
    segment: string;
    priceRange: string;
    paymentModel: string;
    reasoning: string;
  }[];
  summary: string;
}

export interface MarketEnvironmentData {
  type: 'market-environment';
  pestSummary: {
    category: 'political' | 'economic' | 'social' | 'technological';
    keyFactor: string;
    impact: string;
    direction: 'positive' | 'negative' | 'neutral';
  }[];
  techTrends: {
    trend: string;
    relevance: string;
    timeframe: string;
  }[];
  regulatoryEnvironment: {
    regulation: string;
    status: 'existing' | 'upcoming' | 'proposed';
    impact: string;
  }[];
  consumerBehavior: {
    trend: string;
    evidence: string;
    implication: string;
  }[];
  marketMaturity: 'emerging' | 'growing' | 'mature' | 'declining';
  maturityReasoning: string;
  summary: string;
}

export interface PositioningAxis {
  label: string;
  lowEnd: string;
  highEnd: string;
}

export interface PositionedCompetitor {
  name: string;
  x: number; // 0-100
  y: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  isOurs?: boolean;
}

export interface CompetitorPositioningData {
  type: 'competitor-positioning';
  axes: { x: PositioningAxis; y: PositioningAxis };
  positions: PositionedCompetitor[];
  indirectCompetitors: {
    name: string;
    overlapArea: string;
    threatLevel: 'high' | 'medium' | 'low';
  }[];
  substitutes: {
    name: string;
    description: string;
    switchingCost: string;
  }[];
  vulnerabilities: {
    competitor: string;
    weakness: string;
    exploitStrategy: string;
  }[];
  marketWhitespace: string[];
  summary: string;
}

export interface UnitEconomicsData {
  type: 'unit-economics';
  cac: { value: string; breakdown: string; benchmark?: string };
  ltv: { value: string; calculation: string; benchmark?: string };
  ltvCacRatio: { value: string; verdict: 'healthy' | 'marginal' | 'unsustainable' };
  breakEvenPoint: {
    months: string;
    customers: string;
    revenue: string;
    assumptions: string;
  };
  monthlyBurnRate: string;
  runway: string;
  margins: {
    gross: string;
    contribution: string;
    reasoning: string;
  };
  sensitivityAnalysis: {
    variable: string;
    optimistic: string;
    base: string;
    pessimistic: string;
  }[];
  summary: string;
}

export interface GrowthStrategyData {
  type: 'growth-strategy';
  strategies: {
    type: 'viral' | 'content' | 'partnership' | 'paid' | 'community' | 'product-led';
    name: string;
    description: string;
    cost: string;
    expectedImpact: string;
    timeline: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  networkEffects: {
    type: 'direct' | 'indirect' | 'data' | 'none';
    description: string;
    strength: 'strong' | 'moderate' | 'weak' | 'none';
  };
  expansionStages: {
    stage: string;
    timeline: string;
    target: string;
    strategy: string;
    kpi: string;
  }[];
  internationalExpansion?: {
    feasibility: 'high' | 'medium' | 'low';
    priorityMarkets: string[];
    barriers: string[];
    timeline: string;
  };
  partnerships: {
    partner: string;
    type: string;
    benefit: string;
    feasibility: 'high' | 'medium' | 'low';
  }[];
  summary: string;
}

export interface MonthlyProjection {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
  users?: number;
}

export interface YearlyProjection {
  year: string;
  revenue: string;
  cost: string;
  profit: string;
  users?: string;
  keyAssumptions: string[];
}

export interface FinancialProjectionData {
  type: 'financial-projection';
  monthly: MonthlyProjection[]; // 12-36 months
  yearly: YearlyProjection[]; // 3 years
  scenarios: {
    scenario: 'optimistic' | 'base' | 'pessimistic';
    year3Revenue: string;
    year3Profit: string;
    probability: string;
    keyAssumption: string;
  }[];
  fundingPlan: {
    stage: string;
    amount: string;
    timing: string;
    use: string;
    source: string;
  }[];
  keyMetrics: {
    metric: string;
    year1: string;
    year2: string;
    year3: string;
  }[];
  summary: string;
}

export interface IdeaReferenceCaseData {
  type: 'idea-reference-case';
  successCases: {
    company: string;
    industry: string;
    similarity: string;
    strategy: string;
    outcome: string;
    keyLesson: string;
    timeToSuccess: string;
  }[];
  failureCase: {
    company: string;
    industry: string;
    reason: string;
    lesson: string;
  };
  implications: string[];
  summary: string;
}

// --- Pipeline context ---

export interface PipelineContext {
  companyName: string;
  mode?: ReportMode;
  ensembleEnabled?: boolean;
  // Company mode — CH01
  companyOverview?: CompanyOverviewData;
  businessModelDetail?: BusinessModelDetailData;
  kpiPerformance?: KPIPerformanceData;
  financialAnalysis?: FinancialAnalysisData;
  // Company mode — CH02
  pest?: PESTData;
  fiveForceDetail?: FiveForceDetailData;
  pestForcesMatrix?: PESTForcesMatrixData;
  keyEnvVariables?: KeyEnvVariablesData;
  internalCapability?: InternalCapabilityData;
  // Company mode — CH03
  swot?: SWOTData;
  towsCrossMatrix?: TOWSData;
  strategyCombination?: StrategyCombinationData;
  sevenS?: SevenSData;
  priorityMatrix?: PriorityMatrixData;
  // Company mode — CH04
  strategyCurrentComparison?: StrategyCurrentComparisonData;
  competitor?: CompetitorData;
  referenceCase?: ReferenceCaseData;
  implications?: ImplicationsData;
  // Backward compat
  /** @deprecated Use keyEnvVariables */
  matrix?: MatrixData;
  // Idea mode
  ideaInput?: IdeaInput;
  ideaOverview?: IdeaOverviewData;
  ideaTargetCustomer?: IdeaTargetCustomerData;
  marketSize?: MarketSizeData;
  marketEnvironment?: MarketEnvironmentData;
  competitorScan?: CompetitorScanData;
  competitorPositioning?: CompetitorPositioningData;
  differentiation?: DifferentiationData;
  businessModel?: BusinessModelData;
  unitEconomics?: UnitEconomicsData;
  goToMarket?: GoToMarketData;
  growthStrategy?: GrowthStrategyData;
  financialProjection?: FinancialProjectionData;
  riskAssessment?: RiskAssessmentData;
  ideaReferenceCase?: IdeaReferenceCaseData;
  actionPlan?: ActionPlanData;
  scoreCard?: ScoreCard;
}
