import { PLAN_STAGES } from '../types';

export const planStageTools = PLAN_STAGES.map((stage) => ({
  name: `bizscope-plan-${stage}` as const,
  description: `Generate or update the "${stage}" stage of the service plan.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      ideaName: { type: 'string', description: 'Name of the business idea' },
      ideaDescription: { type: 'string', description: 'Brief description' },
      research: { type: 'string', description: 'Optional research context' },
      previousStages: { type: 'object', description: 'Data from previously completed stages' },
    },
    required: ['ideaName', 'ideaDescription'],
  },
}));
