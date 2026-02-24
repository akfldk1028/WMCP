const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const modelSelect = document.getElementById('model') as HTMLSelectElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const analysisCountEl = document.getElementById('analysisCount') as HTMLDivElement;
const totalTokensEl = document.getElementById('totalTokens') as HTMLDivElement;

function showStatus(msg: string, type: 'success' | 'error' | 'loading') {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

/**
 * Validate API key via background service worker.
 * Options page doesn't have CORS exemption, so we delegate
 * the fetch to the background SW which does.
 */
async function validateKey(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'VALIDATE_API_KEY', apiKey: key },
      (response) => {
        if (chrome.runtime.lastError) {
          resolve(false);
          return;
        }
        resolve(response?.valid === true);
      },
    );
  });
}

// Load saved settings
chrome.storage.local.get(['apiKey', 'model', 'analysisCount', 'totalTokens'], (result) => {
  if (result.apiKey) {
    apiKeyInput.value = result.apiKey;
  }
  if (result.model) {
    modelSelect.value = result.model;
  }
  analysisCountEl.textContent = String(result.analysisCount ?? 0);
  totalTokensEl.textContent = String(result.totalTokens ?? 0);
});

// Save handler
saveBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  const model = modelSelect.value;

  // No key = free mode (perfectly fine)
  if (!key) {
    await chrome.storage.local.set({ apiKey: '', model });
    showStatus('Free mode active. Local analysis enabled.', 'success');
    return;
  }

  if (!key.startsWith('sk-ant-')) {
    showStatus('Invalid key format. Key should start with sk-ant-', 'error');
    return;
  }

  saveBtn.disabled = true;
  showStatus('Validating API key...', 'loading');

  const valid = await validateKey(key);

  if (valid) {
    await chrome.storage.local.set({ apiKey: key, model });
    showStatus('API key verified! AI Enhanced mode active.', 'success');
  } else {
    showStatus('Invalid API key. Please check and try again.', 'error');
  }

  saveBtn.disabled = false;
});
