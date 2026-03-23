/** SCAMPER 7기법 구현 */

import Anthropic from '@anthropic-ai/sdk';
import type { Idea, ScamperType } from '@/types/creativity';
import { CREATIVE_SYSTEM_PROMPT } from '../prompts/system';
import { buildScamperPrompt, buildFullScamperPrompt } from '../prompts/scamper';

const anthropic = new Anthropic();

/** 단일 SCAMPER 기법 적용 */
export async function scamperTransform(idea: Idea, technique: ScamperType): Promise<Idea> {
  const prompt = buildScamperPrompt(
    { title: idea.title, description: idea.description },
    technique
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: CREATIVE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text) as {
    title: string;
    description: string;
    transformation: string;
    noveltyScore: number;
  };

  return {
    id: `scamper-${technique}-${Date.now()}`,
    title: parsed.title,
    description: parsed.description,
    theory: 'scamper',
    method: technique,
    parentId: idea.id,
    scores: {
      domainRelevance: 0,
      creativeThinking: parsed.noveltyScore,
      motivation: 0,
      overall: 0,
    },
    createdAt: new Date().toISOString(),
  };
}

/** 모든 7가지 SCAMPER 한번에 적용 */
export async function scamperFullSweep(idea: Idea): Promise<Idea[]> {
  const prompt = buildFullScamperPrompt({
    title: idea.title,
    description: idea.description,
  });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CREATIVE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text) as {
    results: { technique: ScamperType; title: string; description: string; transformation: string }[];
  };

  return parsed.results.map((r) => ({
    id: `scamper-${r.technique}-${Date.now()}`,
    title: r.title,
    description: r.description,
    theory: 'scamper' as const,
    method: r.technique,
    parentId: idea.id,
    createdAt: new Date().toISOString(),
  }));
}
