/** Guilford SI Model — 발산/수렴 사고 엔진 */

import Anthropic from '@anthropic-ai/sdk';
import { CREATIVE_SYSTEM_PROMPT } from '../prompts/system';
import { buildDivergentPrompt } from '../prompts/divergent';
import { buildConvergentPrompt } from '../prompts/convergent';
import type { Idea, DivergentResult, ConvergentResult, IdeaScores } from '@/types/creativity';

const anthropic = new Anthropic();

/** 발산적 생성: 주제에서 N개 아이디어 독립 생성 */
export async function divergentGenerate(
  topic: string,
  domain: string,
  count = 10
): Promise<DivergentResult> {
  const prompt = buildDivergentPrompt(topic, domain, count);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CREATIVE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text) as { ideas: { title: string; description: string }[] };

  const ideas: Idea[] = parsed.ideas.map((raw, i) => ({
    id: `idea-${Date.now()}-${i}`,
    title: raw.title,
    description: raw.description,
    theory: 'guilford_si',
    method: 'divergent',
    createdAt: new Date().toISOString(),
  }));

  return { ideas, totalGenerated: ideas.length, method: 'direct' };
}

/** 수렴적 선택: 아이디어를 평가하고 순위 매기기 */
export async function convergentSelect(
  ideas: Idea[],
  domain: string,
  criteria?: string[]
): Promise<ConvergentResult> {
  const prompt = buildConvergentPrompt(
    ideas.map((i) => ({ title: i.title, description: i.description })),
    domain,
    criteria
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CREATIVE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text) as {
    ranked: { index: number; title: string; scores: IdeaScores; reasoning: string }[];
    eliminated: { index: number; reason: string }[];
  };

  const ranked: Idea[] = parsed.ranked.map((r) => ({
    ...ideas[r.index],
    scores: r.scores,
  }));

  const eliminated = parsed.eliminated.map((e) => ideas[e.index]?.id).filter(Boolean);

  return { ranked, criteria: criteria ?? ['domain relevance', 'creative originality', 'feasibility'], eliminated };
}
