import type { SectionType, SectionData, ReportMode } from '@/frameworks/types';
import type { A2UIMessage } from '@/modules/a2ui/types';

/** A message in the analysis chat */
export interface AnalysisMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  /** If this message is about a section result */
  sectionType?: SectionType;
  /** A2UI components attached to this message */
  a2ui?: A2UIMessage;
  timestamp: number;
}

/** Status of a single section in the analysis flow */
export interface SectionStatus {
  type: SectionType;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  data: SectionData | null;
  error?: string;
}

/** Config for AnalysisChat component */
export interface AnalysisChatConfig {
  mode: ReportMode;
  subjectName: string;
  /** For idea mode */
  ideaDescription?: string;
  ideaTarget?: string;
  /** Planning data from bridge */
  planningData?: Record<string, Record<string, unknown>>;
}

/** Events emitted from AnalysisChat to parent */
export interface AnalysisChatEvent {
  type: 'section-complete' | 'all-complete' | 'error';
  data: Record<string, unknown>;
}
