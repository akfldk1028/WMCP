'use client';

import { useEffect } from 'react';

declare global {
  interface Navigator {
    modelContext?: {
      registerTool(tool: {
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
        execute: (input: Record<string, unknown>) => Promise<unknown>;
        annotations?: { readOnlyHint?: boolean };
      }): void;
      unregisterTool(name: string): void;
    };
  }
}

const API_BASE = '';

const TOOLS = [
  {
    name: 'shopguard-analyze',
    description:
      'Analyze a shopping page for fake reviews, hidden fees, and dark patterns. Send the full HTML of any e-commerce product page and get an evidence-based trust report.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'Full HTML of the shopping page' },
        url: { type: 'string', description: 'Page URL (helps platform detection)' },
        locale: { type: 'string', enum: ['ko', 'en'], default: 'en', description: 'Language' },
      },
      required: ['html'],
    },
    endpoint: '/api/analyze',
    readOnly: true,
  },
  {
    name: 'shopguard-darkpatterns',
    description:
      'Scan HTML for 14 types of dark patterns: fake urgency, social proof, confirmshaming, misdirection, preselection, forced continuity, obstruction, hidden costs, privacy zuckering, bait-and-switch, drip pricing, nagging, trick wording, and disguised ads. Returns evidence and context for each match.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML content to scan for dark patterns' },
      },
      required: ['html'],
    },
    endpoint: '/api/darkpatterns',
    readOnly: true,
  },
  {
    name: 'shopguard-reviews',
    description:
      'Analyze review authenticity using 7 statistical signals: date clustering, rating anomaly, phrase repetition, length uniformity, incentive keywords, rating surge, and AI generation detection. Requires a paid plan.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML containing reviews' },
        reviews: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              rating: { type: 'number' },
              date: { type: 'string' },
            },
            required: ['text'],
          },
          description: 'Pre-extracted reviews (alternative to HTML)',
        },
        locale: { type: 'string', enum: ['ko', 'en'], default: 'en' },
      },
    },
    endpoint: '/api/reviews',
    readOnly: true,
  },
  {
    name: 'shopguard-pricing',
    description:
      'Detect hidden fees, drip pricing, subscription traps, and deceptive price anchoring in shopping page HTML. Requires a paid plan.',
    inputSchema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML containing pricing information' },
      },
      required: ['html'],
    },
    endpoint: '/api/pricing',
    readOnly: true,
  },
];

export function WebMCPRegistration() {
  useEffect(() => {
    if (!navigator.modelContext) return;

    const registered: string[] = [];

    for (const tool of TOOLS) {
      try {
        navigator.modelContext.registerTool({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          annotations: { readOnlyHint: tool.readOnly },
          async execute(input) {
            const res = await fetch(`${API_BASE}${tool.endpoint}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer sg_demo_free',
              },
              body: JSON.stringify(input),
            });
            const data = await res.json();
            return { content: [{ type: 'text', text: JSON.stringify(data) }] };
          },
        });
        registered.push(tool.name);
      } catch {
        // Tool already registered or API not available
      }
    }

    return () => {
      if (!navigator.modelContext) return;
      for (const name of registered) {
        try {
          navigator.modelContext.unregisterTool(name);
        } catch {
          // Already unregistered
        }
      }
    };
  }, []);

  return null;
}
