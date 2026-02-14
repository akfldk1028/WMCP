import type { Message, AnalysisResult } from '../types.js';
import { capturePageSnapshot } from './capture.js';
import { renderTrustBadge } from '../overlay/trust-badge.js';
import { renderReviewPanel } from '../overlay/review-panel.js';
import { renderPriceAlert } from '../overlay/price-alert.js';

(function shopguardContent() {
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
      // Could show a loading indicator on page if desired
    }

    if (message.type === 'ANALYSIS_RESULT') {
      renderOverlays(message.data);
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
