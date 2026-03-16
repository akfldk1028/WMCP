import { BarChart3 } from 'lucide-react';

interface Props {
  companyName: string;
}

export default function ReportClosing({ companyName }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl">
        <BarChart3 className="size-8 text-white" />
      </div>

      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">
        Thank You
      </h1>

      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        {companyName}에 대한 전략 분석 보고서를 마칩니다.
        <br />
        본 보고서는 AI 분석을 기반으로 작성되었으며,
        실행 전 추가 검증을 권장합니다.
      </p>

      <div className="mt-8 h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />

      <p className="mt-8 text-xs font-semibold tracking-widest text-muted-foreground/60">
        BIZSCOPE AI STRATEGIC ANALYSIS
      </p>
    </div>
  );
}
