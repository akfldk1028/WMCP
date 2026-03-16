import { SECTION_ORDER, SECTION_TITLES, type SectionType } from '@/frameworks/types';

export type PageKind = 'report-cover' | 'section-cover' | 'section-content' | 'report-closing';

export interface PageDef {
  kind: PageKind;
  sectionIndex: number;   // -1 for report-cover/closing
  sectionType?: SectionType;
  sectionTitle: string;
  subPage: number;        // content sub-page index
  pageTitle: string;
  pageNumber: number;     // 1-based
}

export const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  'company-overview': '기업의 기본 정보, 사업 구조, 핵심 역량 및 최근 동향을 종합적으로 파악합니다.',
  'pest-analysis': '정치·경제·사회·기술 거시 환경과 Porter\'s Five Forces를 분석합니다.',
  'possibility-impact-matrix': 'PEST 요인의 발생 가능성과 사업 영향도를 매트릭스로 시각화합니다.',
  'internal-capability': '기업 내부의 핵심 역량 영역별 강점과 약점을 평가합니다.',
  'swot-summary': '외부 환경(O/T)과 내부 역량(S/W)을 종합하여 SWOT 매트릭스를 도출합니다.',
  'tows-cross-matrix': 'SWOT 요소들을 교차 분석하여 전략적 조합(SO/ST/WO/WT)을 식별합니다.',
  'strategy-combination': 'TOWS에서 도출된 전략 코드를 구체적인 실행 전략으로 발전시킵니다.',
  'seven-s-alignment': 'McKinsey 7S 프레임워크로 전략 실행을 위한 조직 정렬을 진단합니다.',
  'priority-matrix': '전략의 실행 난이도와 기대 효과를 기반으로 우선순위를 산정합니다.',
  'strategy-current-comparison': '도출된 전략과 기업의 현행 전략을 비교 평가합니다.',
  'competitor-comparison': '주요 경쟁사의 강점/약점을 분석하고 자사와의 Gap을 식별합니다.',
  'final-implications': '전체 분석 결과를 종합하여 핵심 시사점과 실행 로드맵을 제시합니다.',
};

/** Sub-page titles per section (content pages only, cover is auto) */
const SUB_PAGE_TITLES: Record<SectionType, string[]> = {
  'company-overview': ['기업 소개 & 핵심 지표', '주요 제품 & 핵심 강점', '최근 동향'],
  'pest-analysis': ['PEST 요인 분석', 'Five Forces 분석', 'Key Takeaway'],
  'possibility-impact-matrix': ['매트릭스 시각화', '사분면 분석'],
  'internal-capability': ['역량 영역별 평가', '종합 강점 / 약점', 'Key Takeaway'],
  'swot-summary': ['SWOT 매트릭스', 'Key Takeaway'],
  'tows-cross-matrix': ['TOWS 교차 분석', '도출 전략 코드', 'Key Takeaway'],
  'strategy-combination': ['전략 유형 분포', '전략 조합표', 'Key Takeaway'],
  'seven-s-alignment': ['7S 피라미드', '변화 요구사항', 'Key Takeaway'],
  'priority-matrix': ['우선순위 매트릭스', '전략 순위 & Quick Win'],
  'strategy-current-comparison': ['비교 현황', '전략별 상세 비교', 'Key Takeaway'],
  'competitor-comparison': ['경쟁사 프로필', 'Gap 분석', 'Key Takeaway'],
  'final-implications': ['핵심 시사점', '액션 아이템', '실행 로드맵', '결론'],
};

/** 48-page mode: report cover + (cover + content pages) × 12 + closing */
export function generateExpandedPages(): PageDef[] {
  const pages: PageDef[] = [];
  let pageNum = 1;

  // Report cover
  pages.push({
    kind: 'report-cover',
    sectionIndex: -1,
    sectionTitle: '',
    subPage: -1,
    pageTitle: 'Report Cover',
    pageNumber: pageNum++,
  });

  // Section pages
  SECTION_ORDER.forEach((type, sectionIndex) => {
    const sectionTitle = SECTION_TITLES[type];

    // Section cover
    pages.push({
      kind: 'section-cover',
      sectionIndex,
      sectionType: type,
      sectionTitle,
      subPage: -1,
      pageTitle: sectionTitle,
      pageNumber: pageNum++,
    });

    // Content sub-pages
    SUB_PAGE_TITLES[type].forEach((subTitle, subIdx) => {
      pages.push({
        kind: 'section-content',
        sectionIndex,
        sectionType: type,
        sectionTitle,
        subPage: subIdx,
        pageTitle: subTitle,
        pageNumber: pageNum++,
      });
    });
  });

  // Report closing
  pages.push({
    kind: 'report-closing',
    sectionIndex: -1,
    sectionTitle: '',
    subPage: -1,
    pageTitle: 'Closing',
    pageNumber: pageNum++,
  });

  return pages;
}

/** 12-page mode: one page per section */
export function generateCompactPages(): PageDef[] {
  return SECTION_ORDER.map((type, sectionIndex) => ({
    kind: 'section-content' as const,
    sectionIndex,
    sectionType: type,
    sectionTitle: SECTION_TITLES[type],
    subPage: -1, // -1 means "show all"
    pageTitle: SECTION_TITLES[type],
    pageNumber: sectionIndex + 1,
  }));
}

export function getSubPageCount(type: SectionType): number {
  return SUB_PAGE_TITLES[type].length;
}
