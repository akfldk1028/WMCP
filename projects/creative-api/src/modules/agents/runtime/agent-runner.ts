/** Agent Runner — 자율적 에이전트 실행 엔진
 *
 * 핵심 루프: observe → think → act (tool use) → observe → ...
 *
 * 설계 원칙:
 * 1. 에이전트는 자율적으로 어떤 도구를 쓸지 결정
 * 2. 루프는 에이전트가 "done" 판단하거나 maxSteps 도달 시 종료
 * 3. 모든 행동은 로그로 남김 (투명성)
 * 4. 새 에이전트 타입 추가 = AgentDefinition 하나 + registry에 도구 등록
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AgentRole } from '@/types/agent';
import { getToolsForRole, toAnthropicTools, type AgentTool } from '../tools/registry';
import { AGENT_DEFINITIONS, type AgentDefinition } from './definitions';

const anthropic = new Anthropic();

export interface AgentStep {
  step: number;
  thought: string;
  toolUsed?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: unknown;
  timestamp: string;
}

export interface AgentRunResult {
  role: AgentRole;
  goal: string;
  steps: AgentStep[];
  finalOutput: string;
  nodesCreated: number;
  edgesCreated: number;
  toolsUsed: string[];
  duration: number;
}

/** 에이전트 실행 — 자율 루프 */
export async function runAgent(
  role: AgentRole,
  goal: string,
  context?: string,
  maxSteps = 10
): Promise<AgentRunResult> {
  const startTime = Date.now();
  const definition = AGENT_DEFINITIONS[role];
  if (!definition) throw new Error(`Unknown agent role: ${role}`);

  const tools = getToolsForRole(role);
  const anthropicTools = toAnthropicTools(tools);
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  const steps: AgentStep[] = [];
  const toolsUsed = new Set<string>();
  let nodesCreated = 0;
  let edgesCreated = 0;

  // 대화 히스토리 (에이전트의 "기억")
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Your goal: ${goal}\n\n${context ? `Context:\n${context}\n\n` : ''}Use your tools to accomplish this goal autonomously. When you're done, say "DONE:" followed by your final output summary.`,
    },
  ];

  const systemPrompt = `${definition.systemPrompt}

You are an autonomous AI agent with tools. Work step-by-step:
1. Think about what you need to do next
2. Use a tool if needed
3. Observe the result
4. Decide next action
5. When finished, say "DONE:" followed by your summary

Available tools: ${tools.map((t) => t.name).join(', ')}
Always save your generated ideas to the graph using graph_add_node.
Always create connections between related ideas using graph_add_edge.`;

  for (let step = 0; step < maxSteps; step++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      tools: anthropicTools,
      messages,
    });

    // 응답 처리
    const assistantContent = response.content;
    messages.push({ role: 'assistant', content: assistantContent });

    // 텍스트 응답 확인 — "DONE:" 포함이면 종료
    const textBlocks = assistantContent.filter((b): b is Anthropic.TextBlock => b.type === 'text');
    const fullText = textBlocks.map((b) => b.text).join('\n');

    if (fullText.includes('DONE:') || response.stop_reason === 'end_turn') {
      const finalOutput = fullText.split('DONE:').pop()?.trim() ?? fullText;
      steps.push({
        step,
        thought: finalOutput,
        timestamp: new Date().toISOString(),
      });

      return {
        role,
        goal,
        steps,
        finalOutput,
        nodesCreated,
        edgesCreated,
        toolsUsed: [...toolsUsed],
        duration: Date.now() - startTime,
      };
    }

    // Tool use 처리
    const toolUseBlocks = assistantContent.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');

    if (toolUseBlocks.length === 0) {
      // 도구 호출 없이 텍스트만 반환 — 종료로 간주
      steps.push({ step, thought: fullText, timestamp: new Date().toISOString() });
      return {
        role, goal, steps, finalOutput: fullText,
        nodesCreated, edgesCreated, toolsUsed: [...toolsUsed],
        duration: Date.now() - startTime,
      };
    }

    // 각 도구 실행
    const toolResults: Anthropic.MessageParam = {
      role: 'user',
      content: await Promise.all(toolUseBlocks.map(async (block) => {
        const tool = toolMap.get(block.name);
        toolsUsed.add(block.name);

        let result: unknown;
        if (tool) {
          result = await tool.execute(block.input as Record<string, unknown>);
          // 노드/엣지 생성 추적
          if (block.name === 'graph_add_node') nodesCreated++;
          if (block.name === 'graph_add_edge') edgesCreated++;
        } else {
          result = { error: `Tool not found: ${block.name}` };
        }

        steps.push({
          step,
          thought: fullText || `Using ${block.name}`,
          toolUsed: block.name,
          toolInput: block.input as Record<string, unknown>,
          toolResult: result,
          timestamp: new Date().toISOString(),
        });

        return {
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: JSON.stringify(result),
        };
      })),
    };

    messages.push(toolResults);
  }

  // maxSteps 도달
  return {
    role, goal, steps,
    finalOutput: `Agent reached max steps (${maxSteps})`,
    nodesCreated, edgesCreated, toolsUsed: [...toolsUsed],
    duration: Date.now() - startTime,
  };
}
