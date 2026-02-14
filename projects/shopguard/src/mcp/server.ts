import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { analyzeReviews } from '../review/index.js';
import { analyzePrices } from '../price/index.js';
import { analyzeDarkPatterns } from '../darkpattern/index.js';

function ok(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

function err(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
    isError: true as const,
  };
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'shopguard',
    version: '0.1.0',
  });

  server.tool(
    'analyzeReviews',
    'Analyze product reviews for fake/manipulated patterns',
    {
      reviews: z.array(
        z.object({
          text: z.string(),
          rating: z.number(),
          date: z.string(),
          author: z.string().optional(),
          verified: z.boolean().optional(),
        }),
      ),
      locale: z.enum(['ko', 'en']).default('ko'),
    },
    async ({ reviews, locale }) => {
      try {
        return ok(analyzeReviews(reviews, { locale }));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'detectHiddenFees',
    'Detect hidden fees and subscription traps in page HTML',
    {
      html: z.string(),
    },
    async ({ html }) => {
      try {
        return ok(analyzePrices(html));
      } catch (e) {
        return err(e);
      }
    },
  );

  server.tool(
    'scanDarkPatterns',
    'Scan page content for dark patterns and deceptive UX',
    {
      content: z.string(),
      html: z.string().optional(),
    },
    async ({ content, html }) => {
      try {
        return ok(analyzeDarkPatterns(content, html));
      } catch (e) {
        return err(e);
      }
    },
  );

  return server;
}
