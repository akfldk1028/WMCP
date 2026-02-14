/**
 * Website scanner that discovers WebMCP tools on target URLs.
 *
 * Uses simple HTTP fetch + regex parsing (same approach as the n8n scan node)
 * to discover declarative forms, imperative registerTool() calls, and
 * potential form-based tools.
 */

import type { BridgedTool, ScanResult } from './types.js';

/**
 * Scan a URL for WebMCP tools.
 */
export async function scanUrl(url: string): Promise<ScanResult> {
  const scannedAt = new Date().toISOString();

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'OpenClaw-MCP-Bridge/0.1' },
    });

    if (!response.ok) {
      return { url, tools: [], scannedAt, error: `HTTP ${response.status}` };
    }

    const html = await response.text();
    const tools: BridgedTool[] = [];

    // Scan for declarative WebMCP forms (toolname attribute)
    tools.push(...parseDeclarativeForms(html, url));

    // Scan for imperative registerTool() calls in scripts
    tools.push(...parseImperativeTools(html, url));

    return { url, tools, scannedAt };
  } catch (error) {
    return {
      url,
      tools: [],
      scannedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Scan multiple URLs in parallel.
 */
export async function scanUrls(urls: string[]): Promise<ScanResult[]> {
  return Promise.all(urls.map(scanUrl));
}

function parseDeclarativeForms(html: string, sourceUrl: string): BridgedTool[] {
  const tools: BridgedTool[] = [];
  const formRegex = /<form\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  let match: RegExpExecArray | null;

  while ((match = formRegex.exec(html)) !== null) {
    const attrs = match[1];
    const toolnameMatch = attrs.match(/toolname\s*=\s*["']([^"']*)["']/i);
    if (!toolnameMatch) continue;

    const name = toolnameMatch[1];
    const descMatch = attrs.match(/tooldescription\s*=\s*["']([^"']*)["']/i);
    const actionMatch = attrs.match(/action\s*=\s*["']([^"']*)["']/i);
    const methodMatch = attrs.match(/method\s*=\s*["']([^"']*)["']/i);

    const formAction = actionMatch ? actionMatch[1] : '';
    const method = (methodMatch ? methodMatch[1].toUpperCase() : 'GET') as 'GET' | 'POST';

    // Extract input fields for schema
    const formStart = match.index;
    const closingRegex = /<\/form>/gi;
    closingRegex.lastIndex = formStart;
    const closingMatch = closingRegex.exec(html);
    const formEnd = closingMatch ? closingMatch.index + closingMatch[0].length : html.length;
    const formBody = html.substring(formStart, formEnd);

    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    const inputRegex = /<input\b([^>]*)>/gi;
    let inputMatch: RegExpExecArray | null;

    while ((inputMatch = inputRegex.exec(formBody)) !== null) {
      const inputAttrs = inputMatch[1];
      const nameAttr = inputAttrs.match(/name\s*=\s*["']([^"']*)["']/i);
      if (!nameAttr) continue;

      const typeAttr = inputAttrs.match(/type\s*=\s*["']([^"']*)["']/i);
      const fieldType = typeAttr ? typeAttr[1] : 'text';
      if (fieldType === 'hidden' || fieldType === 'submit') continue;

      const descAttr = inputAttrs.match(/placeholder\s*=\s*["']([^"']*)["']/i);
      properties[nameAttr[1]] = {
        type: 'string',
        description: descAttr ? descAttr[1] : nameAttr[1],
      };

      if (/\brequired\b/i.test(inputAttrs)) {
        required.push(nameAttr[1]);
      }
    }

    const endpoint = formAction
      ? new URL(formAction, sourceUrl).toString()
      : sourceUrl;

    tools.push({
      name,
      description: descMatch ? descMatch[1] : `WebMCP tool: ${name}`,
      inputSchema: {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      },
      sourceUrl,
      discoveryMethod: 'declarative',
      endpoint,
      method,
    });
  }

  return tools;
}

function parseImperativeTools(html: string, sourceUrl: string): BridgedTool[] {
  const tools: BridgedTool[] = [];
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const content = scriptMatch[1];
    const registerPattern = /registerTool\s*\(\s*\{/g;
    let callMatch: RegExpExecArray | null;

    while ((callMatch = registerPattern.exec(content)) !== null) {
      const braceStart = callMatch.index + callMatch[0].length - 1;
      const block = extractBraces(content, braceStart);
      if (!block) continue;

      const config = block.slice(1, -1);
      const nameMatch = config.match(/name\s*:\s*['"]([^'"]+)['"]/);
      if (!nameMatch) continue;

      const descMatch = config.match(/description\s*:\s*['"]([^'"]+)['"]/);

      tools.push({
        name: nameMatch[1],
        description: descMatch ? descMatch[1] : `Tool: ${nameMatch[1]}`,
        inputSchema: { type: 'object', properties: {} },
        sourceUrl,
        discoveryMethod: 'imperative',
        endpoint: new URL(`/api/webmcp/${nameMatch[1]}`, sourceUrl).toString(),
        method: 'POST',
      });

      registerPattern.lastIndex = braceStart + (block?.length ?? 1);
    }
  }

  return tools;
}

/**
 * Extract a balanced brace block, skipping braces inside string literals.
 */
function extractBraces(text: string, start: number): string | null {
  if (text[start] !== '{') return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    // Skip string literals
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      for (i++; i < text.length; i++) {
        if (text[i] === '\\') { i++; continue; }
        if (text[i] === quote) break;
      }
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.substring(start, i + 1);
    }
  }
  return null;
}
