import type { Message, AnalysisResult } from '../types.js';
import { capturePageSnapshot } from './capture.js';
import { renderTrustBadge } from '../overlay/trust-badge.js';
import { renderReviewPanel } from '../overlay/review-panel.js';
import { renderPriceAlert } from '../overlay/price-alert.js';
import { isShoppingSite } from './shopping-detector.js';
import { renderFloatingButton } from '../overlay/floating-button.js';

(function shopguardContent() {
  let floatingBtn: ReturnType<typeof renderFloatingButton> | null = null;
  let lastAnalyzedUrl = '';

  function triggerAnalysis() {
    const url = document.location.href;
    if (url === lastAnalyzedUrl) return;
    lastAnalyzedUrl = url;

    floatingBtn?.setState('analyzing');
    const snapshot = capturePageSnapshot();
    chrome.runtime.sendMessage({
      type: 'PAGE_SNAPSHOT' as const,
      data: snapshot,
    }).catch(() => {});
  }

  // Auto-detect shopping sites and show floating button
  if (isShoppingSite()) {
    floatingBtn = renderFloatingButton(() => {
      // Manual click: force re-analyze
      lastAnalyzedUrl = '';
      triggerAnalysis();
    });

    // Auto-analyze after page settles (2.5s for DOM to stabilize)
    setTimeout(triggerAnalysis, 2500);

    // Watch for SPA navigation (Amazon, Coupang use client-side routing)
    let currentUrl = document.location.href;
    setInterval(() => {
      if (document.location.href !== currentUrl) {
        currentUrl = document.location.href;
        // Wait for new page content to load
        setTimeout(triggerAnalysis, 1500);
      }
    }, 1000);
  }

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type === 'CAPTURE_PAGE') {
      // Triggered from popup or keyboard shortcut — force re-analyze
      lastAnalyzedUrl = '';
      triggerAnalysis();
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
