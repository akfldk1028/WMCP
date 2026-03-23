/** Role Storming — 역할 기반 관점 전환 */

import Anthropic from '@anthropic-ai/sdk';
import type { Idea } from '@/types/creativity';
import { JSON_INSTRUCTION, CREATIVE_SYSTEM_PROMPT } from '../prompts/system';

const anthropic = new Anthropic();

const ROLES = [
  { name: 'Customer', perspective: 'What would make my life easier? What frustrates me?' },
  { name: 'Competitor', perspective: 'How would I disrupt this market? What weakness can I exploit?' },
  { name: 'Child', perspective: 'Why not? What if? Can we make it fun?' },
  { name: 'Investor', perspective: 'Where is the 10x return? What scales?' },
  { name: 'Artist', perspective: 'How can this be beautiful? What emotion does it evoke?' },
];

export async function roleStorm(topic: string, domain: string): Promise<Idea[]> {
  const prompt = `You are practicing ROLE STORMING — adopting different perspectives to generate creative ideas.

Topic: "${topic}"
Domain: "${domain}"

For each role below, generate 1 idea from that character's unique perspective:
${ROLES.map((r) => `- ${r.name}: ${r.perspective}`).join('\n')}

${JSON_INSTRUCTION}

Format:
{
  "ideas": [
    { "role": "Customer", "title": "...", "description": "...", "insightFromRole": "..." },
    ...
  ]
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: CREATIVE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = JSON.parse(text) as {
    ideas: { role: string; title: string; description: string; insightFromRole: string }[];
  };

  return parsed.ideas.map((r, i) => ({
    id: `role-${r.role.toLowerCase()}-${Date.now()}-${i}`,
    title: r.title,
    description: `[${r.role}] ${r.description}`,
    theory: 'guilford_si' as const,
    method: `role_storming:${r.role}`,
    createdAt: new Date().toISOString(),
  }));
}
