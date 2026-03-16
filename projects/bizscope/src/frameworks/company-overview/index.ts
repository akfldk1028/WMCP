import { generateSection } from '@/lib/claude';
import { extractJSON } from '../parse-json';
import type { CompanyOverviewData, PipelineContext } from '../types';
import { SYSTEM_PROMPT, buildUserMessage } from './prompts';

export async function generate(ctx: PipelineContext): Promise<CompanyOverviewData> {
  const raw = await generateSection(SYSTEM_PROMPT, buildUserMessage(ctx));
  const parsed = extractJSON<Omit<CompanyOverviewData, 'type'>>(raw);

  return {
    type: 'company-overview',
    description: parsed.description ?? '',
    industry: parsed.industry ?? '',
    founded: parsed.founded,
    headquarters: parsed.headquarters,
    employees: parsed.employees,
    revenue: parsed.revenue,
    mainProducts: parsed.mainProducts ?? [],
    keyStrengths: parsed.keyStrengths ?? [],
    recentNews: parsed.recentNews ?? [],
  };
}
