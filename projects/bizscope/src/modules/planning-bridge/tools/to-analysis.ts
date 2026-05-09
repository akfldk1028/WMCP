export const planToAnalysisTool = {
  name: 'bizscope-plan-to-analysis' as const,
  description: 'Map completed BMC + service plan data to the 15-section analysis context. Returns mapped fields per section.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      bmcData: { type: 'object', description: 'BMC data with blocks' },
      planData: { type: 'object', description: 'Service plan data with stages' },
    },
    required: ['bmcData', 'planData'] as string[],
  },
};
