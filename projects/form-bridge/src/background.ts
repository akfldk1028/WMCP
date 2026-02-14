/**
 * FormBridge Background Service Worker
 *
 * Tracks per-tab statistics about detected and enhanced forms, and
 * updates the extension badge accordingly.
 */

interface TabStats {
  url: string;
  formsDetected: number;
  formsEnhanced: number;
  timestamp: number;
}

const tabStats = new Map<number, TabStats>();

// ---------------------------------------------------------------
// Message handling
// ---------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (
    message: Record<string, unknown>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    if (message.type === 'FORMS_DETECTED' && sender.tab?.id !== undefined) {
      const tabId = sender.tab.id;

      tabStats.set(tabId, {
        url: sender.tab.url || '',
        formsDetected: (message.formsDetected as number) || 0,
        formsEnhanced: (message.formsEnhanced as number) || 0,
        timestamp: Date.now(),
      });

      // Update the toolbar badge to show how many forms were enhanced
      const enhanced = (message.formsEnhanced as number) || 0;
      chrome.action.setBadgeText({
        text: enhanced > 0 ? String(enhanced) : '',
        tabId,
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#22c55e',
        tabId,
      });
    }

    if (message.type === 'GET_STATS') {
      const requestedTabId = message.tabId as number | undefined;
      if (requestedTabId !== undefined) {
        sendResponse(tabStats.get(requestedTabId) || null);
      } else {
        sendResponse(null);
      }
      // Return true to indicate we will respond asynchronously
      return true;
    }

    return undefined;
  },
);

// ---------------------------------------------------------------
// Clean up when tabs are closed
// ---------------------------------------------------------------

chrome.tabs.onRemoved.addListener((tabId: number) => {
  tabStats.delete(tabId);
});

// ---------------------------------------------------------------
// Reset stats when a tab navigates to a new page
// ---------------------------------------------------------------

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
  if (changeInfo.status === 'loading') {
    tabStats.delete(tabId);
    // Clear the badge while the page loads
    chrome.action.setBadgeText({ text: '', tabId });
  }
});
