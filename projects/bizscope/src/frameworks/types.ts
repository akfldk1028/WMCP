export type SectionType =
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

export const SECTION_ORDER: SectionType[] = [
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

export const SECTION_TITLES: Record<SectionType, string> = {
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
};

export interface Report {
  id: string;
  companyName: string;
  industry?: string;
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
  | ImplicationsData;

// --- Section-specific data types ---

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

// --- Pipeline context ---

export interface PipelineContext {
  companyName: string;
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
}
