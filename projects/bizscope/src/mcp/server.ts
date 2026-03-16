import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { runSections } from './pipeline-runner';
import type { SectionType } from '../frameworks/types';

export function createServer(): McpServer {
  const server = new McpServer({
    name: 'bizscope',
    version: '0.1.0',
  });

  // 1. Full 12-section report
  server.tool(
    'analyze_company',
    '기업 전체 12섹션 경영전략 보고서 생성',
    { companyName: z.string().describe('분석할 기업명') },
    async ({ companyName }) => {
      const result = await runSections(companyName);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  // 2. PEST + 5 Forces
  server.tool(
    'pest_analysis',
    'PEST 분석 + 5 Forces (섹션 1~2)',
    { companyName: z.string().describe('분석할 기업명') },
    async ({ companyName }) => {
      const sections: SectionType[] = [
        'company-overview',
        'pest-analysis',
      ];
      const result = await runSections(companyName, sections);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  // 3. SWOT comprehensive
  server.tool(
    'swot_analysis',
    'SWOT 종합 분석 (섹션 1~5)',
    { companyName: z.string().describe('분석할 기업명') },
    async ({ companyName }) => {
      const sections: SectionType[] = [
        'company-overview',
        'pest-analysis',
        'possibility-impact-matrix',
        'internal-capability',
        'swot-summary',
      ];
      const result = await runSections(companyName, sections);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  // 4. Competitor comparison
  server.tool(
    'competitor_comparison',
    '경쟁사 비교 분석 (섹션 1~5, 11)',
    { companyName: z.string().describe('분석할 기업명') },
    async ({ companyName }) => {
      const sections: SectionType[] = [
        'company-overview',
        'pest-analysis',
        'possibility-impact-matrix',
        'internal-capability',
        'swot-summary',
        'competitor-comparison',
      ];
      const result = await runSections(companyName, sections);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  // 5. Strategy report with priorities
  server.tool(
    'strategy_report',
    '우선순위 전략 보고서 (섹션 1~9)',
    { companyName: z.string().describe('분석할 기업명') },
    async ({ companyName }) => {
      const sections: SectionType[] = [
        'company-overview',
        'pest-analysis',
        'possibility-impact-matrix',
        'internal-capability',
        'swot-summary',
        'tows-cross-matrix',
        'strategy-combination',
        'seven-s-alignment',
        'priority-matrix',
      ];
      const result = await runSections(companyName, sections);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}
