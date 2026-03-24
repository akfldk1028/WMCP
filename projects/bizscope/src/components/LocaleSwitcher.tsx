'use client';

import { useCallback } from 'react';
import { Globe } from 'lucide-react';
import { useLocale } from '@/i18n';
import type { Locale } from '@/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'EN',
};

const NEXT_LOCALE: Record<Locale, Locale> = {
  ko: 'en',
  en: 'ko',
};

const SWITCH_LABEL: Record<Locale, string> = {
  ko: 'English로 전환',
  en: 'Switch to 한국어',
};

export default function LocaleSwitcher() {
  const { locale } = useLocale();

  const toggle = useCallback(() => {
    const next = NEXT_LOCALE[locale];
    document.cookie = `locale=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    window.location.reload();
  }, [locale]);

  const label = SWITCH_LABEL[locale];

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
      title={label}
      aria-label={label}
    >
      <Globe className="size-4" />
      <span className="text-xs">{LOCALE_LABELS[locale]}</span>
    </button>
  );
}
