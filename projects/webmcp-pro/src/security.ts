import type { SecurityConfig, ToolRegistration } from './types.js';

const DEFAULT_MAX_INPUT_SIZE = 50 * 1024; // 50KB
const MAX_SANITIZE_DEPTH = 20;

const TOOL_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_\-./]{0,127}$/;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 1000;

/** Dangerous HTML tags that should be completely removed. */
const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'applet', 'form',
  'math', 'svg', 'video', 'audio', 'source', 'link', 'meta',
  'base', 'template',
];
// Attribute pattern that handles quoted values containing '>'
const ATTR_PATTERN = '(?:[^>"\'\\\\]|"[^"]*"|\'[^\']*\')*';

const DANGEROUS_TAG_PATTERN = new RegExp(
  `<\\/?(?:${DANGEROUS_TAGS.join('|')})\\b${ATTR_PATTERN}>`,
  'gi',
);
/** Pattern for content between dangerous tags. */
const DANGEROUS_TAG_CONTENT_PATTERN = new RegExp(
  `<(?:${DANGEROUS_TAGS.join('|')})\\b${ATTR_PATTERN}>[\\s\\S]*?<\\/(?:${DANGEROUS_TAGS.join('|')})>`,
  'gi',
);

/**
 * SecurityGuard provides CSP-style protections for WebMCP tool calls.
 *
 * It validates origins, blocks tool name patterns, sanitizes inputs
 * against XSS vectors, enforces payload size limits, and validates
 * tool registrations for structural correctness.
 */
export class SecurityGuard {
  private readonly config: SecurityConfig;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      maxInputSize: DEFAULT_MAX_INPUT_SIZE,
      sanitizeInputs: false,
      requireUserInteraction: false,
      ...config,
    };
  }

  /**
   * Check whether the given origin is allowed to call tools.
   * If no allowedOrigins are configured, all origins are permitted.
   */
  checkOrigin(origin: string): boolean {
    if (!this.config.allowedOrigins || this.config.allowedOrigins.length === 0) {
      return true;
    }
    return this.config.allowedOrigins.includes(origin);
  }

  /**
   * Check whether a tool name matches any of the blocked patterns.
   */
  isToolBlocked(toolName: string): boolean {
    if (!this.config.blockedToolPatterns || this.config.blockedToolPatterns.length === 0) {
      return false;
    }
    return this.config.blockedToolPatterns.some((pattern) => pattern.test(toolName));
  }

  /**
   * Deep-clone and sanitize all string values in the input object.
   * Strips `<script>` tags, inline event handlers (`on*=`), and
   * `javascript:` URIs from every string value.
   */
  sanitizeInput(input: Record<string, unknown>): Record<string, unknown> {
    return this.deepSanitize(input) as Record<string, unknown>;
  }

  /**
   * Check that the JSON-serialized input does not exceed the configured
   * maximum payload size.
   */
  checkInputSize(input: Record<string, unknown>): boolean {
    const maxSize = this.config.maxInputSize ?? DEFAULT_MAX_INPUT_SIZE;
    const serialized = JSON.stringify(input);
    return new TextEncoder().encode(serialized).length <= maxSize;
  }

  /**
   * Validate a tool registration for structural correctness.
   * Returns an object with `valid` status and a list of issues found.
   */
  validateTool(tool: ToolRegistration): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Validate tool name format
    if (!tool.name || typeof tool.name !== 'string') {
      issues.push('Tool name is required and must be a string.');
    } else if (!TOOL_NAME_PATTERN.test(tool.name)) {
      issues.push(
        `Tool name "${tool.name}" is invalid. Must start with a letter, contain only ` +
          'alphanumeric characters, underscores, hyphens, dots, or slashes, and be 1-128 characters.',
      );
    }

    // Check blocked patterns
    if (tool.name && this.isToolBlocked(tool.name)) {
      issues.push(`Tool name "${tool.name}" matches a blocked pattern.`);
    }

    // Validate description
    if (!tool.description || typeof tool.description !== 'string') {
      issues.push('Tool description is required and must be a string.');
    } else {
      if (tool.description.length < MIN_DESCRIPTION_LENGTH) {
        issues.push(
          `Tool description is too short (${tool.description.length} chars). ` +
            `Minimum is ${MIN_DESCRIPTION_LENGTH} characters.`,
        );
      }
      if (tool.description.length > MAX_DESCRIPTION_LENGTH) {
        issues.push(
          `Tool description is too long (${tool.description.length} chars). ` +
            `Maximum is ${MAX_DESCRIPTION_LENGTH} characters.`,
        );
      }
    }

    // Validate inputSchema presence
    if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
      issues.push('Tool inputSchema is required and must be an object.');
    }

    // Validate execute function
    if (typeof tool.execute !== 'function') {
      issues.push('Tool execute must be a function.');
    }

    return { valid: issues.length === 0, issues };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private deepSanitize(value: unknown, depth: number = 0): unknown {
    if (depth > MAX_SANITIZE_DEPTH) {
      return undefined; // Truncate excessively deep structures
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deepSanitize(item, depth + 1));
    }

    if (typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        sanitized[key] = this.deepSanitize(val, depth + 1);
      }
      return sanitized;
    }

    // Primitives (number, boolean) pass through unchanged
    return value;
  }

  private sanitizeString(input: string): string {
    let result = input;

    // Remove dangerous tag blocks with content (script, svg, iframe, etc.)
    result = result.replace(DANGEROUS_TAG_CONTENT_PATTERN, '');

    // Remove standalone/unclosed dangerous tags
    result = result.replace(DANGEROUS_TAG_PATTERN, '');

    // Remove inline event handlers: on*="..." or on*='...' or on*=expr
    // Handles mixed case (oNcLiCk), whitespace variations, backtick strings
    result = result.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]+)/gi, '');

    // Remove javascript:, vbscript:, data: URIs (with whitespace/encoding tricks)
    // Handles j&#97;vascript:, java\tscript:, etc.
    result = result.replace(/(?:j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t|v\s*b\s*s\s*c\s*r\s*i\s*p\s*t)\s*:/gi, '');
    result = result.replace(/data\s*:\s*(?:text\/html|application\/xhtml\+xml|image\/svg\+xml)/gi, '');

    // Decode all HTML numeric entities, then re-apply event handler and URI checks
    // on the decoded result. This catches sequences like &#111;&#110;click.
    result = decodeAllEntities(result);
    // Re-run event handler removal on decoded content
    result = result.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]+)/gi, '');
    // Re-run dangerous URI removal on decoded content
    result = result.replace(/(?:j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t|v\s*b\s*s\s*c\s*r\s*i\s*p\s*t)\s*:/gi, '');

    // Remove expression() CSS function (IE XSS vector)
    result = result.replace(/expression\s*\(/gi, '');

    return result;
  }
}

/**
 * Decode all HTML numeric entities (&#NNN; and &#xHH;) in a string to their characters.
 * This prevents bypass via split entity sequences like &#111;&#110;click.
 */
function decodeAllEntities(input: string): string {
  return input.replace(/&#x([0-9a-f]+);|&#(\d+);/gi, (_match, hex, dec) => {
    if (hex) return String.fromCharCode(parseInt(hex, 16));
    if (dec) return String.fromCharCode(parseInt(dec, 10));
    return _match;
  });
}
