import type { SectionType } from '@/frameworks/types';
import { useLocale } from '@/i18n';

interface Props {
  sectionIndex: number;
  sectionType: SectionType;
  sectionTitle: string;
  companyName: string;
}

export default function SectionCover({ sectionIndex, sectionType, sectionTitle, companyName }: Props) {
  const { t } = useLocale();
  const description = t.sections.descriptions[sectionType];
  const num = String(sectionIndex + 1).padStart(2, '0');

  return (
    <div className="flex min-h-[60vh] flex-col justify-center px-4 py-16">
      {/* Giant background number */}
      <div className="relative">
        <span className="absolute -top-16 -left-2 select-none text-[140px] font-black leading-none tabular-nums text-muted-foreground/[0.04]">
          {num}
        </span>

        {/* Section label */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-600">
          {t.ui.reportNew.sectionLabel} {num}
        </p>

        {/* Title */}
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {sectionTitle}
        </h1>

        {/* Divider */}
        <div className="mt-6 h-0.5 w-16 bg-indigo-600" />

        {/* Description */}
        {description && (
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Company name */}
      <p className="mt-auto pt-12 text-xs font-medium text-muted-foreground/50">
        {companyName}
      </p>
    </div>
  );
}
