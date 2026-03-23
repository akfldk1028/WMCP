/** Multi-Agent Orchestrator — 여러 에이전트 자율 협업
 *
 * 4I's 파이프라인을 진짜 에이전트 팀으로 실행.
 * 각 에이전트는 자율적으로 도구를 사용하고, 결과를 Graph DB에 저장.
 * Orchestrator는 단계 간 전환만 관리.
 */

import type { AgentRole } from '@/types/agent';
import type { CreativeSession } from '@/types/session';
import { runAgent, type AgentRunResult } from './agent-runner';

export interface MultiAgentResult {
  sessionId: string;
  topic: string;
  domain: string;
  agentResults: AgentRunResult[];
  totalNodesCreated: number;
  totalEdgesCreated: number;
  totalDuration: number;
}

/** 4I's 멀티에이전트 파이프라인 — 진짜 자율 에이전트 버전 */
export async function runMultiAgentPipeline(
  topic: string,
  domain: string
): Promise<MultiAgentResult> {
  const sessionId = `session-${Date.now()}`;
  const startTime = Date.now();
  const agentResults: AgentRunResult[] = [];

  const baseContext = `Topic: "${topic}"\nDomain: "${domain}"\nSession: ${sessionId}`;

  // Phase 1: IMMERSION — researcher가 자율적으로 웹 검색 + Graph 탐색
  const researchResult = await runAgent(
    'researcher',
    `Research the domain "${domain}" for topic "${topic}". Gather context, find trends, identify gaps.`,
    baseContext,
    8
  );
  agentResults.push(researchResult);

  const researchContext = `${baseContext}\n\nResearch findings:\n${researchResult.finalOutput}`;

  // Phase 2: INSPIRATION — divergent_thinker가 자율적으로 아이디어 생성
  const divergentResult = await runAgent(
    'divergent_thinker',
    `Generate 10+ creative ideas about "${topic}" in "${domain}". Use SCAMPER, brainstorming, and save everything to the graph.`,
    researchContext,
    12
  );
  agentResults.push(divergentResult);

  const ideaContext = `${researchContext}\n\nGenerated ideas:\n${divergentResult.finalOutput}`;

  // Phase 3: ISOLATION — evaluator + field_validator 독립 실행 (병렬)
  const [evalResult, fieldResult] = await Promise.all([
    runAgent(
      'evaluator',
      `Evaluate all generated ideas independently using Amabile's 3-component scoring. Rank them.`,
      ideaContext,
      8
    ),
    runAgent(
      'field_validator',
      `Validate the generated ideas against market reality. Check originality, feasibility, demand.`,
      ideaContext,
      8
    ),
  ]);
  agentResults.push(evalResult, fieldResult);

  const evalContext = `${ideaContext}\n\nEvaluation:\n${evalResult.finalOutput}\n\nField Validation:\n${fieldResult.finalOutput}`;

  // Phase 4: ITERATION — iterator가 상위 아이디어를 자율적으로 변주
  const iterResult = await runAgent(
    'iterator',
    `Take the top-rated ideas and create meaningful iterations. Find universal themes, apply to new contexts.`,
    evalContext,
    10
  );
  agentResults.push(iterResult);

  return {
    sessionId,
    topic,
    domain,
    agentResults,
    totalNodesCreated: agentResults.reduce((sum, r) => sum + r.nodesCreated, 0),
    totalEdgesCreated: agentResults.reduce((sum, r) => sum + r.edgesCreated, 0),
    totalDuration: Date.now() - startTime,
  };
}
