import { BarChart3 } from 'lucide-react';

interface Props {
  companyName: string;
  industry?: string;
  createdAt: number;
}

export default function ReportCover({ companyName, industry, createdAt }: Props) {
  const date = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-8 py-16 text-center">
      {/* Logo */}
      <div className="mb-10 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl">
        <BarChart3 className="size-8 text-white" />
      </div>

      {/* Subtitle */}
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
        AI Strategic Analysis Report
      </p>

      {/* Company name */}
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
        {companyName}
      </h1>

      {/* Industry */}
      {industry && (
        <p className="mb-8 text-lg text-muted-foreground">{industry}</p>
      )}

      {/* Divider */}
      <div className="h-1 w-32 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />

      {/* Meta */}
      <div className="mt-8 space-y-1 text-sm text-muted-foreground">
        <p>{date}</p>
        <p>12 Frameworks &middot; Comprehensive Analysis</p>
      </div>

      {/* Branding */}
      <p className="mt-12 text-xs font-semibold tracking-widest text-muted-foreground/60">
        POWERED BY BIZSCOPE AI
      </p>
    </div>
  );
}
