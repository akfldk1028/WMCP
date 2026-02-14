import type { AnalysisResult, AgentSuspiciousPattern } from '../types.js';

const contentEl = document.getElementById('content')!;
const settingsLink = document.getElementById('settingsLink')!;

const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e', B: '#84cc16', C: '#eab308',
  D: '#f97316', E: '#ef4444', F: '#dc2626',
};

function gradeColor(grade: string): string {
  return GRADE_COLORS[grade] ?? '#6b7280';
}

function el(tag: string, attrs: Record<string, string> = {}, text = ''): HTMLElement {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text) e.textContent = text;
  return e;
}

// ── State Renderers ──

function renderNoApiKey() {
  contentEl.textContent = '';
  const wrap = el('div', { class: 'center-block' });
  wrap.appendChild(el('div', { class: 'icon' }, '\u{1F511}'));
  wrap.appendChild(el('p', {}, 'API key required'));
  const btn = el('button', { class: 'btn btn-primary' }, 'Open Settings');
  btn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  wrap.appendChild(btn);
  contentEl.appendChild(wrap);
}

function renderReady() {
  contentEl.textContent = '';
  const wrap = el('div', { class: 'center-block' });
  wrap.appendChild(el('div', { class: 'icon' }, '\u{1F6E1}'));
  wrap.appendChild(el('p', {}, 'Ready to analyze'));
  const btn = el('button', { class: 'btn btn-primary' }, 'Analyze This Page');
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_ANALYSIS' });
    renderAnalyzing();
  });
  wrap.appendChild(btn);
  contentEl.appendChild(wrap);
}

function renderAnalyzing() {
  contentEl.textContent = '';
  const wrap = el('div', { class: 'center-block' });
  wrap.appendChild(el('div', { class: 'spinner' }));
  wrap.appendChild(el('p', {}, 'Analyzing page...'));
  wrap.appendChild(el('p', { style: 'font-size: 11px; color: #555' }, 'AI is reading the page'));
  contentEl.appendChild(wrap);
}

function renderNonCommercial() {
  contentEl.textContent = '';
  const wrap = el('div', { class: 'center-block' });
  wrap.appendChild(el('div', { class: 'icon' }, '\u{2705}'));
  wrap.appendChild(el('p', {}, 'Not a shopping page'));
  wrap.appendChild(el('p', { style: 'font-size: 11px; color: #555' }, 'No commercial content detected'));
  contentEl.appendChild(wrap);
}

function renderError(error: string, errorCode?: string) {
  contentEl.textContent = '';
  const wrap = el('div', { class: 'center-block' });
  wrap.appendChild(el('div', { class: 'icon' }, '\u{26A0}'));
  wrap.appendChild(el('p', { class: 'error-text' }, error));

  if (errorCode === 'auth') {
    const btn = el('button', { class: 'btn btn-primary btn-sm' }, 'Open Settings');
    btn.addEventListener('click', () => chrome.runtime.openOptionsPage());
    wrap.appendChild(btn);
  } else {
    const btn = el('button', { class: 'btn btn-secondary btn-sm' }, 'Retry');
    btn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'TRIGGER_ANALYSIS' });
      renderAnalyzing();
    });
    wrap.appendChild(btn);
  }
  contentEl.appendChild(wrap);
}

function renderResult(
  result: AnalysisResult,
  agentNotes?: string,
  suspiciousPatterns?: AgentSuspiciousPattern[],
) {
  contentEl.textContent = '';
  const color = gradeColor(result.overall.grade);

  const circle = el('div', {
    class: 'grade-circle',
    style: `border: 3px solid ${color}; color: ${color}`,
  }, result.overall.grade);
  contentEl.appendChild(circle);

  const rows: [string, string, string][] = [
    ['Overall Trust', `${result.overall.score}/100`, color],
    [`Reviews (${result.review.totalReviews})`, `${result.review.grade} (${result.review.overallScore})`, gradeColor(result.review.grade)],
    ['Price', `${result.price.grade} (${result.price.trustScore})`, gradeColor(result.price.grade)],
    ['Dark Patterns', `${result.darkPattern.grade} (${result.darkPattern.riskScore})`, gradeColor(result.darkPattern.grade)],
  ];

  for (const [label, value, valueColor] of rows) {
    const row = el('div', { class: 'score-row' });
    row.appendChild(el('span', { class: 'score-label' }, label));
    row.appendChild(el('span', { class: 'score-value', style: `color: ${valueColor}` }, value));
    contentEl.appendChild(row);
  }

  // LLM suspicious patterns
  if (suspiciousPatterns && suspiciousPatterns.length > 0) {
    for (const p of suspiciousPatterns) {
      const sevColor = p.severity === 'critical' ? '#ef4444'
        : p.severity === 'high' ? '#f97316'
        : p.severity === 'medium' ? '#eab308' : '#6b7280';
      const row = el('div', { class: 'score-row' });
      row.appendChild(el('span', { class: 'score-label' }, p.type));
      row.appendChild(el('span', { class: 'score-value', style: `color: ${sevColor}` }, p.severity));
      contentEl.appendChild(row);
    }
  }

  const summary = el('div', { class: 'summary' }, result.overall.summary);
  contentEl.appendChild(summary);

  // Agent notes
  if (agentNotes) {
    const notes = el('div', { class: 'agent-notes' }, agentNotes);
    contentEl.appendChild(notes);
  }

  // Re-analyze button
  const reBtn = el('button', {
    class: 'btn btn-secondary btn-sm',
    style: 'margin-top: 12px; display: block; width: 100%;',
  }, 'Re-analyze');
  reBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_ANALYSIS' });
    renderAnalyzing();
  });
  contentEl.appendChild(reBtn);
}

// ── Settings link ──

settingsLink.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ── Initial load ──

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab?.id) {
    renderReady();
    return;
  }

  chrome.runtime.sendMessage(
    { type: 'GET_STATUS', tabId: tab.id },
    (response) => {
      if (chrome.runtime.lastError || !response?.data) {
        renderReady();
        return;
      }

      const data = response.data;

      if (!data.hasApiKey) {
        renderNoApiKey();
        return;
      }

      if (data.analyzing) {
        renderAnalyzing();
        return;
      }

      if (data.error) {
        renderError(data.error, data.errorCode);
        return;
      }

      if (data.pageType === 'non-commercial') {
        renderNonCommercial();
        return;
      }

      if (data.lastAnalysis) {
        renderResult(data.lastAnalysis, data.agentNotes, data.suspiciousPatterns);
        return;
      }

      renderReady();
    },
  );
});
