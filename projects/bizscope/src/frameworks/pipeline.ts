import {
  COMPANY_SECTION_ORDER,
  type SectionType,
  type SectionData,
  type PipelineContext,
} from './types';
import { GENERATORS, CONTEXT_KEYS, checkDependencies } from './shared';
import type { Locale } from '@/i18n';

export async function runPipeline(
  companyName: string,
  onSectionStart: (type: SectionType) => void,
  onSectionComplete: (type: SectionType, data: SectionData) => void,
  onSectionError: (type: SectionType, error: string) => void,
  locale?: Locale,
): Promise<PipelineContext> {
  const ctx: PipelineContext = { companyName };

  for (const sectionType of COMPANY_SECTION_ORDER) {
    onSectionStart(sectionType);
    const depError = checkDependencies(sectionType, ctx, locale);
    if (depError) {
      onSectionError(sectionType, depError);
      continue;
    }
    try {
      const generator = GENERATORS[sectionType];
      const data = await generator(ctx);
      const key = CONTEXT_KEYS[sectionType];
      (ctx as any)[key] = data;
      onSectionComplete(sectionType, data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onSectionError(sectionType, message);
    }
  }
  return ctx;
}
