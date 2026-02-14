/**
 * Shared utilities for WebMCP projects
 */
import type { MCPToolDefinition, WebMCPToolInput, DeclarativeToolAttributes, FormInfo, DetailedScore, CategoryScore } from './types.js';

// ===== MCP → WebMCP Conversion =====

/**
 * Convert an MCP tool definition to WebMCP tool input (without execute function)
 */
export function mcpToWebMCPToolInput(mcpTool: MCPToolDefinition): WebMCPToolInput {
  return {
    name: mcpTool.name,
    description: mcpTool.description,
    inputSchema: mcpTool.inputSchema,
  };
}

/**
 * Generate WebMCP Imperative API JavaScript code from MCP tool definition
 */
export function generateImperativeCode(tool: MCPToolDefinition, options?: { proxyBaseUrl?: string }): string {
  const baseUrl = options?.proxyBaseUrl ?? '/api';
  const schemaStr = JSON.stringify(tool.inputSchema, null, 4);

  return `navigator.modelContext.registerTool({
    name: ${JSON.stringify(tool.name)},
    description: ${JSON.stringify(tool.description)},
    inputSchema: ${schemaStr},
    async execute(input) {
        const response = await fetch('${baseUrl}/${tool.name}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        const result = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
});`;
}

/**
 * Generate WebMCP Declarative API HTML from form info
 */
export function generateDeclarativeHTML(form: FormInfo): string {
  const toolName = form.suggestedToolName ?? kebabCase(form.action.replace(/^\//, ''));
  const attrs = [
    `toolname="${toolName}"`,
    `tooldescription="Submit ${toolName} form"`,
    'toolautosubmit',
  ];

  const fields = form.fields
    .map((f) => {
      const req = f.required ? ' required' : '';
      const ph = f.placeholder ? ` placeholder="${f.placeholder}"` : '';
      return `    <input name="${f.name}" type="${f.type}"${ph}${req}>`;
    })
    .join('\n');

  return `<form action="${form.action}" method="${form.method}"
      ${attrs.join('\n      ')}>
${fields}
    <button type="submit">Submit</button>
</form>`;
}

/**
 * Parse HTML form attributes to Declarative tool attributes
 */
export function parseDeclarativeAttributes(attrs: Record<string, string>): DeclarativeToolAttributes | null {
  if (!attrs.toolname || !attrs.tooldescription) return null;
  return {
    toolname: attrs.toolname,
    tooldescription: attrs.tooldescription,
    toolautosubmit: attrs.toolautosubmit !== undefined,
  };
}

// ===== Feature Detection =====

/**
 * Generate feature detection snippet
 */
export function getFeatureDetectionCode(): string {
  return `if ('modelContext' in navigator) {
    console.log('WebMCP supported!');
    // Register tools here
} else {
    console.log('WebMCP not supported. Consider @mcp-b/global polyfill.');
}`;
}

// ===== Helpers =====

function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Calculate WebMCP readiness score (0-100)
 */
export function calculateReadinessScore(
  formCount: number,
  toolCount: number,
  hasDeclarative: boolean,
  hasImperative: boolean,
): number {
  let score = 0;
  if (formCount > 0) score += 20;
  if (toolCount > 0) score += 30;
  if (hasDeclarative) score += 25;
  if (hasImperative) score += 25;
  return Math.min(score, 100);
}

/**
 * Convert numeric score (0-100) to letter grade
 */
export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'F';
}

/**
 * Get color hex for a grade
 */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#22c55e';
    case 'B': return '#3b82f6';
    case 'C': return '#eab308';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
    default: return '#6b7280';
  }
}

/**
 * Calculate detailed category-level scores
 */
export function calculateDetailedScore(
  forms: FormInfo[],
  tools: WebMCPToolInput[],
  hasDeclarative: boolean,
  hasImperative: boolean,
  imperativeFeatures: { hasInputSchema: boolean; hasExecute: boolean } = { hasInputSchema: false, hasExecute: false },
): DetailedScore {
  // Structure (30 points)
  const totalFields = forms.reduce((sum, f) => sum + f.fields.length, 0);
  const structFormScore = Math.min(forms.length * 5, 15);
  const structFieldScore = Math.min(totalFields * 2, 15);
  const structureDetails: string[] = [];
  if (forms.length > 0) structureDetails.push(`${forms.length} form(s) detected`);
  if (totalFields > 0) structureDetails.push(`${totalFields} input field(s) found`);
  if (forms.length === 0) structureDetails.push('No forms detected');

  const structure: CategoryScore = {
    score: structFormScore + structFieldScore,
    max: 30,
    details: structureDetails,
  };

  // Tools (30 points)
  const toolCountScore = Math.min(tools.length * 10, 15);
  const hasSchemaProps = tools.some(
    (t) => t.inputSchema.properties && Object.keys(t.inputSchema.properties).length > 0,
  );
  const toolSchemaScore = tools.length > 0 ? (hasSchemaProps ? 15 : 5) : 0;
  const toolsDetails: string[] = [];
  if (tools.length > 0) toolsDetails.push(`${tools.length} tool(s) registered`);
  if (hasSchemaProps) toolsDetails.push('Input schemas with properties defined');
  else if (tools.length > 0) toolsDetails.push('Input schemas lack property definitions');
  if (tools.length === 0) toolsDetails.push('No registered tools detected');

  const toolsCategory: CategoryScore = {
    score: toolCountScore + toolSchemaScore,
    max: 30,
    details: toolsDetails,
  };

  // Declarative (20 points)
  const declDetails: string[] = [];
  let declScore = 0;
  if (hasDeclarative) {
    declScore += 10; declDetails.push('toolname attribute present');
    const hasDesc = forms.some((f) => f.hasToolDescription);
    if (hasDesc) { declScore += 5; declDetails.push('tooldescription attribute present'); }
    else { declDetails.push('tooldescription attribute missing'); }
    const hasAutoSubmit = forms.some((f) => f.hasToolAutosubmit);
    if (hasAutoSubmit) { declScore += 5; declDetails.push('toolautosubmit attribute present'); }
    else { declDetails.push('toolautosubmit attribute missing'); }
  } else {
    declDetails.push('No declarative WebMCP attributes found');
  }

  const declarative: CategoryScore = {
    score: declScore,
    max: 20,
    details: declDetails,
  };

  // Imperative (20 points)
  const impDetails: string[] = [];
  let impScore = 0;
  if (hasImperative) {
    impScore += 10; impDetails.push('registerTool() calls detected');
    if (imperativeFeatures.hasInputSchema) { impScore += 5; impDetails.push('inputSchema defined'); }
    else { impDetails.push('inputSchema not detected'); }
    if (imperativeFeatures.hasExecute) { impScore += 5; impDetails.push('execute() handler present'); }
    else { impDetails.push('execute() handler not detected'); }
  } else {
    impDetails.push('No imperative WebMCP API usage detected');
  }

  const imperative: CategoryScore = {
    score: impScore,
    max: 20,
    details: impDetails,
  };

  const total = structure.score + toolsCategory.score + declarative.score + imperative.score;

  return {
    total,
    grade: scoreToGrade(total),
    categories: {
      structure,
      tools: toolsCategory,
      declarative,
      imperative,
    },
  };
}
