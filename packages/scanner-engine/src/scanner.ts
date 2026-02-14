/**
 * WebMCP Site Scanner
 * Crawls a URL, extracts forms, detects existing WebMCP tools,
 * and generates recommendations for WebMCP adoption.
 */
import * as cheerio from 'cheerio';
import type { ScanResult, FormInfo, FormFieldInfo, WebMCPToolInput } from '@wmcp/core';
import { calculateReadinessScore, calculateDetailedScore } from '@wmcp/core';
import { analyzeForm, generateRecommendations } from './analyzer.js';

export interface ScanOptions {
  timeout?: number;
  followRedirects?: boolean;
  maxDepth?: number;
}

export async function scanUrl(url: string, options: ScanOptions = {}): Promise<ScanResult> {
  const { timeout = 10000 } = options;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeout),
    headers: { 'User-Agent': 'WMCP-Scanner/0.1' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract forms
  const forms = extractForms($);

  // Detect existing WebMCP tools (from inline scripts)
  const { tools: existingTools, hasInputSchema, hasExecute } = detectExistingTools($);

  // Check for declarative API usage
  const hasDeclarative = forms.some((f) => f.hasToolAttributes);
  const hasImperative = existingTools.length > 0;

  // Generate recommendations
  const recommendations = forms.flatMap((form) => generateRecommendations(form));

  const score = calculateReadinessScore(forms.length, existingTools.length, hasDeclarative, hasImperative);
  const detailedScore = calculateDetailedScore(forms, existingTools, hasDeclarative, hasImperative, { hasInputSchema, hasExecute });

  return {
    url,
    timestamp: new Date().toISOString(),
    forms,
    existingTools,
    recommendations,
    score,
    detailedScore,
  };
}

function extractForms($: cheerio.CheerioAPI): FormInfo[] {
  const forms: FormInfo[] = [];

  $('form').each((_, el) => {
    const $form = $(el);
    const action = $form.attr('action') ?? '';
    const method = ($form.attr('method') ?? 'GET').toUpperCase();

    const fields: FormFieldInfo[] = [];
    $form.find('input, select, textarea').each((_, fieldEl) => {
      const $field = $(fieldEl);
      const name = $field.attr('name');
      if (!name) return;

      fields.push({
        name,
        type: $field.attr('type') ?? 'text',
        label: $form.find(`label[for="${$field.attr('id')}"]`).text().trim() || undefined,
        required: $field.attr('required') !== undefined,
        placeholder: $field.attr('placeholder') || undefined,
      });
    });

    const hasToolAttributes = !!$form.attr('toolname');
    const hasToolDescription = !!$form.attr('tooldescription');
    const hasToolAutosubmit = $form.attr('toolautosubmit') !== undefined;

    forms.push({
      action,
      method,
      fields,
      hasToolAttributes,
      hasToolDescription,
      hasToolAutosubmit,
      suggestedToolName: $form.attr('toolname') || undefined,
    });
  });

  return forms;
}

interface ToolDetectionResult {
  tools: WebMCPToolInput[];
  hasInputSchema: boolean;
  hasExecute: boolean;
}

function detectExistingTools($: cheerio.CheerioAPI): ToolDetectionResult {
  const tools: WebMCPToolInput[] = [];
  let hasInputSchema = false;
  let hasExecute = false;

  // Look for registerTool calls in inline scripts
  $('script').each((_, el) => {
    const content = $(el).html() ?? '';
    const registerMatches = content.matchAll(/registerTool\s*\(\s*\{([^}]*name\s*:\s*['"]([^'"]+)['"][^}]*)\}/g);
    for (const match of registerMatches) {
      tools.push({
        name: match[2],
        description: 'Detected from inline script',
        inputSchema: { type: 'object' },
      });
    }
    if (content.includes('registerTool')) {
      if (/inputSchema\s*:/.test(content)) hasInputSchema = true;
      if (/execute\s*[:(]/.test(content)) hasExecute = true;
    }
  });

  return { tools, hasInputSchema, hasExecute };
}
