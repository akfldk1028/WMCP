import { createShadowContainer, injectStyles, h } from '../content/common.js';
import type { AnalysisResult } from '../types.js';

const ALERT_ID = 'shopguard-price-alert';

const CSS = `
:host {
  all: initial;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483645;
}
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: linear-gradient(90deg, #7f1d1d, #991b1b);
  color: #fecaca;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.content {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon {
  font-size: 18px;
}
.text strong {
  color: #fff;
}
.dismiss {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fecaca;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.dismiss:hover {
  background: rgba(255,255,255,0.25);
}
`;

export function renderPriceAlert(result: AnalysisResult): void {
  if (result.price.issues.length === 0) return;

  const shadow = createShadowContainer(ALERT_ID);
  injectStyles(shadow, CSS);

  const issueCount = result.price.issues.length;
  const topIssue = result.price.issues[0];

  const dismissBtn = h('button', { class: 'dismiss' }, 'Dismiss');

  const banner = h('div', { class: 'banner' },
    h('div', { class: 'content' },
      h('span', { class: 'icon' }, '\u26A0'),
      h('div', { class: 'text' },
        h('strong', {}, `${issueCount} hidden fee${issueCount > 1 ? 's' : ''} detected`),
        document.createTextNode(` \u2014 ${topIssue.description}`),
      ),
    ),
    dismissBtn,
  );

  dismissBtn.addEventListener('click', () => {
    (shadow.host as HTMLElement).remove();
  });

  shadow.appendChild(banner);
}
