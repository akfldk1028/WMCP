export const planStatusTool = {
  name: 'bizscope-plan-status' as const,
  description: 'Get the current completion status of the service plan.',
  inputSchema: { type: 'object' as const, properties: { planId: { type: 'string', description: 'Plan ID' } }, required: ['planId'] },
};
