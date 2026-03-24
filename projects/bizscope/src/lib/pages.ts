import {
  COMPANY_SECTION_ORDER,
  IDEA_SECTION_ORDER,
  SECTION_TITLES,
  type SectionType,
  type ReportMode,
} from '@/frameworks/types';
import { getMessages, getSectionTitle, getSubPageTitles as getI18nSubPageTitles } from '@/i18n';
import type { Locale } from '@/i18n';

export type PageKind = 'report-cover' | 'section-cover' | 'section-content' | 'report-closing';

export interface PageDef {
  kind: PageKind;
  sectionIndex: number;   // -1 for report-cover/closing
  sectionType?: SectionType;
  sectionTitle: string;
  subPage: number;        // content sub-page index
  pageTitle: string;
  pageNumber: number;     // 1-based
}

/** @deprecated Use getMessages(locale).sections.descriptions — kept for backward compat */
export const SECTION_DESCRIPTIONS: Record<string, string> = getMessages('ko').sections.descriptions;

/**
 * Sub-page titles per section — now sourced from i18n.
 * Kept as a backward-compat alias for default locale (ko).
 *
 * Page counts match the 50-page reference report (버킷플레이스):
 * CH01 (17p), CH02 (17p), CH03 (7p), CH04 (8p)
 * = ~50+ content + 18 covers + 2 report cover/closing = ~70p expanded
 */
const SUB_PAGE_TITLES: Record<string, string[]> = getMessages('ko').sections.subPageTitles;

function getLocalSubPageTitles(type: SectionType, locale?: Locale | string | null): string[] {
  if (locale && locale !== 'ko') return getI18nSubPageTitles(type, locale);
  return SUB_PAGE_TITLES[type] ?? [];
}

function getLocalSectionTitle(type: SectionType, locale?: Locale | string | null): string {
  if (locale && locale !== 'ko') return getSectionTitle(type, locale);
  return SECTION_TITLES[type];
}

function getSectionOrderForMode(mode: ReportMode): SectionType[] {
  return mode === 'idea' ? IDEA_SECTION_ORDER : COMPANY_SECTION_ORDER;
}

/** Expanded mode: report cover + (cover + content pages) × N + closing */
export function generateExpandedPages(mode: ReportMode = 'company', locale?: Locale | string | null): PageDef[] {
  const pages: PageDef[] = [];
  let pageNum = 1;
  const order = getSectionOrderForMode(mode);

  pages.push({
    kind: 'report-cover',
    sectionIndex: -1,
    sectionTitle: '',
    subPage: -1,
    pageTitle: 'Report Cover',
    pageNumber: pageNum++,
  });

  order.forEach((type, sectionIndex) => {
    const sectionTitle = getLocalSectionTitle(type, locale);

    pages.push({
      kind: 'section-cover',
      sectionIndex,
      sectionType: type,
      sectionTitle,
      subPage: -1,
      pageTitle: sectionTitle,
      pageNumber: pageNum++,
    });

    getLocalSubPageTitles(type, locale).forEach((subTitle, subIdx) => {
      pages.push({
        kind: 'section-content',
        sectionIndex,
        sectionType: type,
        sectionTitle,
        subPage: subIdx,
        pageTitle: subTitle,
        pageNumber: pageNum++,
      });
    });
  });

  pages.push({
    kind: 'report-closing',
    sectionIndex: -1,
    sectionTitle: '',
    subPage: -1,
    pageTitle: 'Closing',
    pageNumber: pageNum++,
  });

  return pages;
}

/** Compact mode: one page per section */
export function generateCompactPages(mode: ReportMode = 'company', locale?: Locale | string | null): PageDef[] {
  const order = getSectionOrderForMode(mode);
  return order.map((type, sectionIndex) => ({
    kind: 'section-content' as const,
    sectionIndex,
    sectionType: type,
    sectionTitle: getLocalSectionTitle(type, locale),
    subPage: -1,
    pageTitle: getLocalSectionTitle(type, locale),
    pageNumber: sectionIndex + 1,
  }));
}

export function getSubPageCount(type: SectionType, locale?: Locale | string | null): number {
  return getLocalSubPageTitles(type, locale).length;
}
