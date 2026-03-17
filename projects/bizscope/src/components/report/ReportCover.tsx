import type { ReportMode } from '@/frameworks/types';

interface Props {
  companyName: string;
  industry?: string;
  createdAt: number;
  mode?: ReportMode;
}

export default function ReportCover({ companyName, industry, createdAt, mode = 'company' }: Props) {
  const date = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-[70vh] flex-col justify-center px-4 py-16">
      {/* Subtitle */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-600">
        {mode === 'idea' ? 'AI Business Feasibility Report' : 'AI Strategic Analysis Report'}
      </p>

      {/* Company name */}
      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
        {companyName}
      </h1>

      {/* Industry */}
      {industry && (
        <p className="mt-3 text-lg text-muted-foreground">{industry}</p>
      )}

      {/* Divider */}
      <div className="mt-8 h-0.5 w-20 bg-indigo-600" />

      {/* Meta */}
      <div className="mt-6 space-y-1 text-sm text-muted-foreground">
        <p>{date}</p>
        <p>{mode === 'idea' ? '8 Sections' : '12 Frameworks'} &middot; Comprehensive Analysis</p>
      </div>

      {/* Branding */}
      <p className="mt-auto pt-16 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
        Powered by BizScope AI
      </p>
    </div>
  );
}
