/** Agent Tool Registry — 에이전트가 자율적으로 사용할 수 있는 도구 목록
 *
 * 설계 원칙:
 * 1. 각 도구는 독립적 — 에이전트가 어떤 순서로든 조합 가능
 * 2. 새 도구 추가 = 파일 하나 + registry에 등록
 * 3. 에이전트별로 사용 가능한 도구 제한 가능 (역할 기반)
 * 4. 모든 도구는 JSON 스키마로 정의 — LLM tool calling 호환
 */

import type { AgentRole } from '@/types/agent';
import { webSearchTool } from './web-search';
import { graphQueryTool, graphAddNodeTool, graphAddEdgeTool, graphSearchTool } from './graph-tools';
import { scamperTool } from './scamper-tool';
import { evaluateTool } from './evaluate-tool';
import { brainstormTool } from './brainstorm-tool';

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

/** 전체 도구 레지스트리 */
export const ALL_TOOLS: AgentTool[] = [
  webSearchTool,
  graphQueryTool,
  graphAddNodeTool,
  graphAddEdgeTool,
  graphSearchTool,
  scamperTool,
  evaluateTool,
  brainstormTool,
];

/** 역할별 사용 가능한 도구 매핑 */
const ROLE_TOOLS: Record<AgentRole, string[]> = {
  creative_director: ['web_search', 'graph_search', 'graph_query', 'evaluate_idea'],
  divergent_thinker: ['web_search', 'brainstorm', 'scamper_transform', 'graph_add_node', 'graph_add_edge'],
  evaluator:         ['evaluate_idea', 'graph_search', 'graph_query'],
  researcher:        ['web_search', 'graph_search', 'graph_query', 'graph_add_node'],
  iterator:          ['graph_search', 'scamper_transform', 'graph_add_node', 'graph_add_edge', 'web_search'],
  field_validator:   ['web_search', 'graph_search', 'evaluate_idea'],
};

/** 역할에 맞는 도구만 필터링 */
export function getToolsForRole(role: AgentRole): AgentTool[] {
  const allowedNames = ROLE_TOOLS[role] ?? [];
  return ALL_TOOLS.filter((t) => allowedNames.includes(t.name));
}

/** Anthropic tool calling 형식으로 변환 */
export function toAnthropicTools(tools: AgentTool[]) {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: {
      type: 'object' as const,
      properties: t.parameters,
      required: Object.keys(t.parameters),
    },
  }));
}
