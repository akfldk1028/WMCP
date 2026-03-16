import {
  SECTION_ORDER,
  type SectionType,
  type SectionData,
  type PipelineContext,
} from '../frameworks/types';
import { GENERATORS, CONTEXT_KEYS, DEPENDENCY_MAP } from '../frameworks/shared';

export interface RunResult {
  companyName: string;
  sections: Record<string, SectionData | { error: string }>;
  completedSections: string[];
  failedSections: string[];
}

/**
 * Run pipeline for a subset of sections.
 * Sections run in SECTION_ORDER, skipping those not in `sectionFilter`.
 * Dependencies are resolved from accumulated context.
 */
export async function runSections(
  companyName: string,
  sectionFilter?: SectionType[],
): Promise<RunResult> {
  const ctx: PipelineContext = { companyName };
  const result: RunResult = {
    companyName,
    sections: {},
    completedSections: [],
    failedSections: [],
  };

  const sectionsToRun = sectionFilter
    ? SECTION_ORDER.filter((s) => sectionFilter.includes(s))
    : SECTION_ORDER;

  // We still need to generate dependencies even if not in filter
  const needed = new Set(sectionsToRun);

  // Resolve transitive dependencies
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of needed) {
      const deps = DEPENDENCY_MAP[s];
      if (!deps) continue;
      for (const d of deps) {
        if (!needed.has(d)) {
          needed.add(d);
          changed = true;
        }
      }
    }
  }

  const toExecute = SECTION_ORDER.filter((s) => needed.has(s));

  for (const sectionType of toExecute) {
    try {
      const generator = GENERATORS[sectionType];
      const data = await generator(ctx);
      const key = CONTEXT_KEYS[sectionType];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ctx as any)[key] = data;

      // Only include in output if it was explicitly requested
      if (!sectionFilter || sectionFilter.includes(sectionType)) {
        result.sections[sectionType] = data;
        result.completedSections.push(sectionType);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!sectionFilter || sectionFilter.includes(sectionType)) {
        result.sections[sectionType] = { error: message };
        result.failedSections.push(sectionType);
      }
    }
  }

  return result;
}
