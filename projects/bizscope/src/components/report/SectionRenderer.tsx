import { Loader2, Clock, X } from 'lucide-react';
import type { ReportSection } from '@/frameworks/types';
import { ErrorBoundary } from '@/components/error-boundary';
import CompanyOverview from '@/components/sections/CompanyOverview';
import PESTAnalysis from '@/components/sections/PESTAnalysis';
import PossibilityImpactMatrix from '@/components/sections/PossibilityImpactMatrix';
import InternalCapability from '@/components/sections/InternalCapability';
import SWOTSummary from '@/components/sections/SWOTSummary';
import TOWSCrossMatrix from '@/components/sections/TOWSCrossMatrix';
import StrategyCombination from '@/components/sections/StrategyCombination';
import SevenSAlignment from '@/components/sections/SevenSAlignment';
import PriorityMatrix from '@/components/sections/PriorityMatrix';
import StrategyCurrentComparison from '@/components/sections/StrategyCurrentComparison';
import CompetitorComparison from '@/components/sections/CompetitorComparison';
import FinalImplications from '@/components/sections/FinalImplications';

import type {
  CompanyOverviewData, PESTData, MatrixData, InternalCapabilityData,
  SWOTData, TOWSData, StrategyCombinationData, SevenSData,
  PriorityMatrixData, StrategyCurrentComparisonData, CompetitorData, ImplicationsData,
} from '@/frameworks/types';

interface Props {
  section: ReportSection;
  subPage?: number; // undefined = show all, 0+ = specific sub-page
}

export default function SectionRenderer({ section, subPage }: Props) {
  if (section.status === 'pending') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center text-muted-foreground">
        <div className="rounded-full bg-muted p-4"><Clock className="size-8 text-muted-foreground/50" /></div>
        <p className="mt-3 text-sm font-medium">대기 중...</p>
        <p className="mt-1 text-xs text-muted-foreground/60">이전 섹션이 완료되면 자동으로 시작됩니다</p>
      </div>
    );
  }

  if (section.status === 'generating') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-medium">분석 생성 중...</p>
        <p className="text-xs text-muted-foreground">AI가 데이터를 분석하고 있습니다</p>
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
          <p className="text-sm font-semibold text-destructive">오류 발생</p>
          {section.error && <p className="mt-2 text-xs text-destructive/80">{section.error}</p>}
        </div>
      </div>
    );
  }

  if (!section.data) {
    return <div className="flex min-h-[40vh] flex-col items-center justify-center text-sm text-muted-foreground">데이터 없음</div>;
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
    case 'pest-analysis':
      return <PESTAnalysis data={section.data as PESTData} subPage={sp} />;
    case 'possibility-impact-matrix':
      return <PossibilityImpactMatrix data={section.data as MatrixData} subPage={sp} />;
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
    default:
      return <div className="py-20 text-center text-sm text-muted-foreground">알 수 없는 섹션 타입</div>;
  }
}
