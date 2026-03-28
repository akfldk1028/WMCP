import type { A2UIMessage } from '@/modules/a2ui/types';

/** A message in the planning chat */
export interface PlanningMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  a2ui?: A2UIMessage;
  timestamp: number;
}

/** Chat session state */
export interface PlanningChatState {
  messages: PlanningMessage[];
  isLoading: boolean;
  error: string | null;
  activeSurfaceIds: Set<string>;
}

/** Chat configuration */
export interface PlanningChatConfig {
  apiEndpoint: string;
  planId?: string;
  mode: 'bmc' | 'service-planning' | 'both';
}

/** Event sent from chat to parent */
export interface PlanningChatEvent {
  type: 'block-complete' | 'stage-complete' | 'plan-ready';
  data: Record<string, unknown>;
}
