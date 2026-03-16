import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { ImplicationsData, ActionItem, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage } from './prompts';

const VALID_PRIORITIES: ActionItem['priority'][] = ['high', 'medium', 'low'];

export async function generate(
  ctx: PipelineContext,
): Promise<ImplicationsData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<ImplicationsData, 'type'>>(raw);

  return {
    type: 'final-implications',
    keyInsights: parsed.keyInsights ?? [],
    actionItems: (parsed.actionItems ?? []).map((item) => ({
      priority: VALID_PRIORITIES.includes(item.priority as ActionItem['priority'])
        ? (item.priority as ActionItem['priority'])
        : 'medium',
      action: item.action ?? '',
      timeline: item.timeline ?? '',
      owner: item.owner ?? '',
      expectedOutcome: item.expectedOutcome ?? '',
    })),
    roadmap: parsed.roadmap ?? '',
    conclusion: parsed.conclusion ?? '',
  };
}
