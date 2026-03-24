const BIZSCOPE_POPUP_URL = 'https://bizscope-rho.vercel.app';

let currentMode: 'company' | 'idea' = 'company';

// DOM elements
const companyMode = document.getElementById('companyMode')!;
const ideaMode = document.getElementById('ideaMode')!;
const companyInput = document.getElementById('companyInput') as HTMLInputElement;
const ideaInput = document.getElementById('ideaInput') as HTMLInputElement;
const ideaDescInput = document.getElementById('ideaDescInput') as HTMLTextAreaElement;
const analyzeCompanyBtn = document.getElementById('analyzeCompanyBtn') as HTMLButtonElement;
const analyzeIdeaBtn = document.getElementById('analyzeIdeaBtn') as HTMLButtonElement;
const licenseStatus = document.getElementById('licenseStatus')!;

// Tab switching
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const mode = (tab as HTMLElement).dataset.mode as 'company' | 'idea';
    currentMode = mode;
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    companyMode.classList.toggle('hidden', mode !== 'company');
    ideaMode.classList.toggle('hidden', mode !== 'idea');
    if (mode === 'company') companyInput.focus();
    else ideaInput.focus();
  });
});

// Analyze company
analyzeCompanyBtn.addEventListener('click', () => {
  const name = companyInput.value.trim();
  if (!name) { companyInput.focus(); return; }
  chrome.runtime.sendMessage({ type: 'OPEN_BIZSCOPE', mode: 'company', query: name });
  window.close();
});

// Analyze idea
analyzeIdeaBtn.addEventListener('click', () => {
  const name = ideaInput.value.trim();
  if (!name) { ideaInput.focus(); return; }
  chrome.runtime.sendMessage({
    type: 'OPEN_BIZSCOPE',
    mode: 'idea',
    query: name,
    ideaDesc: ideaDescInput.value.trim() || undefined,
  });
  window.close();
});

// Enter key submits
companyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') analyzeCompanyBtn.click();
});
ideaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') analyzeIdeaBtn.click();
});

// Open web app
document.getElementById('openWebBtn')!.addEventListener('click', () => {
  chrome.tabs.create({ url: `${BIZSCOPE_POPUP_URL}/report/new` });
  window.close();
});

// History
document.getElementById('historyBtn')!.addEventListener('click', () => {
  chrome.tabs.create({ url: `${BIZSCOPE_POPUP_URL}/history` });
  window.close();
});

// Settings
document.getElementById('settingsLink')!.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Load license status
async function loadLicenseStatus() {
  const result = await chrome.storage.local.get(['licenseKey', 'licensePlan', 'licenseCredits']);
  const key = result.licenseKey as string | undefined;

  if (!key) {
    licenseStatus.innerHTML = '<span class="license-badge license-free">Free (2건 제한)</span>';
    return;
  }

  const plan = (result.licensePlan as string) ?? 'unknown';
  const credits = result.licenseCredits as number | undefined;

  if (plan === 'pro' || plan === 'pro_monthly' || plan === 'pro_annual') {
    licenseStatus.innerHTML = '<span class="license-badge license-pro">Pro 무제한</span>';
  } else if (credits !== undefined) {
    licenseStatus.innerHTML = `<span class="license-badge license-credits">크레딧 ${credits}건</span>`;
  } else {
    licenseStatus.innerHTML = '<span class="license-badge license-pro">라이선스 활성</span>';
  }
}

loadLicenseStatus();
