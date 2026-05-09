export const planStatusTool = {
  name: 'bizscope-plan-status' as const,
  description: 'Get the completion status of BMC and/or service plan. Pass the data objects directly.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      bmcData: { type: 'object', description: 'BMC data with blocks (from bizscope-bmc-generate)' },
      planData: { type: 'object', description: 'Service plan data with stages (from plan stage tools)' },
    },
    required: [] as string[],
  },
};
