import { CashflowTable, Callout, ChapterShell, Formula, Headline, LEARN_CHAPTERS } from '@/modules/finance-learn/primitives';
import MultiplesSimulator from './Simulator';

const META = LEARN_CHAPTERS.find((c) => c.slug === 'multiples')!;

export default function MultiplesPage() {
  return (
    <ChapterShell meta={META}>
      <section className="space-y-4">
        <Headline>
          Multiple Method는 유사한 기업을 선정하여 그 기업의 순이익·현금흐름·장부가·매출액에 대비시킴으로써 기업가치를
          산정하는 방법.
        </Headline>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">PER (주가수익률)</h2>
        <p className="text-sm text-muted-foreground">
          주가에 대비한 기업의 경영성과(주가수준에 비해 성과가 얼마나 좋은가). PER이 낮을수록 주가의 상승여력이 강한 것이 일반적.
        </p>
        <Formula>PER = 주가 / 주당순이익 → 기업가치 = 대상회사 순이익 × 유사기업 PER</Formula>
        <CashflowTable
          caption="제일기획 손익 — 슬라이드 8 원본 표"
          columns={['2016', '2015', '2014']}
          rows={[
            { label: '연결 당기순이익', cells: ['90,648', '81,741', '102,022'] },
            { label: '자본총계', cells: ['776,285', '800,340', '882,690'] },
            { label: '기업가치 (PER 20×)', cells: ['1,812,960', '1,634,820', '2,040,440'] },
            { label: '경쟁사 PER 25× 적용', cells: ['2,266,200', '2,043,525', '2,550,550'], emphasize: true },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">PBR (시장가치 대 장부가액)</h2>
        <p className="text-sm text-muted-foreground">
          회사가 보유한 순자산의 주당 가치(일종의 청산가치). PBR이 1 이상이면 자산가치가 주가에 비해 낮은 것.
        </p>
        <Formula>PBR = 주가 / 주당순자산 → 기업가치 = 대상회사 자본 × 유사기업 PBR</Formula>
        <CashflowTable
          caption="제일기획 PBR 적용 — 슬라이드 9"
          columns={['2016', '2015', '2014']}
          rows={[
            { label: '자본총계', cells: ['776,285', '800,340', '882,690'] },
            { label: '기업가치 (PBR 1.5×)', cells: ['1,164,427', '1,200,510', '1,324,035'] },
            { label: '경쟁사 PBR 2× 적용', cells: ['1,552,570', '1,600,680', '1,765,380'], emphasize: true },
          ]}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">PSR (시장가치 대 매출액)</h2>
        <p className="text-sm text-muted-foreground">
          당장의 수익성보다 미래가치가 중시되는 벤처기업 등에 주로 활용. PSR이 높을수록 매출 성장 가능성이 강함.
        </p>
        <Formula>PSR = 시가총액 / 매출액 → 기업가치 = 대상회사 매출 × 유사기업 PSR</Formula>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold">EV / EBITDA</h2>
        <p className="text-sm text-muted-foreground">
          EBITDA가 Cash Flow의 척도로 대부분의 M&A 투자자가 가장 관심을 갖는 지표. EV는 시총 + 순차입금.
        </p>
        <Formula>
          EV = 주가 × 주식수 + 순차입금
          <br />
          기업가치(주주가치) = (대상회사 EBITDA × 유사기업 EV/EBITDA) − 순부채
        </Formula>
        <CashflowTable
          caption="이마트 vs 롯데쇼핑 — 슬라이드 10 (단위: 억원)"
          columns={['이마트', '롯데쇼핑']}
          rows={[
            { label: '매출액', cells: ['220,330', '161,844'] },
            { label: '당기순이익', cells: ['3,626', '−6,866'] },
            { label: 'EBITDA', cells: ['12,234', '16,208'] },
            { label: '자본총계', cells: ['104,966', '110,888'] },
            { label: '순차입금', cells: ['49,760', '118,945'] },
            { label: '발행주식수', cells: ['27,875,819', '28,288,755'] },
          ]}
        />
        <Callout>
          롯데쇼핑 기준 산정된 이마트 적용 배수: PER 11.7배 / PBR 0.3배 / PSR 0.18배 / EV·EBITDA 9.54배. (롯데 PER이
          N/A이므로 GS리테일 PER 사용)
        </Callout>
      </section>

      <MultiplesSimulator />
    </ChapterShell>
  );
}
