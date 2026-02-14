import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

/**
 * Represents a WebMCP tool discovered on a webpage.
 */
interface DiscoveredTool {
  name: string;
  description: string;
  type: 'declarative' | 'imperative' | 'potential';
  inputSchema: Record<string, unknown>[];
  formAction: string;
}

/**
 * Parse HTML to find forms with WebMCP toolname/tooldescription attributes.
 * These are declarative WebMCP tools embedded directly in form markup.
 */
function parseDeclarativeForms(html: string): DiscoveredTool[] {
  const tools: DiscoveredTool[] = [];
  // Match forms, allowing quoted attribute values that may contain '>'
  // Handles: <form action="search?q=a>b" toolname="x">
  const formRegex = /<form\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  let formMatch: RegExpExecArray | null;

  while ((formMatch = formRegex.exec(html)) !== null) {
    const attrs = formMatch[1];

    // Check if this form has a toolname attribute
    const toolnameMatch = attrs.match(/toolname\s*=\s*["']([^"']*)["']/i);
    if (!toolnameMatch) continue;

    const name = toolnameMatch[1];

    // Extract tooldescription
    const descMatch = attrs.match(/tooldescription\s*=\s*["']([^"']*)["']/i);
    const description = descMatch ? descMatch[1] : '';

    // Extract action
    const actionMatch = attrs.match(/action\s*=\s*["']([^"']*)["']/i);
    const formAction = actionMatch ? actionMatch[1] : '';

    // Extract method
    const methodMatch = attrs.match(/method\s*=\s*["']([^"']*)["']/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    // Find the closing </form> tag to get the form body
    const formStartIndex = formMatch.index;
    const closingFormRegex = /<\/form>/gi;
    closingFormRegex.lastIndex = formStartIndex;
    const closingMatch = closingFormRegex.exec(html);
    const formEndIndex = closingMatch
      ? closingMatch.index + closingMatch[0].length
      : html.length;
    const formBody = html.substring(formStartIndex, formEndIndex);

    // Parse input fields within the form
    const inputSchema = parseInputFields(formBody);

    tools.push({
      name,
      description,
      type: 'declarative',
      inputSchema: inputSchema.map((field) => ({
        ...field,
        method,
      })),
      formAction,
    });
  }

  return tools;
}

/**
 * Extract a balanced brace block starting at the given position.
 * Returns the content between (and including) the outermost braces.
 * Skips braces inside string literals ('...', "...", `...`).
 */
function extractBalancedBraces(text: string, startIndex: number): string | null {
  if (text[startIndex] !== '{') return null;
  let depth = 0;
  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];

    // Skip string literals
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipStringLiteral(text, i);
      continue;
    }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.substring(startIndex, i + 1);
    }
  }
  return null; // Unbalanced
}

/**
 * Advance past a string literal starting at `start`.
 * Returns the index of the closing quote.
 * Handles escape sequences (\" \' \`).
 */
function skipStringLiteral(text: string, start: number): number {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') {
      i++; // Skip escaped character
      continue;
    }
    if (text[i] === quote) return i;
  }
  return text.length - 1; // Unterminated string
}

/**
 * Parse HTML to find registerTool() calls in script tags.
 * These are imperative WebMCP tools registered via JavaScript.
 * Uses balanced brace matching to handle nested objects correctly.
 */
function parseImperativeScripts(html: string): DiscoveredTool[] {
  const tools: DiscoveredTool[] = [];

  // Extract all script tag contents
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const scriptContent = scriptMatch[1];

    // Find registerTool calls and use balanced brace matching
    const callPattern = /(?:navigator\.modelContext\.)?registerTool\s*\(\s*\{/g;
    let callMatch: RegExpExecArray | null;

    while ((callMatch = callPattern.exec(scriptContent)) !== null) {
      // Position of the opening brace
      const braceStart = callMatch.index + callMatch[0].length - 1;
      const block = extractBalancedBraces(scriptContent, braceStart);
      if (!block) continue;

      const toolConfig = block.slice(1, -1); // Strip outer braces

      // Extract name
      const nameMatch = toolConfig.match(/name\s*:\s*['"]([^'"]+)['"]/);
      if (!nameMatch) continue;
      const name = nameMatch[1];

      // Extract description
      const descMatch = toolConfig.match(/description\s*:\s*['"]([^'"]+)['"]/);
      const description = descMatch ? descMatch[1] : '';

      // Extract input schema using balanced braces for nested objects
      const inputSchema: Record<string, unknown>[] = [];
      const propsPattern = /properties\s*:\s*\{/;
      const propsMatch = propsPattern.exec(toolConfig);

      if (propsMatch) {
        const propsStart = propsMatch.index + propsMatch[0].length - 1;
        const propsBlock = extractBalancedBraces(toolConfig, propsStart);
        if (propsBlock) {
          const propsContent = propsBlock.slice(1, -1);
          // Match each property using balanced braces
          const propPattern = /(\w+)\s*:\s*\{/g;
          let propMatch: RegExpExecArray | null;

          while ((propMatch = propPattern.exec(propsContent)) !== null) {
            const propName = propMatch[1];
            const propStart = propMatch.index + propMatch[0].length - 1;
            const propBlock = extractBalancedBraces(propsContent, propStart);
            if (!propBlock) continue;

            const propBody = propBlock.slice(1, -1);
            const typeMatch = propBody.match(/type\s*:\s*['"]([^'"]+)['"]/);
            const propDescMatch = propBody.match(/description\s*:\s*['"]([^'"]+)['"]/);

            inputSchema.push({
              name: propName,
              type: typeMatch ? typeMatch[1] : 'string',
              description: propDescMatch ? propDescMatch[1] : '',
            });
          }
        }
      }

      tools.push({
        name,
        description,
        type: 'imperative',
        inputSchema,
        formAction: '',
      });

      // Advance past the matched block
      callPattern.lastIndex = braceStart + (block?.length ?? 1);
    }
  }

  return tools;
}

/**
 * Parse regular HTML forms that might be used as WebMCP tools.
 * These are "potential" tools - standard forms that could be WebMCP-enabled.
 */
function parsePotentialForms(html: string, knownToolNames: Set<string>): DiscoveredTool[] {
  const tools: DiscoveredTool[] = [];
  const formRegex = /<form\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  let formMatch: RegExpExecArray | null;

  while ((formMatch = formRegex.exec(html)) !== null) {
    const attrs = formMatch[1];

    // Skip forms already identified as declarative tools
    if (/toolname\s*=/i.test(attrs)) continue;

    // Extract action
    const actionMatch = attrs.match(/action\s*=\s*["']([^"']*)["']/i);
    const formAction = actionMatch ? actionMatch[1] : '';

    // Extract method
    const methodMatch = attrs.match(/method\s*=\s*["']([^"']*)["']/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    // Extract id or name for the tool name
    const idMatch = attrs.match(/id\s*=\s*["']([^"']*)["']/i);
    const nameAttrMatch = attrs.match(/name\s*=\s*["']([^"']*)["']/i);
    const name = idMatch ? idMatch[1] : nameAttrMatch ? nameAttrMatch[1] : `form-${formAction}`;

    // Skip if this name was already found as a declarative/imperative tool
    if (knownToolNames.has(name)) continue;

    // Find form body
    const formStartIndex = formMatch.index;
    const closingFormRegex = /<\/form>/gi;
    closingFormRegex.lastIndex = formStartIndex;
    const closingMatch = closingFormRegex.exec(html);
    const formEndIndex = closingMatch
      ? closingMatch.index + closingMatch[0].length
      : html.length;
    const formBody = html.substring(formStartIndex, formEndIndex);

    // Parse input fields
    const inputSchema = parseInputFields(formBody);

    // Only include forms that have at least one input field
    if (inputSchema.length === 0) continue;

    tools.push({
      name,
      description: `Form: ${formAction || name} (${method})`,
      type: 'potential',
      inputSchema: inputSchema.map((field) => ({
        ...field,
        method,
      })),
      formAction,
    });
  }

  return tools;
}

/**
 * Parse input fields from a form HTML fragment.
 * Extracts name, type, placeholder, and required status from input, select, and textarea elements.
 */
function parseInputFields(formHtml: string): Record<string, unknown>[] {
  const fields: Record<string, unknown>[] = [];
  const seenNames = new Set<string>();

  // Match <input> elements
  const inputRegex = /<input\b([^>]*)>/gi;
  let inputMatch: RegExpExecArray | null;

  while ((inputMatch = inputRegex.exec(formHtml)) !== null) {
    const attrs = inputMatch[1];

    const nameMatch = attrs.match(/name\s*=\s*["']([^"']*)["']/i);
    if (!nameMatch) continue;

    const fieldName = nameMatch[1];
    if (seenNames.has(fieldName)) continue;
    seenNames.add(fieldName);

    const typeMatch = attrs.match(/type\s*=\s*["']([^"']*)["']/i);
    const fieldType = typeMatch ? typeMatch[1] : 'text';

    // Skip hidden and submit inputs
    if (fieldType === 'hidden' || fieldType === 'submit' || fieldType === 'button') continue;

    const placeholderMatch = attrs.match(/placeholder\s*=\s*["']([^"']*)["']/i);
    const requiredPresent = /\brequired\b/i.test(attrs);

    fields.push({
      name: fieldName,
      type: fieldType,
      placeholder: placeholderMatch ? placeholderMatch[1] : '',
      required: requiredPresent,
    });
  }

  // Match <textarea> elements
  const textareaRegex = /<textarea\b([^>]*)>/gi;
  let textareaMatch: RegExpExecArray | null;

  while ((textareaMatch = textareaRegex.exec(formHtml)) !== null) {
    const attrs = textareaMatch[1];

    const nameMatch = attrs.match(/name\s*=\s*["']([^"']*)["']/i);
    if (!nameMatch) continue;

    const fieldName = nameMatch[1];
    if (seenNames.has(fieldName)) continue;
    seenNames.add(fieldName);

    const placeholderMatch = attrs.match(/placeholder\s*=\s*["']([^"']*)["']/i);
    const requiredPresent = /\brequired\b/i.test(attrs);

    fields.push({
      name: fieldName,
      type: 'textarea',
      placeholder: placeholderMatch ? placeholderMatch[1] : '',
      required: requiredPresent,
    });
  }

  // Match <select> elements
  const selectRegex = /<select\b([^>]*)>[\s\S]*?<\/select>/gi;
  let selectMatch: RegExpExecArray | null;

  while ((selectMatch = selectRegex.exec(formHtml)) !== null) {
    const attrs = selectMatch[1];

    const nameMatch = attrs.match(/name\s*=\s*["']([^"']*)["']/i);
    if (!nameMatch) continue;

    const fieldName = nameMatch[1];
    if (seenNames.has(fieldName)) continue;
    seenNames.add(fieldName);

    const requiredPresent = /\brequired\b/i.test(attrs);

    // Extract options
    const optionRegex = /<option\b[^>]*value\s*=\s*["']([^"']*)["'][^>]*>([^<]*)<\/option>/gi;
    const options: { value: string; label: string }[] = [];
    let optionMatch: RegExpExecArray | null;
    const selectBody = selectMatch[0];

    while ((optionMatch = optionRegex.exec(selectBody)) !== null) {
      options.push({
        value: optionMatch[1],
        label: optionMatch[2].trim(),
      });
    }

    fields.push({
      name: fieldName,
      type: 'select',
      options,
      required: requiredPresent,
    });
  }

  return fields;
}

/**
 * Main parsing function that orchestrates all three discovery methods.
 */
function parseWebMCPTools(
  html: string,
  includeForms: boolean,
  includeScripts: boolean,
): DiscoveredTool[] {
  const tools: DiscoveredTool[] = [];

  // 1. Always scan for declarative WebMCP forms (forms with toolname attribute)
  const declarativeTools = parseDeclarativeForms(html);
  tools.push(...declarativeTools);

  // 2. Scan scripts for registerTool calls if enabled
  if (includeScripts) {
    const imperativeTools = parseImperativeScripts(html);
    tools.push(...imperativeTools);
  }

  // 3. Scan regular forms as potential tools if enabled
  if (includeForms) {
    const knownNames = new Set(tools.map((t) => t.name));
    const potentialTools = parsePotentialForms(html, knownNames);
    tools.push(...potentialTools);
  }

  return tools;
}

export class WebMcpScan implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'WebMCP Scan',
    name: 'webMcpScan',
    icon: 'file:webmcp.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["url"]}}',
    description: 'Discover WebMCP tools exposed on a website',
    defaults: { name: 'WebMCP Scan' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'webMcpApi', required: false }],
    properties: [
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        placeholder: 'https://example.com',
        description: 'URL of the page to scan for WebMCP tools',
        required: true,
      },
      {
        displayName: 'Include Forms',
        name: 'includeForms',
        type: 'boolean',
        default: true,
        description: 'Whether to include HTML forms that could be WebMCP-enabled',
      },
      {
        displayName: 'Include Scripts',
        name: 'includeScripts',
        type: 'boolean',
        default: true,
        description: 'Whether to scan inline scripts for registerTool calls',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const url = this.getNodeParameter('url', i) as string;
      const includeForms = this.getNodeParameter('includeForms', i) as boolean;
      const includeScripts = this.getNodeParameter('includeScripts', i) as boolean;

      try {
        // Fetch the page HTML
        const html = await this.helpers.httpRequest({
          method: 'GET',
          url,
          returnFullResponse: false,
        });

        // Parse HTML for WebMCP tools
        const tools = parseWebMCPTools(html as string, includeForms, includeScripts);

        // Emit one item per discovered tool
        for (const tool of tools) {
          returnData.push({
            json: {
              url,
              toolName: tool.name,
              toolDescription: tool.description,
              type: tool.type,
              inputSchema: tool.inputSchema,
              formAction: tool.formAction,
            },
          });
        }

        // If no tools found, emit a single informational item
        if (tools.length === 0) {
          returnData.push({
            json: {
              url,
              toolCount: 0,
              message: 'No WebMCP tools found on this page',
            },
          });
        }
      } catch (error) {
        returnData.push({
          json: {
            url,
            error: (error as Error).message,
          },
        });
      }
    }

    return [returnData];
  }
}
