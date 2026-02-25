/** Floating shield button for shopping pages (Shadow DOM, bottom-right) */

import { createShadowContainer, injectStyles, h, gradeColor } from '../content/common.js';

const HOST_ID = 'shopguard-floating-btn';

type ButtonState = 'idle' | 'analyzing' | 'result';

interface FloatingButton {
  setState(state: ButtonState, grade?: string): void;
  remove(): void;
}

const CSS = `
  :host { all: initial; }
  .sg-fab {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #1a1a2e;
    border: 2px solid #6366f1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    transition: transform 0.2s, border-color 0.3s;
    z-index: 2147483647;
    user-select: none;
  }
  .sg-fab:hover { transform: scale(1.1); }
  .sg-fab.analyzing { border-color: #818cf8; }
  .sg-fab.result { font-size: 18px; font-weight: 700; font-family: system-ui, sans-serif; }
  @keyframes sg-spin {
    to { transform: rotate(360deg); }
  }
  .sg-spinner {
    width: 22px;
    height: 22px;
    border: 3px solid rgba(129,140,248,0.3);
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: sg-spin 0.8s linear infinite;
  }
`;

export function renderFloatingButton(onClick: () => void): FloatingButton {
  const shadow = createShadowContainer(HOST_ID);
  injectStyles(shadow, CSS);

  const btn = h('div', { class: 'sg-fab' });
  btn.textContent = '\u{1F6E1}';
  btn.addEventListener('click', onClick);
  shadow.appendChild(btn);

  return {
    setState(state: ButtonState, grade?: string) {
      btn.textContent = '';
      btn.className = 'sg-fab';

      if (state === 'idle') {
        btn.textContent = '\u{1F6E1}';
      } else if (state === 'analyzing') {
        btn.classList.add('analyzing');
        btn.appendChild(h('div', { class: 'sg-spinner' }));
      } else if (state === 'result' && grade) {
        btn.classList.add('result');
        btn.style.borderColor = gradeColor(grade);
        btn.style.color = gradeColor(grade);
        btn.textContent = grade;
      }
    },
    remove() {
      const host = document.getElementById(HOST_ID);
      host?.remove();
    },
  };
}
