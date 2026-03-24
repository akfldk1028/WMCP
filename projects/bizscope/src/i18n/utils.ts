import type { SectionType } from '@/frameworks/section-types';
import type { Locale, Messages } from './types';
import { DEFAULT_LOCALE } from './types';
import ko from './ko';
import en from './en';

const messageMap: Record<Locale, Messages> = { ko, en };

/** Get full messages for a locale. Falls back to DEFAULT_LOCALE. */
export function getMessages(locale?: Locale | string | null): Messages {
  const key = (locale && locale in messageMap ? locale : DEFAULT_LOCALE) as Locale;
  return messageMap[key];
}

/** Get section title for a given section type. */
export function getSectionTitle(sectionType: SectionType, locale?: Locale | string | null): string {
  const msgs = getMessages(locale);
  return msgs.sections.titles[sectionType] ?? sectionType;
}

/** Get section description for a given section type. */
export function getSectionDescription(sectionType: SectionType, locale?: Locale | string | null): string {
  const msgs = getMessages(locale);
  return msgs.sections.descriptions[sectionType] ?? '';
}

/** Get sub-page titles for a given section type. */
export function getSubPageTitles(sectionType: SectionType, locale?: Locale | string | null): string[] {
  const msgs = getMessages(locale);
  return msgs.sections.subPageTitles[sectionType] ?? [];
}

/** Detect locale from various sources. Server-side safe. */
export function detectLocale(
  searchParams?: { locale?: string; lang?: string } | null,
  headerAcceptLanguage?: string | null,
  cookieHeader?: string | null,
): Locale {
  // 1. Explicit query param
  const paramLocale = searchParams?.locale ?? searchParams?.lang;
  if (paramLocale && paramLocale in messageMap) return paramLocale as Locale;

  // 2. Cookie (user's explicit choice — takes priority over browser header)
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)locale=(\w+)/);
    if (match && match[1] in messageMap) return match[1] as Locale;
  }

  // 3. Accept-Language header — try all entries
  if (headerAcceptLanguage) {
    const entries = headerAcceptLanguage.split(',');
    for (const entry of entries) {
      const lang = entry.split(';')[0]?.split('-')[0]?.trim().toLowerCase();
      if (lang && lang in messageMap) return lang as Locale;
    }
  }

  return DEFAULT_LOCALE;
}
