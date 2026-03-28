export const planToAnalysisTool = {
  name: 'bizscope-plan-to-analysis' as const,
  description: 'Map completed planning data (BMC + service plan) to the 15-section analysis context.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      planId: { type: 'string', description: 'Plan ID to map' },
    },
    required: ['planId'],
  },
};
