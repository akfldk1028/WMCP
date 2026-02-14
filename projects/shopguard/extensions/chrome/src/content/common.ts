/** Create a Shadow DOM container for overlay injection */
export function createShadowContainer(id: string): ShadowRoot {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = id;
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647;';
  document.body.appendChild(host);

  return host.attachShadow({ mode: 'closed' });
}

/** Inject styles into a shadow root */
export function injectStyles(shadow: ShadowRoot, css: string): void {
  const style = document.createElement('style');
  style.textContent = css;
  shadow.appendChild(style);
}

/** Create an element with attributes and children */
export function h(
  tag: string,
  attrs: Record<string, string> = {},
  ...children: (string | Node)[]
): HTMLElement {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

/** Grade → color mapping */
export function gradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    E: '#ef4444',
    F: '#dc2626',
  };
  return colors[grade] ?? '#6b7280';
}
