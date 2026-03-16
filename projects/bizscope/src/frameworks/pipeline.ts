import {
  SECTION_ORDER,
  type SectionType,
  type SectionData,
  type PipelineContext,
} from './types';
import { GENERATORS, CONTEXT_KEYS, checkDependencies } from './shared';

export async function runPipeline(
  companyName: string,
  onSectionStart: (type: SectionType) => void,
  onSectionComplete: (type: SectionType, data: SectionData) => void,
  onSectionError: (type: SectionType, error: string) => void,
): Promise<PipelineContext> {
  const ctx: PipelineContext = { companyName };

  for (const sectionType of SECTION_ORDER) {
    onSectionStart(sectionType);

    // Check required upstream dependencies before attempting generation
    const depError = checkDependencies(sectionType, ctx);
    if (depError) {
      onSectionError(sectionType, depError);
      continue;
    }

    try {
      const generator = GENERATORS[sectionType];
      const data = await generator(ctx);

      // Store result in context for downstream sections
      const key = CONTEXT_KEYS[sectionType];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any)[key] = data;

      onSectionComplete(sectionType, data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onSectionError(sectionType, message);
      // Continue pipeline -- downstream sections will work with what's available
    }
  }

  return ctx;
}
