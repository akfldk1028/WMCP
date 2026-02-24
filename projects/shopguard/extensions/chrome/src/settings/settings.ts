const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const modelSelect = document.getElementById('model') as HTMLSelectElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const analysisCountEl = document.getElementById('analysisCount') as HTMLDivElement;
const totalTokensEl = document.getElementById('totalTokens') as HTMLDivElement;
const licenseKeyInput = document.getElementById('licenseKey') as HTMLInputElement;
const activateBtn = document.getElementById('activateBtn') as HTMLButtonElement;
const licenseStatusEl = document.getElementById('licenseStatus') as HTMLDivElement;

function showStatus(msg: string, type: 'success' | 'error' | 'loading') {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function showLicenseStatus(active: boolean) {
  licenseStatusEl.textContent = active ? 'Pro license active' : 'No license activated';
  licenseStatusEl.className = `license-status ${active ? 'active' : 'inactive'}`;
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

/** Validate license key via background service worker */
async function validateLicenseKey(licenseKey: string): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'VALIDATE_LICENSE', licenseKey },
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
chrome.storage.local.get(['apiKey', 'model', 'analysisCount', 'totalTokens', 'licenseKey'], (result) => {
  if (result.apiKey) {
    apiKeyInput.value = result.apiKey;
  }
  if (result.model) {
    modelSelect.value = result.model;
  }
  analysisCountEl.textContent = String(result.analysisCount ?? 0);
  totalTokensEl.textContent = String(result.totalTokens ?? 0);
  if (result.licenseKey) {
    licenseKeyInput.value = result.licenseKey;
    showLicenseStatus(true);
  }
});

// Save handler (API key)
saveBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  const model = modelSelect.value;

  // No key = free mode (perfectly fine)
  if (!key) {
    await chrome.storage.local.set({ apiKey: '', model });
    showStatus('Free mode active. Server proxy enabled (5/day AI).', 'success');
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
    showStatus('API key verified! Direct AI mode active.', 'success');
  } else {
    showStatus('Invalid API key. Please check and try again.', 'error');
  }

  saveBtn.disabled = false;
});

// Activate license handler
activateBtn.addEventListener('click', async () => {
  const licenseKey = licenseKeyInput.value.trim();
  if (!licenseKey) {
    showLicenseStatus(false);
    return;
  }

  activateBtn.disabled = true;
  licenseStatusEl.textContent = 'Validating...';
  licenseStatusEl.className = 'license-status inactive';

  const valid = await validateLicenseKey(licenseKey);

  if (valid) {
    await chrome.storage.local.set({ licenseKey });
    showLicenseStatus(true);
  } else {
    licenseStatusEl.textContent = 'Invalid license key';
    licenseStatusEl.className = 'license-status inactive';
    await chrome.storage.local.remove('licenseKey');
  }

  activateBtn.disabled = false;
});
