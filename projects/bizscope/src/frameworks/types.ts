// --- Company analysis section types ---

export type CompanySectionType =
  | 'company-overview'
  | 'pest-analysis'
  | 'possibility-impact-matrix'
  | 'internal-capability'
  | 'swot-summary'
  | 'tows-cross-matrix'
  | 'strategy-combination'
  | 'seven-s-alignment'
  | 'priority-matrix'
  | 'strategy-current-comparison'
  | 'competitor-comparison'
  | 'final-implications';

// --- Idea analysis section types ---

export type IdeaSectionType =
  | 'idea-overview'
  | 'market-size'
  | 'competitor-scan'
  | 'differentiation'
  | 'business-model'
  | 'go-to-market'
  | 'risk-assessment'
  | 'action-plan';

export type SectionType = CompanySectionType | IdeaSectionType;

export type ReportMode = 'company' | 'idea';

export const COMPANY_SECTION_ORDER: CompanySectionType[] = [
  'company-overview',
  'pest-analysis',
  'possibility-impact-matrix',
  'internal-capability',
  'swot-summary',
  'tows-cross-matrix',
  'strategy-combination',
  'seven-s-alignment',
  'priority-matrix',
  'strategy-current-comparison',
  'competitor-comparison',
  'final-implications',
];

export const IDEA_SECTION_ORDER: IdeaSectionType[] = [
  'idea-overview',
  'market-size',
  'competitor-scan',
  'differentiation',
  'business-model',
  'go-to-market',
  'risk-assessment',
  'action-plan',
];

/** @deprecated Use COMPANY_SECTION_ORDER */
export const SECTION_ORDER: SectionType[] = COMPANY_SECTION_ORDER;

export function getSectionOrder(mode: ReportMode): SectionType[] {
  return mode === 'idea' ? IDEA_SECTION_ORDER : COMPANY_SECTION_ORDER;
}

export const SECTION_TITLES: Record<SectionType, string> = {
  // Company
  'company-overview': '기업 개요',
  'pest-analysis': 'PEST 분석 + 5 Forces',
  'possibility-impact-matrix': 'Possibility × Impact 매트릭스',
  'internal-capability': '내부역량 평가',
  'swot-summary': 'SWOT 종합',
  'tows-cross-matrix': 'TOWS 교차 매트릭스',
  'strategy-combination': '전략 조합 (SO/ST/WO/WT)',
  'seven-s-alignment': '7S 정렬',
  'priority-matrix': '우선순위 매트릭스',
  'strategy-current-comparison': '기업 현 전략 비교',
  'competitor-comparison': '경쟁사 비교',
  'final-implications': '시사점 및 액션 아이템',
  // Idea
  'idea-overview': '아이디어 개요',
  'market-size': '시장 규모 (TAM/SAM/SOM)',
  'competitor-scan': '경쟁 서비스 스캔',
  'differentiation': '차별화 분석',
  'business-model': '수익 모델',
  'go-to-market': 'GTM 전략',
  'risk-assessment': '리스크 평가',
  'action-plan': '실행 계획 & 판정',
};

/** Idea mode titles for the 12 company-analysis sections */
export const IDEA_SECTION_TITLES: Record<string, string> = {
  'company-overview': '아이디어 개요',
  'pest-analysis': '시장 환경 분석 (PEST + 5 Forces)',
  'possibility-impact-matrix': 'Possibility × Impact 매트릭스',
  'internal-capability': '필요 역량 vs 보유 역량',
  'swot-summary': 'SWOT 종합',
  'tows-cross-matrix': 'TOWS 교차 매트릭스',
  'strategy-combination': '실행 전략 조합 (SO/ST/WO/WT)',
  'seven-s-alignment': '7S 실행 준비도',
  'priority-matrix': '우선순위 매트릭스',
  'strategy-current-comparison': '시장 포지셔닝 분석',
  'competitor-comparison': '경쟁 앱/서비스 비교',
  'final-implications': '시사점 및 실행 로드맵',
};

export interface IdeaInput {
  name: string;
  description: string;
  targetMarket?: string;
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
  | PESTData
  | MatrixData
  | InternalCapabilityData
  | SWOTData
  | TOWSData
  | StrategyCombinationData
  | SevenSData
  | PriorityMatrixData
  | StrategyCurrentComparisonData
  | CompetitorData
  | ImplicationsData
  | IdeaOverviewData
  | MarketSizeData
  | CompetitorScanData
  | DifferentiationData
  | BusinessModelData
  | GoToMarketData
  | RiskAssessmentData
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

export interface MatrixPoint {
  id: string;
  label: string;
  possibility: number; // 0-1
  impact: number; // 1-5
  classification: 'opportunity' | 'threat';
  quadrant: 'high-high' | 'high-low' | 'low-high' | 'low-low';
}

export interface MatrixData {
  type: 'possibility-impact-matrix';
  points: MatrixPoint[];
}

export interface CapabilityItem {
  area: string;
  strengths: string[];
  weaknesses: string[];
  score: number; // 1-5
}

export interface InternalCapabilityData {
  type: 'internal-capability';
  capabilities: CapabilityItem[];
  overallStrengths: string[];
  overallWeaknesses: string[];
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
}

export interface SevenSData {
  type: 'seven-s-alignment';
  items: SevenSItem[];
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
  summary: string;
}

// --- Pipeline context ---

export interface PipelineContext {
  companyName: string;
  mode?: ReportMode;
  // Company mode
  companyOverview?: CompanyOverviewData;
  pest?: PESTData;
  matrix?: MatrixData;
  internalCapability?: InternalCapabilityData;
  swot?: SWOTData;
  towsCrossMatrix?: TOWSData;
  strategyCombination?: StrategyCombinationData;
  sevenS?: SevenSData;
  priorityMatrix?: PriorityMatrixData;
  strategyCurrentComparison?: StrategyCurrentComparisonData;
  competitor?: CompetitorData;
  implications?: ImplicationsData;
  // Idea mode
  ideaInput?: IdeaInput;
  ideaOverview?: IdeaOverviewData;
  marketSize?: MarketSizeData;
  competitorScan?: CompetitorScanData;
  differentiation?: DifferentiationData;
  businessModel?: BusinessModelData;
  goToMarket?: GoToMarketData;
  riskAssessment?: RiskAssessmentData;
  actionPlan?: ActionPlanData;
}
