const licenseKeyInput = document.getElementById('licenseKeyInput') as HTMLInputElement;
const serverUrlInput = document.getElementById('serverUrlInput') as HTMLInputElement;
const saveLicenseBtn = document.getElementById('saveLicenseBtn') as HTMLButtonElement;
const removeLicenseBtn = document.getElementById('removeLicenseBtn') as HTMLButtonElement;
const saveUrlBtn = document.getElementById('saveUrlBtn') as HTMLButtonElement;
const licenseStatusMsg = document.getElementById('licenseStatusMsg')!;
const statsEl = document.getElementById('stats')!;

// Load saved settings
chrome.storage.local.get(
  ['licenseKey', 'bizscopeUrl', 'analysisCount', 'licensePlan', 'licenseCredits'],
  (result) => {
    if (result.licenseKey) licenseKeyInput.value = result.licenseKey;
    serverUrlInput.value = result.bizscopeUrl || 'https://bizscope-rho.vercel.app';
    updateStats(result.analysisCount ?? 0);
    if (result.licensePlan) {
      showStatus('valid', `${result.licensePlan} 활성`);
    }
  },
);

// Save & validate license
saveLicenseBtn.addEventListener('click', async () => {
  const key = licenseKeyInput.value.trim();
  if (!key) { licenseKeyInput.focus(); return; }

  saveLicenseBtn.disabled = true;
  showStatus('checking', '검증 중...');

  chrome.runtime.sendMessage(
    { type: 'CHECK_LICENSE', licenseKey: key },
    (response) => {
      saveLicenseBtn.disabled = false;
      if (response?.valid) {
        chrome.storage.local.set({
          licenseKey: key,
          licensePlan: response.plan ?? 'active',
          licenseCredits: response.credits,
        });
        showStatus('valid', `${response.plan ?? '라이선스'} 활성 (크레딧: ${response.credits ?? '무제한'})`);
      } else {
        showStatus('invalid', '유효하지 않은 라이선스 키');
      }
    },
  );
});

// Remove license
removeLicenseBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['licenseKey', 'licensePlan', 'licenseCredits']);
  licenseKeyInput.value = '';
  licenseStatusMsg.innerHTML = '';
});

// Save server URL
saveUrlBtn.addEventListener('click', () => {
  const url = serverUrlInput.value.trim().replace(/\/$/, '');
  chrome.storage.local.set({ bizscopeUrl: url || 'https://bizscope-rho.vercel.app' });
  saveUrlBtn.textContent = '저장됨';
  setTimeout(() => { saveUrlBtn.textContent = '저장'; }, 1500);
});

// Reset stats
document.getElementById('resetStatsBtn')!.addEventListener('click', () => {
  chrome.storage.local.set({ analysisCount: 0 });
  updateStats(0);
});

function showStatus(type: 'valid' | 'invalid' | 'checking', text: string) {
  licenseStatusMsg.innerHTML = `<div class="status status-${type}">${text}</div>`;
}

function updateStats(count: number) {
  statsEl.textContent = `총 분석 횟수: ${count}건`;
}
