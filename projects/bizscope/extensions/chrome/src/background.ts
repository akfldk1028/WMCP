const BIZSCOPE_URL = 'https://bizscope-rho.vercel.app';

// Context menu: right-click selected text → analyze with BizScope
chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: 'bizscope-analyze-company',
    title: 'BizScope AI로 기업 분석: "%s"',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'bizscope-analyze-idea',
    title: 'BizScope AI로 아이디어 검증: "%s"',
    contexts: ['selection'],
  });

  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  const text = info.selectionText?.trim();
  if (!text) return;

  if (info.menuItemId === 'bizscope-analyze-company') {
    openBizScope('company', text);
  } else if (info.menuItemId === 'bizscope-analyze-idea') {
    openBizScope('idea', text);
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'quick-analyze') {
    chrome.tabs.create({ url: `${BIZSCOPE_URL}/report/new` });
  }
});

// Handle messages from popup/settings
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_BIZSCOPE') {
    openBizScope(message.mode, message.query, message.ideaDesc);
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === 'CHECK_LICENSE') {
    checkLicense(message.licenseKey)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ valid: false }));
    return true; // async response
  }

  if (message.type === 'GET_CONFIG') {
    chrome.storage.local.get(['licenseKey', 'bizscopeUrl'], (result) => {
      sendResponse({
        licenseKey: result.licenseKey ?? '',
        bizscopeUrl: result.bizscopeUrl ?? BIZSCOPE_URL,
      });
    });
    return true;
  }

  return false;
});

function openBizScope(mode: 'company' | 'idea', query: string, ideaDesc?: string) {
  const params = new URLSearchParams();
  params.set('mode', mode);
  if (mode === 'company') {
    params.set('company', query);
  } else {
    params.set('idea', query);
    if (ideaDesc) params.set('desc', ideaDesc);
  }
  params.set('autostart', '1');
  chrome.tabs.create({ url: `${BIZSCOPE_URL}/report/new?${params.toString()}` });
}

async function checkLicense(licenseKey: string): Promise<{ valid: boolean; plan?: string; credits?: number }> {
  const url = await getBizscopeUrl();
  const res = await fetch(`${url}/api/license/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey }),
  });
  if (!res.ok) return { valid: false };
  return res.json();
}

async function getBizscopeUrl(): Promise<string> {
  const result = await chrome.storage.local.get('bizscopeUrl');
  return result.bizscopeUrl ?? BIZSCOPE_URL;
}
