export const bmcGenerateTool = {
  name: 'bizscope-bmc-generate' as const,
  description: 'Generate a Business Model Canvas (9 blocks) draft based on an idea name and description.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      ideaName: { type: 'string', description: 'Name of the business idea or product' },
      ideaDescription: { type: 'string', description: 'Brief description of the idea' },
      research: { type: 'string', description: 'Optional web research context (max 15000 chars)' },
    },
    required: ['ideaName', 'ideaDescription'],
  },
};
