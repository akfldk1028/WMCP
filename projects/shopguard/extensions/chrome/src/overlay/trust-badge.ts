import { createShadowContainer, injectStyles, h, gradeColor } from '../content/common.js';
import type { AnalysisResult } from '../types.js';

const BADGE_ID = 'shopguard-trust-badge';

const CSS = `
:host {
  all: initial;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483647;
}
.badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  background: #1a1a2e;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.15s ease;
  user-select: none;
}
.badge:hover {
  transform: scale(1.05);
}
.grade {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  min-width: 28px;
  text-align: center;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.title {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.score {
  font-size: 13px;
  font-weight: 500;
}
`;

export function renderTrustBadge(result: AnalysisResult): void {
  const shadow = createShadowContainer(BADGE_ID);
  injectStyles(shadow, CSS);

  const color = gradeColor(result.overall.grade);

  const badge = h('div', { class: 'badge' },
    h('div', { class: 'grade', style: `color: ${color}` }, result.overall.grade),
    h('div', { class: 'info' },
      h('div', { class: 'title' }, 'ShopGuard'),
      h('div', { class: 'score' }, `Trust: ${result.overall.score}/100`),
    ),
  );

  badge.addEventListener('click', () => {
    // Toggle the review panel host element visibility
    const panelHost = document.getElementById('shopguard-review-panel');
    if (panelHost) {
      const isHidden = panelHost.style.display === 'none';
      panelHost.style.display = isHidden ? '' : 'none';
    }
  });

  shadow.appendChild(badge);
}
