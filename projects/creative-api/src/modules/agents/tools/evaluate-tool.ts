/** Evaluate Tool — Amabile 3요소 평가 (에이전트가 자율 사용) */

import type { AgentTool } from './registry';

export const evaluateTool: AgentTool = {
  name: 'evaluate_idea',
  description: `Evaluate an idea using Amabile's 3-Component model. Returns scores for: domainRelevance (30%), creativeThinking (50%), motivation/intrinsic interest (20%). Use this in the Isolation phase for independent, unbiased evaluation.`,
  parameters: {
    idea_title: { type: 'string', description: 'Title of the idea' },
    idea_description: { type: 'string', description: 'Description' },
    domain: { type: 'string', description: 'Domain context for evaluation' },
  },
  execute: async (params) => {
    // 프레임 제공 — 실제 점수는 에이전트 LLM이 판단
    return {
      framework: 'Amabile Componential Theory (1996)',
      criteria: {
        domainRelevance: { weight: 0.3, question: 'How well does it fit domain knowledge and standards?' },
        creativeThinking: { weight: 0.5, question: 'How novel, surprising, and non-obvious? Cognitive flexibility?' },
        motivation: { weight: 0.2, question: 'How intrinsically interesting? Would someone pursue this out of genuine curiosity?' },
      },
      formula: 'overall = domainRelevance * 0.3 + creativeThinking * 0.5 + motivation * 0.2',
      instruction: 'Score each dimension 0-100, calculate overall, provide reasoning.',
    };
  },
};
