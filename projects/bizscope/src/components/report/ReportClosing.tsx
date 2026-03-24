import { useLocale } from '@/i18n';

interface Props {
  companyName: string;
}

export default function ReportClosing({ companyName }: Props) {
  const { t } = useLocale();
  const rc = t.ui.reportClosing;

  return (
    <div className="flex min-h-[60vh] flex-col justify-center px-4 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-600">
        {rc.label}
      </p>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {rc.title}
      </h1>

      <div className="mt-6 h-0.5 w-16 bg-indigo-600" />

      <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        {rc.body(companyName)}
      </p>

      <p className="mt-auto pt-16 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
        {rc.branding}
      </p>
    </div>
  );
}
