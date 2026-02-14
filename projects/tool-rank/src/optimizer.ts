import type { OptimizationResult, OptimizationChange, DescriptionTemplate } from './types.js';
import { DESCRIPTION_TEMPLATES, OPTIMIZATION_RULES } from './templates.js';

/**
 * Analyzes and optimizes MCP tool descriptions for better AI agent selection.
 *
 * Based on MCP-Bench research showing that well-structured tool descriptions
 * can improve agent tool-selection accuracy from ~13% to ~43%.
 */
export class ToolDescriptionOptimizer {
  /**
   * Analyze a tool description and score it from 0 to 100.
   *
   * Each optimization rule contributes a weighted portion to the total score.
   * A score of 100 means all rules pass; each failing rule deducts its weight.
   */
  score(description: string): {
    score: number;
    issues: Array<{ rule: string; fix: string; weight: number }>;
  } {
    const issues: Array<{ rule: string; fix: string; weight: number }> = [];

    for (const rule of OPTIMIZATION_RULES) {
      // check() returns true when the rule is *violated*
      if (rule.check(description)) {
        issues.push({ rule: rule.id, fix: rule.fix, weight: rule.weight });
      }
    }

    const penaltySum = issues.reduce((sum, i) => sum + i.weight, 0);
    const rawScore = Math.round((1 - penaltySum) * 100);
    const score = Math.max(0, Math.min(100, rawScore));

    return { score, issues };
  }

  /**
   * Optimize a description by applying all failing rules and, when possible,
   * rewriting it using a matching template.
   *
   * @param toolName   - The MCP tool name (e.g. "createUser", "search_products")
   * @param description - The current tool description
   * @param inputSchema - Optional JSON Schema of the tool's input for richer hints
   */
  optimize(
    toolName: string,
    description: string,
    inputSchema?: Record<string, unknown>,
  ): OptimizationResult {
    const { score: originalScore, issues } = this.score(description);
    const changes: OptimizationChange[] = [];
    let optimized = description;

    // --- Apply rule-based fixes ---

    // 1. Action verb
    if (issues.some((i) => i.rule === 'action_verb')) {
      const verb = this.inferActionVerb(toolName);
      const before = optimized;
      optimized = `${verb} ${lowercaseFirst(optimized)}`;
      changes.push({
        type: 'add_action_verb',
        description: `Prepend action verb "${verb}"`,
        before,
        after: optimized,
      });
    }

    // 2. Return type hint
    if (issues.some((i) => i.rule === 'return_type')) {
      const before = optimized;
      const returnHint = this.inferReturnHint(toolName);
      optimized = ensureTrailingPeriod(optimized) + ` Returns: ${returnHint}.`;
      changes.push({
        type: 'add_input_description',
        description: 'Add return type information',
        before,
        after: optimized,
      });
    }

    // 3. Input hint
    if (issues.some((i) => i.rule === 'input_hint')) {
      const before = optimized;
      const requiredFields = this.extractRequiredFields(inputSchema);
      if (requiredFields) {
        optimized = ensureTrailingPeriod(optimized) + ` Required: ${requiredFields}.`;
      } else {
        optimized = ensureTrailingPeriod(optimized) + ' Accepts required parameters.';
      }
      changes.push({
        type: 'add_input_description',
        description: 'Add input parameter hints',
        before,
        after: optimized,
      });
    }

    // 4. Constraints
    if (issues.some((i) => i.rule === 'constraints')) {
      const before = optimized;
      optimized = ensureTrailingPeriod(optimized) + ' Only accessible with valid permissions.';
      changes.push({
        type: 'add_constraints',
        description: 'Add constraint information',
        before,
        after: optimized,
      });
    }

    // 5. Jargon removal
    if (issues.some((i) => i.rule === 'no_jargon')) {
      const before = optimized;
      optimized = optimized
        .replace(/\butilize\b/gi, 'use')
        .replace(/\bleverage\b/gi, 'use')
        .replace(/\bfacilitate\b/gi, 'enable')
        .replace(/\bsynerg\w*/gi, 'combine');
      changes.push({
        type: 'simplify',
        description: 'Replace jargon with simpler language',
        before,
        after: optimized,
      });
    }

    // 6. Length: if still too short, use template-based rewrite
    if (optimized.length < 20) {
      const template = this.matchTemplate(toolName);
      if (template) {
        const before = optimized;
        optimized = template.example;
        changes.push({
          type: 'add_examples',
          description: 'Rewrite using best-practice template (description was too short)',
          before,
          after: optimized,
        });
      }
    }

    // Trim to max 200 chars for the length rule (truncate gracefully)
    if (optimized.length > 200) {
      optimized = optimized.slice(0, 197) + '...';
    }

    const { score: optimizedScore } = this.score(optimized);
    const expectedImprovement = Math.max(0, optimizedScore - originalScore);

    return { original: description, optimized, changes, expectedImprovement };
  }

  /**
   * Match the best description template for a given tool name.
   * Returns the first template whose pattern matches the tool name, or null.
   */
  matchTemplate(toolName: string): DescriptionTemplate | null {
    const normalized = toolName.toLowerCase();
    for (const template of DESCRIPTION_TEMPLATES) {
      const regex = new RegExp(template.pattern, 'i');
      if (regex.test(normalized)) {
        return template;
      }
    }
    return null;
  }

  /**
   * Generate multiple description variants for A/B testing.
   *
   * - Variant 0: Original (unchanged)
   * - Variant 1: Fully optimized (all rules applied)
   * - Variant 2: Template-based rewrite (if a template matches)
   * - Variant 3+: Partial optimizations (subset of rules)
   *
   * @param count - Number of variants to generate (default 3, minimum 2)
   */
  generateVariants(
    toolName: string,
    description: string,
    count: number = 3,
  ): string[] {
    const effectiveCount = Math.max(2, count);
    const variants: string[] = [];

    // Variant A: original
    variants.push(description);

    // Variant B: fully optimized
    const optimized = this.optimize(toolName, description);
    variants.push(optimized.optimized);

    if (variants.length >= effectiveCount) {
      return variants.slice(0, effectiveCount);
    }

    // Variant C: template-based rewrite
    const template = this.matchTemplate(toolName);
    if (template) {
      variants.push(template.example);
    } else {
      // Fallback: optimized with a slightly different structure
      const reversed = this.optimizeMinimal(toolName, description);
      variants.push(reversed);
    }

    if (variants.length >= effectiveCount) {
      return variants.slice(0, effectiveCount);
    }

    // Additional variants: partial optimizations
    const { issues } = this.score(description);
    for (let i = 0; i < issues.length && variants.length < effectiveCount; i++) {
      const partial = this.applyPartialFix(toolName, description, issues[i].rule);
      if (!variants.includes(partial)) {
        variants.push(partial);
      }
    }

    // Fill remaining slots with minor rewrites if needed
    while (variants.length < effectiveCount) {
      const suffix = variants.length === 4
        ? ' Use this tool for reliable results.'
        : ` Variant ${variants.length}.`;
      const filler = ensureTrailingPeriod(description) + suffix;
      if (!variants.includes(filler)) {
        variants.push(filler);
      } else {
        break;
      }
    }

    return variants.slice(0, effectiveCount);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Infer an action verb from the tool name */
  private inferActionVerb(toolName: string): string {
    const name = toolName.toLowerCase();
    const verbMap: Array<[RegExp, string]> = [
      [/create|add|new|insert|post/i, 'Create'],
      [/read|get|fetch|retrieve|show/i, 'Retrieve'],
      [/list/i, 'List'],
      [/update|edit|modify|patch|put/i, 'Update'],
      [/delete|remove|destroy|drop/i, 'Delete'],
      [/search|find|query|lookup|filter/i, 'Search'],
      [/convert|transform|format|parse|encode|decode/i, 'Convert'],
      [/navigate|goto|open|redirect|visit/i, 'Navigate'],
      [/login|signin|auth/i, 'Login'],
      [/logout|signout/i, 'Logout'],
      [/send|emit|publish/i, 'Send'],
      [/validate|check|verify/i, 'Validate'],
      [/calculate|compute/i, 'Calculate'],
      [/generate/i, 'Generate'],
      [/download/i, 'Download'],
      [/upload/i, 'Upload'],
      [/process/i, 'Process'],
      [/analyze/i, 'Analyze'],
      [/compare/i, 'Compare'],
      [/sort/i, 'Sort'],
      [/export/i, 'Export'],
      [/import/i, 'Import'],
    ];

    for (const [regex, verb] of verbMap) {
      if (regex.test(name)) {
        return verb;
      }
    }
    return 'Process';
  }

  /** Infer a return type hint from the tool name */
  private inferReturnHint(toolName: string): string {
    const name = toolName.toLowerCase();
    if (/list|search|find|query|filter/i.test(name)) return 'array of matching results';
    if (/delete|remove|destroy/i.test(name)) return 'deletion confirmation';
    if (/create|add|new|insert/i.test(name)) return 'newly created resource';
    if (/update|edit|modify|patch/i.test(name)) return 'updated resource';
    if (/login|auth|signin/i.test(name)) return 'authentication token';
    if (/convert|transform|format|parse/i.test(name)) return 'transformed output';
    return 'operation result';
  }

  /** Extract required field names from an input JSON Schema */
  private extractRequiredFields(schema?: Record<string, unknown>): string | null {
    if (!schema) return null;
    const required = schema['required'];
    if (Array.isArray(required) && required.length > 0) {
      return (required as string[]).join(', ');
    }
    const properties = schema['properties'];
    if (properties && typeof properties === 'object') {
      const keys = Object.keys(properties as Record<string, unknown>);
      if (keys.length > 0) {
        return keys.slice(0, 5).join(', ');
      }
    }
    return null;
  }

  /** Apply a minimal optimization (just action verb + return type) */
  private optimizeMinimal(toolName: string, description: string): string {
    const verb = this.inferActionVerb(toolName);
    const returnHint = this.inferReturnHint(toolName);
    let result = description;

    if (!/^(Create|Read|Get|Update|Delete|Search|Convert|Navigate|Submit|Login|Logout|List|Fetch|Send|Check|Validate|Calculate|Generate|Download|Upload|Process|Analyze|Compare|Sort|Filter|Export|Import)/i.test(result)) {
      result = `${verb} ${lowercaseFirst(result)}`;
    }

    if (!/returns?:?\s/i.test(result)) {
      result = ensureTrailingPeriod(result) + ` Returns: ${returnHint}.`;
    }

    return result;
  }

  /** Apply a single rule fix to the description */
  private applyPartialFix(toolName: string, description: string, ruleId: string): string {
    let result = description;

    switch (ruleId) {
      case 'action_verb': {
        const verb = this.inferActionVerb(toolName);
        result = `${verb} ${lowercaseFirst(result)}`;
        break;
      }
      case 'return_type': {
        const hint = this.inferReturnHint(toolName);
        result = ensureTrailingPeriod(result) + ` Returns: ${hint}.`;
        break;
      }
      case 'input_hint':
        result = ensureTrailingPeriod(result) + ' Accepts required parameters.';
        break;
      case 'constraints':
        result = ensureTrailingPeriod(result) + ' Only accessible with valid permissions.';
        break;
      case 'no_jargon':
        result = result
          .replace(/\butilize\b/gi, 'use')
          .replace(/\bleverage\b/gi, 'use')
          .replace(/\bfacilitate\b/gi, 'enable')
          .replace(/\bsynerg\w*/gi, 'combine');
        break;
      default:
        break;
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function lowercaseFirst(str: string): string {
  if (str.length === 0) return str;
  return str[0].toLowerCase() + str.slice(1);
}

function ensureTrailingPeriod(str: string): string {
  const trimmed = str.trimEnd();
  if (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')) {
    return trimmed;
  }
  return trimmed + '.';
}
