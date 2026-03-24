import { Loader2, Clock, X } from 'lucide-react';
import type { ReportSection } from '@/frameworks/types';
import { ErrorBoundary } from '@/components/error-boundary';
import { useLocale } from '@/i18n';
import CompanyOverview from '@/components/sections/CompanyOverview';
import BusinessModelDetail from '@/components/sections/BusinessModelDetail';
import KPIPerformance from '@/components/sections/KPIPerformance';
import FinancialAnalysis from '@/components/sections/FinancialAnalysis';
import PESTAnalysis from '@/components/sections/PESTAnalysis';
import FiveForceDetail from '@/components/sections/FiveForceDetail';
import PESTForcesMatrix from '@/components/sections/PESTForcesMatrix';
import KeyEnvVariables from '@/components/sections/KeyEnvVariables';
import InternalCapability from '@/components/sections/InternalCapability';
import SWOTSummary from '@/components/sections/SWOTSummary';
import TOWSCrossMatrix from '@/components/sections/TOWSCrossMatrix';
import StrategyCombination from '@/components/sections/StrategyCombination';
import SevenSAlignment from '@/components/sections/SevenSAlignment';
import PriorityMatrix from '@/components/sections/PriorityMatrix';
import StrategyCurrentComparison from '@/components/sections/StrategyCurrentComparison';
import CompetitorComparison from '@/components/sections/CompetitorComparison';
import FinalImplications from '@/components/sections/FinalImplications';
import IdeaOverview from '@/components/sections/IdeaOverview';
import IdeaTargetCustomer from '@/components/sections/IdeaTargetCustomer';
import MarketSize from '@/components/sections/MarketSize';
import MarketEnvironment from '@/components/sections/MarketEnvironment';
import CompetitorScan from '@/components/sections/CompetitorScan';
import CompetitorPositioning from '@/components/sections/CompetitorPositioning';
import Differentiation from '@/components/sections/Differentiation';
import BusinessModel from '@/components/sections/BusinessModel';
import UnitEconomics from '@/components/sections/UnitEconomics';
import GoToMarket from '@/components/sections/GoToMarket';
import GrowthStrategy from '@/components/sections/GrowthStrategy';
import FinancialProjection from '@/components/sections/FinancialProjection';
import RiskAssessment from '@/components/sections/RiskAssessment';
import IdeaReferenceCase from '@/components/sections/IdeaReferenceCase';
import ActionPlan from '@/components/sections/ActionPlan';
import ReferenceCase from '@/components/sections/ReferenceCase';

import type {
  CompanyOverviewData, BusinessModelDetailData, KPIPerformanceData, FinancialAnalysisData,
  PESTData, FiveForceDetailData, PESTForcesMatrixData, KeyEnvVariablesData,
  InternalCapabilityData,
  SWOTData, TOWSData, StrategyCombinationData, SevenSData,
  PriorityMatrixData, StrategyCurrentComparisonData, CompetitorData, ImplicationsData,
  IdeaOverviewData, IdeaTargetCustomerData, MarketSizeData, MarketEnvironmentData,
  CompetitorScanData, CompetitorPositioningData, DifferentiationData,
  BusinessModelData, UnitEconomicsData, GoToMarketData, GrowthStrategyData,
  FinancialProjectionData, RiskAssessmentData, IdeaReferenceCaseData, ActionPlanData,
  ReferenceCaseData,
} from '@/frameworks/types';

interface Props {
  section: ReportSection;
  subPage?: number; // undefined = show all, 0+ = specific sub-page
}

export default function SectionRenderer({ section, subPage }: Props) {
  const { t } = useLocale();
  const s = t.ui.section;

  if (section.status === 'pending') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-muted-foreground">
        <div className="rounded-full bg-muted p-4"><Clock className="size-8 text-muted-foreground/50" /></div>
        <p className="mt-3 text-sm font-medium">{s.pending}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">{s.pendingHint}</p>
      </div>
    );
  }

  if (section.status === 'generating') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-medium">{s.generating}</p>
        <p className="text-xs text-muted-foreground">{s.generatingHint}</p>
      </div>
    );
  }

  if (section.status === 'error') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-8 py-6 text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <X className="size-5 text-destructive" />
          </div>
          <p className="text-sm font-semibold text-destructive">{s.errorTitle}</p>
          {section.error && <p className="mt-2 text-xs text-destructive/80">{section.error}</p>}
        </div>
      </div>
    );
  }

  if (!section.data) {
    return <div className="flex min-h-[40vh] flex-col items-center justify-center text-sm text-muted-foreground">{s.noData}</div>;
  }

  return (
    <ErrorBoundary sectionTitle={section.title}>
      <SectionContent section={section} subPage={subPage} />
    </ErrorBoundary>
  );
}

function SectionContent({ section, subPage }: Props) {
  // subPage === -1 means "show all" (12-page mode)
  const sp = subPage === -1 ? undefined : subPage;

  switch (section.type) {
    case 'company-overview':
      return <CompanyOverview data={section.data as CompanyOverviewData} subPage={sp} />;
    case 'business-model-detail':
      return <BusinessModelDetail data={section.data as BusinessModelDetailData} subPage={sp} />;
    case 'kpi-performance':
      return <KPIPerformance data={section.data as KPIPerformanceData} subPage={sp} />;
    case 'financial-analysis':
      return <FinancialAnalysis data={section.data as FinancialAnalysisData} subPage={sp} />;
    case 'pest-analysis':
      return <PESTAnalysis data={section.data as PESTData} subPage={sp} />;
    case 'five-forces-detail':
      return <FiveForceDetail data={section.data as FiveForceDetailData} subPage={sp} />;
    case 'pest-forces-matrix':
      return <PESTForcesMatrix data={section.data as PESTForcesMatrixData} subPage={sp} />;
    case 'key-env-variables':
      return <KeyEnvVariables data={section.data as KeyEnvVariablesData} subPage={sp} />;
    case 'internal-capability':
      return <InternalCapability data={section.data as InternalCapabilityData} subPage={sp} />;
    case 'swot-summary':
      return <SWOTSummary data={section.data as SWOTData} subPage={sp} />;
    case 'tows-cross-matrix':
      return <TOWSCrossMatrix data={section.data as TOWSData} subPage={sp} />;
    case 'strategy-combination':
      return <StrategyCombination data={section.data as StrategyCombinationData} subPage={sp} />;
    case 'seven-s-alignment':
      return <SevenSAlignment data={section.data as SevenSData} subPage={sp} />;
    case 'priority-matrix':
      return <PriorityMatrix data={section.data as PriorityMatrixData} subPage={sp} />;
    case 'strategy-current-comparison':
      return <StrategyCurrentComparison data={section.data as StrategyCurrentComparisonData} subPage={sp} />;
    case 'competitor-comparison':
      return <CompetitorComparison data={section.data as CompetitorData} subPage={sp} />;
    case 'final-implications':
      return <FinalImplications data={section.data as ImplicationsData} subPage={sp} />;
    // Idea sections
    case 'idea-overview':
      return <IdeaOverview data={section.data as IdeaOverviewData} subPage={sp} />;
    case 'idea-target-customer':
      return <IdeaTargetCustomer data={section.data as IdeaTargetCustomerData} subPage={sp} />;
    case 'market-size':
      return <MarketSize data={section.data as MarketSizeData} subPage={sp} />;
    case 'market-environment':
      return <MarketEnvironment data={section.data as MarketEnvironmentData} subPage={sp} />;
    case 'competitor-scan':
      return <CompetitorScan data={section.data as CompetitorScanData} subPage={sp} />;
    case 'competitor-positioning':
      return <CompetitorPositioning data={section.data as CompetitorPositioningData} subPage={sp} />;
    case 'differentiation':
      return <Differentiation data={section.data as DifferentiationData} subPage={sp} />;
    case 'business-model':
      return <BusinessModel data={section.data as BusinessModelData} subPage={sp} />;
    case 'unit-economics':
      return <UnitEconomics data={section.data as UnitEconomicsData} subPage={sp} />;
    case 'go-to-market':
      return <GoToMarket data={section.data as GoToMarketData} subPage={sp} />;
    case 'growth-strategy':
      return <GrowthStrategy data={section.data as GrowthStrategyData} subPage={sp} />;
    case 'financial-projection':
      return <FinancialProjection data={section.data as FinancialProjectionData} subPage={sp} />;
    case 'risk-assessment':
      return <RiskAssessment data={section.data as RiskAssessmentData} subPage={sp} />;
    case 'idea-reference-case':
      return <IdeaReferenceCase data={section.data as IdeaReferenceCaseData} subPage={sp} />;
    case 'action-plan':
      return <ActionPlan data={section.data as ActionPlanData} subPage={sp} />;
    case 'reference-case':
      return <ReferenceCase data={section.data as ReferenceCaseData} subPage={sp} />;
    default:
      return <div className="py-20 text-center text-sm text-muted-foreground">Unknown section type: {section.type}</div>;
  }
}
