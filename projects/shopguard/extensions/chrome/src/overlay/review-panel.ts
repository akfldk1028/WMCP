import { createShadowContainer, injectStyles, h, gradeColor } from '../content/common.js';
import type { AnalysisResult } from '../types.js';

const PANEL_ID = 'shopguard-review-panel';

const CSS = `
:host {
  all: initial;
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 2147483646;
}
.panel {
  width: 320px;
  max-height: 500px;
  overflow-y: auto;
  background: #1a1a2e;
  color: #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
}
.header {
  padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.close {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}
.close:hover { color: #fff; }
.section {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  margin-bottom: 8px;
}
.grade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.grade-label { font-size: 13px; }
.grade-value {
  font-weight: 700;
  font-size: 16px;
}
.detail-item {
  padding: 4px 0;
  font-size: 12px;
  color: #aaa;
  line-height: 1.4;
}
.detail-item::before {
  content: '\\2022';
  margin-right: 6px;
  color: #666;
}
.pattern-item {
  padding: 6px 8px;
  margin: 4px 0;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  font-size: 12px;
}
.pattern-type {
  font-weight: 600;
  color: #f97316;
}
.pattern-risk {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}
`;

export function renderReviewPanel(result: AnalysisResult): void {
  const shadow = createShadowContainer(PANEL_ID);
  injectStyles(shadow, CSS);

  const panel = h('div', { class: 'panel' });

  // Header
  const closeBtn = h('button', { class: 'close' }, '\u00D7');
  const header = h('div', { class: 'header' },
    h('h3', {}, 'ShopGuard Analysis'),
    closeBtn,
  );
  closeBtn.addEventListener('click', () => {
    const host = shadow.host as HTMLElement;
    host.style.display = 'none';
  });
  panel.appendChild(header);

  // Review Section
  const reviewSection = h('div', { class: 'section' },
    h('div', { class: 'section-title' }, 'Review Analysis'),
    h('div', { class: 'grade-row' },
      h('span', { class: 'grade-label' }, `${result.review.totalReviews} reviews analyzed`),
      h('span', {
        class: 'grade-value',
        style: `color: ${gradeColor(result.review.grade)}`,
      }, result.review.grade),
    ),
  );
  for (const detail of result.review.details.slice(0, 5)) {
    reviewSection.appendChild(h('div', { class: 'detail-item' }, detail));
  }
  panel.appendChild(reviewSection);

  // Price Section
  const priceSection = h('div', { class: 'section' },
    h('div', { class: 'section-title' }, 'Price Analysis'),
    h('div', { class: 'grade-row' },
      h('span', { class: 'grade-label' }, `Trust Score: ${result.price.trustScore}`),
      h('span', {
        class: 'grade-value',
        style: `color: ${gradeColor(result.price.grade)}`,
      }, result.price.grade),
    ),
  );
  for (const issue of result.price.issues.slice(0, 3)) {
    priceSection.appendChild(
      h('div', { class: 'detail-item' }, issue.description),
    );
  }
  panel.appendChild(priceSection);

  // Dark Pattern Section
  if (result.darkPattern.patterns.length > 0) {
    const dpSection = h('div', { class: 'section' },
      h('div', { class: 'section-title' }, 'Dark Patterns'),
    );
    for (const p of result.darkPattern.patterns.slice(0, 5)) {
      const riskColors: Record<string, string> = {
        critical: '#dc2626', high: '#ef4444', medium: '#f97316', low: '#eab308',
      };
      dpSection.appendChild(
        h('div', { class: 'pattern-item' },
          h('span', { class: 'pattern-type' }, p.type),
          h('span', {
            class: 'pattern-risk',
            style: `background: ${riskColors[p.risk] ?? '#6b7280'}; color: #fff`,
          }, p.risk),
          h('div', { style: 'margin-top: 4px; color: #aaa' }, p.explanation),
        ),
      );
    }
    panel.appendChild(dpSection);
  }

  // Overall
  const overallSection = h('div', { class: 'section' },
    h('div', { class: 'grade-row' },
      h('span', { class: 'grade-label', style: 'font-weight: 600' }, 'Overall'),
      h('span', {
        class: 'grade-value',
        style: `color: ${gradeColor(result.overall.grade)}; font-size: 24px`,
      }, `${result.overall.grade} (${result.overall.score})`),
    ),
    h('div', { class: 'detail-item', style: 'color: #ccc' }, result.overall.summary),
  );
  panel.appendChild(overallSection);

  shadow.appendChild(panel);
}
