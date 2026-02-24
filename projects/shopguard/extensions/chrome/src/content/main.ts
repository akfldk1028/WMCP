import type { Message, AnalysisResult } from '../types.js';
import { capturePageSnapshot } from './capture.js';
import { renderTrustBadge } from '../overlay/trust-badge.js';
import { renderReviewPanel } from '../overlay/review-panel.js';
import { renderPriceAlert } from '../overlay/price-alert.js';
import { isShoppingSite } from './shopping-detector.js';
import { renderFloatingButton } from '../overlay/floating-button.js';

(function shopguardContent() {
  let floatingBtn: ReturnType<typeof renderFloatingButton> | null = null;

  // Auto-detect shopping sites and show floating button
  if (isShoppingSite()) {
    floatingBtn = renderFloatingButton(() => {
      floatingBtn?.setState('analyzing');
      const snapshot = capturePageSnapshot();
      chrome.runtime.sendMessage({
        type: 'PAGE_SNAPSHOT' as const,
        data: snapshot,
      }).catch(() => {});
    });
  }

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type === 'CAPTURE_PAGE') {
      // Background requests a page snapshot
      const snapshot = capturePageSnapshot();
      chrome.runtime.sendMessage({
        type: 'PAGE_SNAPSHOT' as const,
        data: snapshot,
      }).catch(() => { /* background SW may be suspended */ });
    }

    if (message.type === 'ANALYSIS_STARTED') {
      floatingBtn?.setState('analyzing');
    }

    if (message.type === 'ANALYSIS_RESULT') {
      const grade = message.data.overall.grade;
      floatingBtn?.setState('result', grade);
      renderOverlays(message.data);
    }

    if (message.type === 'ANALYSIS_ERROR') {
      floatingBtn?.setState('idle');
    }
  });

  function renderOverlays(result: AnalysisResult) {
    renderTrustBadge(result);
    if (result.review.totalReviews > 0) {
      renderReviewPanel(result);
    }
    if (result.price.issues.length > 0) {
      renderPriceAlert(result);
    }
  }
})();
