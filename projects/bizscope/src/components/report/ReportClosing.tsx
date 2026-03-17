interface Props {
  companyName: string;
}

export default function ReportClosing({ companyName }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center px-4 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-600">
        Conclusion
      </p>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Thank You
      </h1>

      <div className="mt-6 h-0.5 w-16 bg-indigo-600" />

      <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        {companyName}에 대한 전략 분석 보고서를 마칩니다.
        본 보고서는 AI 분석을 기반으로 작성되었으며,
        실행 전 추가 검증을 권장합니다.
      </p>

      <p className="mt-auto pt-16 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
        BizScope AI Strategic Analysis
      </p>
    </div>
  );
}
