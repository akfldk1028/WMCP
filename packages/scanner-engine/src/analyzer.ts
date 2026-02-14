/**
 * Form analyzer - generates WebMCP adoption recommendations
 */
import type { FormInfo, ToolRecommendation } from '@wmcp/core';
import { generateDeclarativeHTML, generateImperativeCode } from '@wmcp/core';

export function analyzeForm(form: FormInfo): { isCandidate: boolean; reason: string } {
  // Forms with action and fields are WebMCP candidates
  if (form.fields.length === 0) {
    return { isCandidate: false, reason: 'No input fields detected' };
  }
  if (!form.action) {
    return { isCandidate: false, reason: 'No form action specified' };
  }
  if (form.hasToolAttributes) {
    return { isCandidate: false, reason: 'Already has WebMCP attributes' };
  }
  return { isCandidate: true, reason: 'Form can be enhanced with WebMCP' };
}

export function generateRecommendations(form: FormInfo): ToolRecommendation[] {
  const analysis = analyzeForm(form);
  if (!analysis.isCandidate) return [];

  const recommendations: ToolRecommendation[] = [];

  // Declarative recommendation (easiest)
  recommendations.push({
    type: 'declarative',
    priority: 'high',
    description: `Add toolname/tooldescription attributes to form (action: ${form.action})`,
    code: generateDeclarativeHTML(form),
  });

  // Imperative recommendation (more powerful)
  const toolName = form.action.replace(/^\//, '').replace(/\//g, '-') || 'unnamed-tool';
  recommendations.push({
    type: 'imperative',
    priority: 'medium',
    description: `Register dynamic tool for ${form.action}`,
    code: generateImperativeCode({
      name: toolName,
      description: `Submit ${toolName} form programmatically`,
      inputSchema: {
        type: 'object',
        properties: Object.fromEntries(
          form.fields.map((f) => [f.name, { type: f.type === 'number' ? 'number' : 'string', description: f.label ?? f.name }])
        ),
        required: form.fields.filter((f) => f.required).map((f) => f.name),
      },
    }),
  });

  return recommendations;
}
