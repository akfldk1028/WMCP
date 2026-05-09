import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalysisCanvas } from './AnalysisCanvas';
import type { SectionStatus } from './types';

const makeSections = (count: number, overrides?: Partial<SectionStatus>[]): SectionStatus[] =>
  Array.from({ length: count }, (_, i) => ({
    type: `section-${i}` as SectionStatus['type'],
    title: `Section ${i}`,
    status: 'pending' as const,
    data: null,
    ...overrides?.[i],
  }));

describe('AnalysisCanvas', () => {
  it('should render progress bar with 0/N', () => {
    const sections = makeSections(15);
    render(<AnalysisCanvas sections={sections} mode="idea" currentIndex={-1} />);
    expect(screen.getByText('0/15')).toBeTruthy();
  });

  it('should show completed count', () => {
    const sections = makeSections(4, [
      { type: 'company-overview', title: '기업 개요', status: 'completed', data: { type: 'company-overview' } as never },
      { type: 'business-model-detail', title: '사업모델', status: 'generating', data: null },
    ]);
    render(<AnalysisCanvas sections={sections} mode="company" currentIndex={1} />);
    expect(screen.getByText('1/4')).toBeTruthy();
  });

  it('should render section titles', () => {
    const sections: SectionStatus[] = [
      { type: 'idea-overview', title: '아이디어 개요', status: 'completed', data: null },
      { type: 'idea-target-customer', title: '타겟 고객', status: 'pending', data: null },
    ];
    render(<AnalysisCanvas sections={sections} mode="idea" currentIndex={0} />);
    expect(screen.getByText('아이디어 개요')).toBeTruthy();
    expect(screen.getByText('타겟 고객')).toBeTruthy();
  });

  it('should call onSectionClick for completed sections', () => {
    const onClick = vi.fn();
    const sections: SectionStatus[] = [
      { type: 'idea-overview', title: 'Overview', status: 'completed', data: { type: 'idea-overview' } as never },
      { type: 'idea-target-customer', title: 'Target', status: 'pending', data: null },
    ];
    render(<AnalysisCanvas sections={sections} mode="idea" currentIndex={-1} onSectionClick={onClick} />);

    // Click completed section
    fireEvent.click(screen.getByText('Overview'));
    expect(onClick).toHaveBeenCalledWith(0);
  });

  it('should not call onSectionClick for pending sections', () => {
    const onClick = vi.fn();
    const sections: SectionStatus[] = [
      { type: 'idea-overview', title: 'Overview', status: 'pending', data: null },
    ];
    render(<AnalysisCanvas sections={sections} mode="idea" currentIndex={-1} onSectionClick={onClick} />);

    fireEvent.click(screen.getByText('Overview'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should show error message for error sections', () => {
    const sections: SectionStatus[] = [
      { type: 'idea-overview', title: 'Overview', status: 'error', data: null, error: 'Network timeout' },
    ];
    render(<AnalysisCanvas sections={sections} mode="idea" currentIndex={-1} />);
    expect(screen.getByText('Network timeout')).toBeTruthy();
  });
});
