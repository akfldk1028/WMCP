'use client';

import { useMemo } from 'react';
import type { Locale, Messages } from './types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './types';
import { getMessages } from './utils';

/** Read locale: cookie > data-locale attribute > default. Client-side only. */
function readLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  // 1. Cookie (user's explicit choice)
  const match = document.cookie.match(/(?:^|;\s*)locale=(\w+)/);
  if (match && SUPPORTED_LOCALES.includes(match[1] as Locale)) return match[1] as Locale;
  // 2. data-locale attribute (set by server)
  const attr = document.documentElement.getAttribute('data-locale');
  if (attr && SUPPORTED_LOCALES.includes(attr as Locale)) return attr as Locale;
  return DEFAULT_LOCALE;
}

/** Client hook — returns current locale and messages. */
export function useLocale(): { locale: Locale; t: Messages } {
  const locale = useMemo(readLocale, []);
  const t = useMemo(() => getMessages(locale), [locale]);
  return { locale, t };
}
