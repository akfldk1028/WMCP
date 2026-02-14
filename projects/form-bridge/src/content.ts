/**
 * FormBridge Content Script
 *
 * Scans the current page for HTML forms, generates meaningful WebMCP
 * attributes (toolname, tooldescription, toolautosubmit), and applies
 * them so AI agents can discover and operate forms via the WebMCP
 * protocol.
 *
 * Wrapped in an IIFE because Chrome content scripts do not support
 * ES module imports.
 */

(function formBridgeContentScript() {
  // ---------------------------------------------------------------
  // Types
  // ---------------------------------------------------------------

  interface FormBridgeConfig {
    enabled: boolean;
    autoDetect: boolean;
    excludePatterns: string[];
    customMappings: Record<string, { toolname: string; tooldescription: string }>;
  }

  interface DetectedForm {
    element: HTMLFormElement;
    toolname: string;
    tooldescription: string;
    fieldCount: number;
    hasExistingWebMCP: boolean;
  }

  // ---------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------

  const BADGE_CLASS = 'formbridge-badge';
  const PROCESSED_ATTR = 'data-formbridge-processed';
  const DEFAULT_CONFIG: FormBridgeConfig = {
    enabled: true,
    autoDetect: true,
    excludePatterns: [],
    customMappings: {},
  };

  // ---------------------------------------------------------------
  // Utility helpers
  // ---------------------------------------------------------------

  /** Convert an arbitrary string to a URL-safe kebab-case identifier. */
  function toKebabCase(input: string): string {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64);
  }

  /** Truncate a string to `max` characters, adding an ellipsis if needed. */
  function truncate(str: string, max: number): string {
    if (str.length <= max) return str;
    return str.slice(0, max - 1).trimEnd() + '\u2026';
  }

  /** Collect visible, user-facing input fields inside a form. */
  function getInputFields(form: HTMLFormElement): HTMLElement[] {
    const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), textarea, select';
    return Array.from(form.querySelectorAll<HTMLElement>(selectors));
  }

  /** Return the human-readable label for a form field. */
  function getFieldLabel(field: HTMLElement): string | null {
    // Explicit <label for="...">
    const id = field.getAttribute('id');
    if (id) {
      const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
      if (label?.textContent) return label.textContent.trim();
    }

    // Wrapping <label>
    const parentLabel = field.closest('label');
    if (parentLabel?.textContent) {
      // Remove the field's own text contribution (e.g. select options)
      const clone = parentLabel.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('input, textarea, select').forEach((el) => el.remove());
      const text = clone.textContent?.trim();
      if (text) return text;
    }

    // aria-label
    const ariaLabel = field.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel.trim();

    // placeholder
    const placeholder = field.getAttribute('placeholder');
    if (placeholder) return placeholder.trim();

    // name / id fallback
    const name = field.getAttribute('name') || field.getAttribute('id');
    if (name) return name.replace(/[_-]/g, ' ').trim();

    return null;
  }

  /** Find the nearest heading element above / before the form. */
  function findNearestHeading(form: HTMLFormElement): string | null {
    // Walk backwards through previous siblings / parent chain looking for h1-h3
    let node: Element | null = form;
    const maxSteps = 10;
    let steps = 0;
    while (node && steps < maxSteps) {
      // Check previous siblings
      let sibling = node.previousElementSibling;
      while (sibling) {
        if (/^H[1-3]$/i.test(sibling.tagName)) {
          return sibling.textContent?.trim() || null;
        }
        // Also check the last child (some wrappers put heading inside a div)
        const nested = sibling.querySelector('h1, h2, h3');
        if (nested?.textContent) return nested.textContent.trim();
        sibling = sibling.previousElementSibling;
      }
      node = node.parentElement;
      steps++;
    }

    // Also try the form's own children
    const innerHeading = form.querySelector('h1, h2, h3, h4');
    if (innerHeading?.textContent) return innerHeading.textContent.trim();

    return null;
  }

  /** Get text of the primary submit button inside the form. */
  function getSubmitButtonText(form: HTMLFormElement): string | null {
    const btn =
      form.querySelector<HTMLButtonElement>('button[type="submit"]') ||
      form.querySelector<HTMLInputElement>('input[type="submit"]') ||
      form.querySelector<HTMLButtonElement>('button:not([type])');

    if (!btn) return null;

    if (btn instanceof HTMLInputElement) {
      return btn.value?.trim() || null;
    }
    return btn.textContent?.trim() || null;
  }

  /** Return true if the given URL pattern matches the current page URL. */
  function urlMatchesPattern(pattern: string, url: string): boolean {
    try {
      // Support simple glob patterns: * matches anything
      const escaped = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(`^${escaped}$`, 'i').test(url);
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------
  // Core detection & attribution
  // ---------------------------------------------------------------

  let formIndex = 0;

  function generateToolName(form: HTMLFormElement): string {
    // 1. form.id
    if (form.id) {
      const name = toKebabCase(form.id);
      if (name) return name;
    }

    // 2. form[name]
    const formName = form.getAttribute('name');
    if (formName) {
      const name = toKebabCase(formName);
      if (name) return name;
    }

    // 3. aria-label
    const ariaLabel = form.getAttribute('aria-label');
    if (ariaLabel) {
      const name = toKebabCase(ariaLabel);
      if (name) return name;
    }

    // 4. Action URL last path segment
    const action = form.getAttribute('action');
    if (action && action !== '#' && action !== '') {
      try {
        const url = new URL(action, window.location.href);
        const segments = url.pathname.split('/').filter(Boolean);
        const last = segments[segments.length - 1];
        if (last) {
          // Strip file extensions
          const clean = last.replace(/\.\w+$/, '');
          const name = toKebabCase(clean);
          if (name) return name;
        }
      } catch {
        // Invalid URL, skip
      }
    }

    // 5. Submit button text
    const btnText = getSubmitButtonText(form);
    if (btnText) {
      const name = toKebabCase(btnText);
      if (name) return name;
    }

    // 6. Fallback
    formIndex++;
    return `form-${formIndex}`;
  }

  function generateToolDescription(form: HTMLFormElement): string {
    const parts: string[] = [];

    // 1. Title attribute
    const title = form.getAttribute('title');
    if (title) return truncate(title.trim(), 200);

    // 2. aria-label
    const ariaLabel = form.getAttribute('aria-label');
    if (ariaLabel) {
      parts.push(ariaLabel.trim());
    }

    // 3. Nearest heading
    const heading = findNearestHeading(form);
    if (heading && !parts.includes(heading)) {
      parts.push(heading);
    }

    // If we already have a decent description, return it
    if (parts.length > 0) {
      return truncate(parts.join(' - '), 200);
    }

    // 4. Construct from field labels
    const fields = getInputFields(form);
    const labels = fields
      .map(getFieldLabel)
      .filter((l): l is string => l !== null)
      .slice(0, 6);

    if (labels.length > 0) {
      const btnText = getSubmitButtonText(form);
      const verb = btnText ? btnText : 'Submit form';
      return truncate(`${verb} with ${labels.join(', ')}`, 200);
    }

    // 5. Final fallback
    const fieldCount = fields.length;
    return `Submit form with ${fieldCount} field${fieldCount !== 1 ? 's' : ''}`;
  }

  function detectForms(): DetectedForm[] {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form'));
    const detected: DetectedForm[] = [];

    for (const form of forms) {
      // Skip forms inside iframes (we only see our own document, but
      // guard against edge cases with adopted nodes)
      if (form.ownerDocument !== document) continue;

      // Skip already-processed forms
      if (form.hasAttribute(PROCESSED_ATTR)) continue;

      const hasExistingWebMCP = form.hasAttribute('toolname');
      const fields = getInputFields(form);
      const fieldCount = fields.length;

      // Skip forms with zero visible fields (likely decorative or tracking forms)
      if (fieldCount === 0 && !hasExistingWebMCP) continue;

      const toolname = hasExistingWebMCP
        ? (form.getAttribute('toolname') || generateToolName(form))
        : generateToolName(form);

      const tooldescription = hasExistingWebMCP
        ? (form.getAttribute('tooldescription') || generateToolDescription(form))
        : generateToolDescription(form);

      detected.push({
        element: form,
        toolname,
        tooldescription,
        fieldCount,
        hasExistingWebMCP,
      });
    }

    return detected;
  }

  // ---------------------------------------------------------------
  // Visual badge
  // ---------------------------------------------------------------

  function addVisualBadge(form: HTMLFormElement): void {
    // Don't add duplicate badges
    if (form.querySelector(`.${BADGE_CLASS}`)) return;

    // Ensure the form is a positioning context so the badge lands in
    // the correct corner. Only change position if it's currently
    // static -- we don't want to break fixed / sticky / absolute forms.
    const computed = window.getComputedStyle(form);
    if (computed.position === 'static') {
      form.style.position = 'relative';
    }

    const badge = document.createElement('div');
    badge.className = BADGE_CLASS;
    badge.textContent = 'WM';
    badge.title = 'FormBridge: WebMCP enabled';

    // Inline styles so we don't depend on any external stylesheet
    Object.assign(badge.style, {
      position: 'absolute',
      top: '4px',
      right: '4px',
      zIndex: '9999',
      padding: '1px 6px',
      fontSize: '10px',
      fontWeight: '700',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '16px',
      color: '#fff',
      backgroundColor: '#22c55e',
      borderRadius: '9999px',
      pointerEvents: 'none',
      userSelect: 'none',
      opacity: '0.85',
      letterSpacing: '0.5px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    } as Partial<CSSStyleDeclaration>);

    form.appendChild(badge);
  }

  // ---------------------------------------------------------------
  // Apply attributes
  // ---------------------------------------------------------------

  function applyWebMCPAttributes(detected: DetectedForm): void {
    const form = detected.element;

    if (detected.hasExistingWebMCP) {
      // Don't overwrite existing attributes, just mark as processed
      form.setAttribute(PROCESSED_ATTR, 'existing');
      return;
    }

    form.setAttribute('toolname', detected.toolname);
    form.setAttribute('tooldescription', detected.tooldescription);
    form.setAttribute('toolautosubmit', 'false');
    form.setAttribute(PROCESSED_ATTR, 'enhanced');

    addVisualBadge(form);
  }

  // ---------------------------------------------------------------
  // Messaging helpers
  // ---------------------------------------------------------------

  function sendStats(formsDetected: number, formsEnhanced: number): void {
    try {
      chrome.runtime.sendMessage({
        type: 'FORMS_DETECTED',
        formsDetected,
        formsEnhanced,
      });
    } catch {
      // Extension context may be invalidated (e.g., extension reloaded)
    }
  }

  // ---------------------------------------------------------------
  // Incoming message handler (popup queries for form details)
  // ---------------------------------------------------------------

  try {
    chrome.runtime.onMessage.addListener(
      (
        message: Record<string, unknown>,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: unknown) => void,
      ) => {
        if (message.type === 'GET_FORM_DETAILS') {
          const enhanced = document.querySelectorAll<HTMLFormElement>(
            `form[${PROCESSED_ATTR}]`,
          );
          const details = Array.from(enhanced).map((form) => ({
            toolname: form.getAttribute('toolname') || 'unknown',
            tooldescription: form.getAttribute('tooldescription') || '',
            fieldCount: getInputFields(form).length,
          }));
          sendResponse(details);
        }
        return undefined;
      },
    );
  } catch {
    // chrome.runtime may not be available
  }

  // ---------------------------------------------------------------
  // Main entry point
  // ---------------------------------------------------------------

  function run(config: FormBridgeConfig): void {
    if (!config.enabled) return;

    // Check URL exclusion patterns
    const currentUrl = window.location.href;
    for (const pattern of config.excludePatterns) {
      if (urlMatchesPattern(pattern, currentUrl)) return;
    }

    const detected = detectForms();

    // Apply custom mappings first
    for (const form of detected) {
      const id = form.element.id || form.element.getAttribute('name') || '';
      const mapping = config.customMappings[id];
      if (mapping) {
        form.toolname = mapping.toolname;
        form.tooldescription = mapping.tooldescription;
      }
    }

    let enhancedCount = 0;
    for (const form of detected) {
      applyWebMCPAttributes(form);
      if (!form.hasExistingWebMCP) enhancedCount++;
    }

    sendStats(detected.length, enhancedCount);
  }

  // ---------------------------------------------------------------
  // MutationObserver for SPA / dynamic content
  // ---------------------------------------------------------------

  function setupObserver(config: FormBridgeConfig): void {
    if (!config.autoDetect) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Only re-run if there are unprocessed forms
        const unprocessed = document.querySelectorAll(`form:not([${PROCESSED_ATTR}])`);
        if (unprocessed.length > 0) {
          run(config);
        }
      }, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ---------------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------------

  function loadConfig(callback: (config: FormBridgeConfig) => void): void {
    try {
      chrome.storage.sync.get('formBridgeConfig', (result) => {
        if (chrome.runtime.lastError) {
          callback(DEFAULT_CONFIG);
          return;
        }
        const stored = result?.formBridgeConfig;
        if (stored && typeof stored === 'object') {
          callback({
            ...DEFAULT_CONFIG,
            ...stored,
          });
        } else {
          callback(DEFAULT_CONFIG);
        }
      });
    } catch {
      // If chrome.storage is unavailable (e.g., during tests), use defaults
      callback(DEFAULT_CONFIG);
    }
  }

  // Listen for config changes from the popup
  try {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes.formBridgeConfig) {
        const newConfig: FormBridgeConfig = {
          ...DEFAULT_CONFIG,
          ...changes.formBridgeConfig.newValue,
        };

        if (!newConfig.enabled) {
          // Remove badges and attributes from all enhanced forms
          const enhanced = document.querySelectorAll<HTMLFormElement>(`form[${PROCESSED_ATTR}="enhanced"]`);
          enhanced.forEach((form) => {
            form.removeAttribute('toolname');
            form.removeAttribute('tooldescription');
            form.removeAttribute('toolautosubmit');
            form.removeAttribute(PROCESSED_ATTR);
            const badge = form.querySelector(`.${BADGE_CLASS}`);
            if (badge) badge.remove();
          });
          sendStats(0, 0);
        } else {
          // Re-scan with new config -- clear processed markers first
          // so forms are re-evaluated
          const processed = document.querySelectorAll<HTMLFormElement>(`form[${PROCESSED_ATTR}]`);
          processed.forEach((form) => {
            if (form.getAttribute(PROCESSED_ATTR) === 'enhanced') {
              form.removeAttribute('toolname');
              form.removeAttribute('tooldescription');
              form.removeAttribute('toolautosubmit');
              const badge = form.querySelector(`.${BADGE_CLASS}`);
              if (badge) badge.remove();
            }
            form.removeAttribute(PROCESSED_ATTR);
          });
          formIndex = 0;
          run(newConfig);
          setupObserver(newConfig);
        }
      }
    });
  } catch {
    // chrome.storage may not be available
  }

  // Kick off
  loadConfig((config) => {
    run(config);
    setupObserver(config);
  });
})();
