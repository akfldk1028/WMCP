import { BMC_BLOCKS } from '../types';

export const bmcUpdateTool = {
  name: 'bizscope-bmc-update' as const,
  description: 'Update a specific block in the Business Model Canvas with new entries.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      block: { type: 'string', description: 'BMC block to update', enum: BMC_BLOCKS },
      entries: { type: 'array', items: { type: 'string' }, description: 'New entries for this block' },
      notes: { type: 'string', description: 'Optional notes or context' },
      mode: { type: 'string', enum: ['replace', 'append'], description: 'Replace or append entries (default: replace)' },
    },
    required: ['block', 'entries'],
  },
};
