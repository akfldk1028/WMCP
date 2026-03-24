import type { SectionType } from '@/frameworks/section-types';

export type Locale = 'ko' | 'en';

export const DEFAULT_LOCALE: Locale = 'ko';
export const SUPPORTED_LOCALES: Locale[] = ['ko', 'en'];

export interface SectionMessages {
  titles: Record<SectionType, string>;
  descriptions: Record<SectionType, string>;
  subPageTitles: Partial<Record<SectionType, string[]>>;
}

export interface UIMessages {
  // Common
  appName: string;
  // Navigation
  nav: {
    pricing: string;
    history: string;
  };
  // Landing page
  landing: {
    badge: string;
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    heroCta: string;
    companyFrameworksTitle: string;
    companyFrameworksSubtitle: string;
    ideaFrameworksTitle: string;
    ideaFrameworksSubtitle: string;
    scorecardTitle: string;
    scorecardSubtitle: string;
    scorecardNote: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPricing: string;
    ctaButton: string;
    ctaPricingLink: string;
    footer: string;
  };
  // Frameworks display
  frameworks: {
    company: { name: string; sections: string; desc: string }[];
    idea: { name: string; sections: string; desc: string }[];
    scorecardDimensions: string[];
  };
  // Stats
  stats: { value: number; label: string; suffix: string }[];
  // Report new page
  reportNew: {
    companyMode: string;
    ideaMode: string;
    companyTitle: string;
    companySubtitle: string;
    ideaTitle: string;
    ideaSubtitle: string;
    ideaNameLabel: string;
    ideaNamePlaceholder: string;
    ideaDescLabel: string;
    ideaDescPlaceholder: string;
    ideaTargetLabel: string;
    ideaTargetPlaceholder: string;
    ideaDocLabel: string;
    ideaDocPlaceholder: string;
    ideaDocHint: string;
    ideaDocTemplatePlaceholder: string;
    ideaSubmit: string;
    inputSimple: string;
    inputDoc: string;
    sectionLabel: string;          // "섹션" / "Section"
    charCount: (n: string) => string; // "1,234자" / "1,234 chars"
    documentAttached: string;      // "[기획서 첨부됨]" / "[Document attached]"
    // Company framework preview
    companyChapters: { num: string; label: string; desc: string }[];
    // Idea framework preview
    ideaChapters: { num: string; label: string; desc: string }[];
  };
  // License
  license: {
    proUnlimited: string;
    creditsRemaining: (n: number | string) => string;
    freeRemaining: (n: number) => string;
    keyActivated: string;
    changeKey: string;
    enterKey: string;
    checking: string;
    confirm: string;
    remove: string;
    invalidKey: string;
    noKey: string;
    buyLink: string;
  };
  // Report status
  report: {
    analyzing: string;
    progressLabel: (completed: number, total: number) => string;
    completed: string;
    error: string;
  };
  // Section renderer
  section: {
    pending: string;
    pendingHint: string;
    generating: string;
    generatingHint: string;
    errorTitle: string;
    noData: string;
  };
  // Scorecard verdicts
  verdicts: {
    strongGo: string;
    go: string;
    conditional: string;
    noGo: string;
  };
  // Generation errors
  errors: {
    freeLimitExceeded: string;
    invalidLicense: string;
    insufficientCredits: string;
    creditDeductionFailed: string;
    goToPricing: string;
  };
  // Pipeline
  pipeline: {
    dependencyError: (labels: string) => string;
  };
  // Pricing page
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    annual: string;
    annualDiscount: string;
    freePlan: { name: string; desc: string; features: string[]; cta: string };
    proPlan: { name: string; badge: string; desc: string; features: string[]; cta: string; perMonth: string; billedAnnually: (amount: string) => string };
    perReport: { name: string; desc: string; cta: string };
    licenseSection: { title: string; desc: string; currentKey: string; validKey: (plan: string, credits?: number) => string; invalidKey: string };
    startAnalysis: string;
  };
  // Report viewer
  viewer: {
    cover: string;
    closing: string;
    complete: (n: number, total: number) => string;
    exportPdf: string;
    pageOf: (page: number, total: number) => string;
  };
  // Report cover / closing
  reportCover: {
    ideaSubtitle: string;
    companySubtitle: string;
    ideaMeta: string;
    companyMeta: string;
    branding: string;
  };
  reportClosing: {
    label: string;
    title: string;
    body: (companyName: string) => string;
    branding: string;
  };
  // Metadata
  meta: {
    title: string;
    titleTemplate: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
}

export interface Messages {
  ui: UIMessages;
  sections: SectionMessages;
}
