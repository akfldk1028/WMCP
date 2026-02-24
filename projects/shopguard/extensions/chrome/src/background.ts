import { runAgentPipeline, runLocalPipeline } from './agent/pipeline.js';
import { validateApiKey } from './agent/client.js';
import type {
  Message,
  PageSnapshot,
  AnalysisResult,
  AgentSuspiciousPattern,
  PageType,
  AgentErrorCode,
} from './types.js';

const GRADE_ORDER: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };

interface TabState {
  analyzing: boolean;
  pageType: PageType | null;
  lastAnalysis: AnalysisResult | null;
  agentNotes?: string;
  suspiciousPatterns?: AgentSuspiciousPattern[];
  error?: string;
  errorCode?: AgentErrorCode;
}

// In-memory cache (fast access during active analysis)
const tabCache = new Map<number, TabState>();

const DEFAULT_STATE: TabState = { analyzing: false, pageType: null, lastAnalysis: null };

/** Get tab state from memory cache, falling back to chrome.storage.session */
async function getTabState(tabId: number): Promise<TabState> {
  const cached = tabCache.get(tabId);
  if (cached) return cached;

  const key = `tab_${tabId}`;
  const result = await chrome.storage.session.get(key);
  const state: TabState = result[key] ?? { ...DEFAULT_STATE };
  tabCache.set(tabId, state);
  return state;
}

/** Persist tab state to chrome.storage.session (survives SW restarts) */
async function saveTabState(tabId: number, state: TabState): Promise<void> {
  tabCache.set(tabId, state);
  await chrome.storage.session.set({ [`tab_${tabId}`]: state });
}

/** Get stored settings */
async function getSettings(): Promise<{ apiKey: string; model: string }> {
  const result = await chrome.storage.local.get(['apiKey', 'model']);
  return {
    apiKey: result.apiKey ?? '',
    model: result.model ?? 'claude-sonnet-4-5-20250929',
  };
}

/** Track usage */
async function trackUsage(tokens?: number): Promise<void> {
  const result = await chrome.storage.local.get(['analysisCount', 'totalTokens']);
  const count = (result.analysisCount ?? 0) + 1;
  const total = (result.totalTokens ?? 0) + (tokens ?? 0);
  await chrome.storage.local.set({ analysisCount: count, totalTokens: total });
}

/** Run the full analysis pipeline for a tab */
async function analyzeTab(tabId: number, snapshot: PageSnapshot): Promise<void> {
  const state = await getTabState(tabId);
  state.analyzing = true;
  state.error = undefined;
  state.errorCode = undefined;
  await saveTabState(tabId, state);

  // Notify content script that analysis started
  chrome.tabs.sendMessage(tabId, { type: 'ANALYSIS_STARTED' as const }).catch(() => {});

  const { apiKey, model } = await getSettings();

  // Free mode: local heuristic analysis (no API key needed)
  // LLM mode: AI-enhanced analysis (requires Anthropic API key)
  let result;
  if (!apiKey) {
    result = runLocalPipeline(snapshot);
  } else {
    result = await runAgentPipeline(snapshot, apiKey, model);
  }

  state.analyzing = false;

  if (!result.success) {
    state.error = result.error;
    state.errorCode = result.errorCode;
    await saveTabState(tabId, state);
    chrome.tabs.sendMessage(tabId, {
      type: 'ANALYSIS_ERROR' as const,
      error: result.error,
      errorCode: result.errorCode,
    }).catch(() => {});
    return;
  }

  state.pageType = result.pageType;
  state.agentNotes = result.agentNotes;
  state.suspiciousPatterns = result.suspiciousPatterns;

  if (result.analysis) {
    state.lastAnalysis = result.analysis;
    await saveTabState(tabId, state);

    // Send result to content script for overlay rendering
    chrome.tabs.sendMessage(tabId, {
      type: 'ANALYSIS_RESULT' as const,
      data: result.analysis,
      agentNotes: result.agentNotes,
      suspiciousPatterns: result.suspiciousPatterns,
    }).catch(() => {});

    // Update badge
    const rank = GRADE_ORDER[result.analysis.overall.grade] ?? 6;
    const color = rank <= 2 ? '#22c55e' : rank <= 4 ? '#eab308' : '#ef4444';
    chrome.action.setBadgeText({ text: result.analysis.overall.grade, tabId });
    chrome.action.setBadgeBackgroundColor({ color, tabId });
  } else {
    // Non-commercial page
    state.lastAnalysis = null;
    await saveTabState(tabId, state);
    chrome.action.setBadgeText({ text: '', tabId });
  }

  await trackUsage();
}

// Listen for messages
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    const tabId = sender.tab?.id;

    if (message.type === 'PAGE_SNAPSHOT' && tabId) {
      // Content script sent a snapshot — run analysis
      analyzeTab(tabId, message.data).catch(console.error);
      return false;
    }

    if (message.type === 'TRIGGER_ANALYSIS') {
      // Popup or command requests analysis on active tab
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeTabId = tabs[0]?.id;
        if (!activeTabId) return;

        // Inject content script programmatically (no <all_urls> needed)
        try {
          await chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ['dist/content.js'],
          });
        } catch {
          // Already injected or restricted page (chrome://, etc.)
        }

        // Ask content script to capture the page
        chrome.tabs.sendMessage(activeTabId, {
          type: 'CAPTURE_PAGE' as const,
        }).catch(() => {});
      });
      return false;
    }

    // Settings page requests API key validation (delegated here for CORS exemption)
    if ((message as { type: string }).type === 'VALIDATE_API_KEY') {
      const apiKey = (message as { apiKey?: string }).apiKey ?? '';
      validateApiKey(apiKey)
        .then((valid) => sendResponse({ valid }))
        .catch(() => sendResponse({ valid: false }));
      return true; // async response
    }

    if (message.type === 'GET_STATUS') {
      const queryTabId = message.tabId ?? tabId;
      if (!queryTabId) {
        sendResponse({
          type: 'STATUS_RESPONSE',
          data: { hasApiKey: false, analyzing: false, pageType: null, lastAnalysis: null },
        });
        return true;
      }

      getSettings().then(async ({ apiKey }) => {
        const state = await getTabState(queryTabId);
        sendResponse({
          type: 'STATUS_RESPONSE',
          data: {
            hasApiKey: !!apiKey,
            analyzing: state.analyzing,
            pageType: state.pageType,
            lastAnalysis: state.lastAnalysis,
            agentNotes: state.agentNotes,
            suspiciousPatterns: state.suspiciousPatterns,
            error: state.error,
            errorCode: state.errorCode,
          },
        });
      });
      return true; // async response
    }

    return false;
  },
);

// Keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
  if (command === 'analyze-page') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      chrome.tabs.sendMessage(tabId, {
        type: 'CAPTURE_PAGE' as const,
      }).catch(() => {});
    });
  }
});

// Clean up when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  tabCache.delete(tabId);
  chrome.storage.session.remove(`tab_${tabId}`);
});
