/**
 * FormBridge Popup Script
 *
 * Controls the extension popup UI: loads and saves configuration,
 * queries the active tab for form statistics, and renders detected
 * form information.
 *
 * Wrapped in an IIFE -- Chrome extension popups do not support ES
 * module imports when loaded from local files.
 */

(function formBridgePopup() {
  // ---------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------

  interface FormBridgeConfig {
    enabled: boolean;
    autoDetect: boolean;
    excludePatterns: string[];
    customMappings: Record<string, { toolname: string; tooldescription: string }>;
  }

  interface TabStats {
    url: string;
    formsDetected: number;
    formsEnhanced: number;
    timestamp: number;
  }

  // ---------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------

  const DEFAULT_CONFIG: FormBridgeConfig = {
    enabled: true,
    autoDetect: true,
    excludePatterns: [],
    customMappings: {},
  };

  // ---------------------------------------------------------------
  // DOM references
  // ---------------------------------------------------------------

  const enabledToggle = document.getElementById('toggle-enabled') as HTMLInputElement;
  const autoDetectToggle = document.getElementById('toggle-autodetect') as HTMLInputElement;
  const statsDetected = document.getElementById('stats-detected') as HTMLElement;
  const statsEnhanced = document.getElementById('stats-enhanced') as HTMLElement;
  const formsList = document.getElementById('forms-list') as HTMLElement;
  const statusDot = document.getElementById('status-dot') as HTMLElement;
  const statusLabel = document.getElementById('status-label') as HTMLElement;

  // ---------------------------------------------------------------
  // Config persistence
  // ---------------------------------------------------------------

  function loadConfig(callback: (config: FormBridgeConfig) => void): void {
    chrome.storage.sync.get('formBridgeConfig', (result) => {
      if (chrome.runtime.lastError) {
        callback(DEFAULT_CONFIG);
        return;
      }
      const stored = result?.formBridgeConfig;
      if (stored && typeof stored === 'object') {
        callback({ ...DEFAULT_CONFIG, ...stored });
      } else {
        callback(DEFAULT_CONFIG);
      }
    });
  }

  function saveConfig(config: FormBridgeConfig): void {
    chrome.storage.sync.set({ formBridgeConfig: config });
  }

  // ---------------------------------------------------------------
  // Stats & rendering
  // ---------------------------------------------------------------

  function updateStatus(enabled: boolean): void {
    if (statusDot) {
      statusDot.style.backgroundColor = enabled ? '#22c55e' : '#94a3b8';
    }
    if (statusLabel) {
      statusLabel.textContent = enabled ? 'Active' : 'Disabled';
    }
  }

  function renderStats(stats: TabStats | null): void {
    if (!stats) {
      statsDetected.textContent = '0';
      statsEnhanced.textContent = '0';
      renderFormsList(0);
      return;
    }
    statsDetected.textContent = String(stats.formsDetected);
    statsEnhanced.textContent = String(stats.formsEnhanced);
    renderFormsList(stats.formsEnhanced);
  }

  function renderFormsList(count: number): void {
    if (!formsList) return;

    if (count === 0) {
      formsList.innerHTML =
        '<div class="empty-state">No forms enhanced on this page.</div>';
      return;
    }

    // We don't have individual form details from the background script,
    // so query the content script for the full list.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;

      chrome.tabs.sendMessage(
        tab.id,
        { type: 'GET_FORM_DETAILS' },
        (response: Array<{ toolname: string; tooldescription: string; fieldCount: number }> | undefined) => {
          if (chrome.runtime.lastError || !response || !Array.isArray(response)) {
            // Fallback: just show count
            formsList.innerHTML = `<div class="form-item"><span class="form-name">${count} form${count !== 1 ? 's' : ''} enhanced</span></div>`;
            return;
          }

          formsList.innerHTML = response
            .map(
              (f) => `
              <div class="form-item">
                <span class="form-name" title="${escapeAttr(f.tooldescription)}">${escapeHtml(f.toolname)}</span>
                <span class="form-fields">${f.fieldCount} field${f.fieldCount !== 1 ? 's' : ''}</span>
              </div>`,
            )
            .join('');
        },
      );
    });
  }

  function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------

  function init(): void {
    loadConfig((config) => {
      // Set toggle states
      enabledToggle.checked = config.enabled;
      autoDetectToggle.checked = config.autoDetect;
      updateStatus(config.enabled);

      // Wire up toggles
      enabledToggle.addEventListener('change', () => {
        config.enabled = enabledToggle.checked;
        updateStatus(config.enabled);
        saveConfig(config);
      });

      autoDetectToggle.addEventListener('change', () => {
        config.autoDetect = autoDetectToggle.checked;
        saveConfig(config);
      });

      // Load stats for the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.id) {
          renderStats(null);
          return;
        }

        chrome.runtime.sendMessage(
          { type: 'GET_STATS', tabId: tab.id },
          (stats: TabStats | null) => {
            if (chrome.runtime.lastError) {
              renderStats(null);
              return;
            }
            renderStats(stats);
          },
        );
      });
    });
  }

  // Run when the DOM is ready (popup.html loads this at the end of <body>)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
