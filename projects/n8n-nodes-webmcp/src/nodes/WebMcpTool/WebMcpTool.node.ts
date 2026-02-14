import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

/**
 * Extract CSRF tokens from HTML page content.
 * Looks for common patterns: meta tags, hidden form fields.
 * Each pattern maps to a known field name via lookup table.
 */
function extractCsrfTokens(html: string): Record<string, string> {
  const tokens: Record<string, string> = {};

  // Meta tags: <meta name="csrf-token" content="...">
  // No 'g' flag - we only need the first match per pattern.
  const metaPatterns: Array<{ regex: RegExp; fieldName: string }> = [
    { regex: /name\s*=\s*["']csrf[-_]?token["']\s+content\s*=\s*["']([^"']+)["']/i, fieldName: 'csrf-token' },
    { regex: /content\s*=\s*["']([^"']+)["']\s+name\s*=\s*["']csrf[-_]?token["']/i, fieldName: 'csrf-token' },
    { regex: /name\s*=\s*["']_csrf["']\s+content\s*=\s*["']([^"']+)["']/i, fieldName: 'csrf-token' },
  ];
  for (const { regex, fieldName } of metaPatterns) {
    const match = regex.exec(html);
    if (match) {
      tokens[fieldName] = match[1];
      break;
    }
  }

  // Hidden input fields: <input type="hidden" name="_csrf" value="...">
  const hiddenPatterns: Array<{ regex: RegExp; fieldName: string }> = [
    { regex: /<input[^>]+name\s*=\s*["']_?csrf[-_]?token?["'][^>]+value\s*=\s*["']([^"']+)["']/i, fieldName: '_csrf_token' },
    { regex: /<input[^>]+value\s*=\s*["']([^"']+)["'][^>]+name\s*=\s*["']_?csrf[-_]?token?["']/i, fieldName: '_csrf_token' },
    { regex: /<input[^>]+name\s*=\s*["']authenticity_token["'][^>]+value\s*=\s*["']([^"']+)["']/i, fieldName: 'authenticity_token' },
    { regex: /<input[^>]+name\s*=\s*["']__RequestVerificationToken["'][^>]+value\s*=\s*["']([^"']+)["']/i, fieldName: '__RequestVerificationToken' },
  ];
  for (const { regex, fieldName } of hiddenPatterns) {
    const match = regex.exec(html);
    if (match) {
      tokens[fieldName] = match[1];
    }
  }

  return tokens;
}

export class WebMcpTool implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'WebMCP Tool',
    name: 'webMcpTool',
    icon: 'file:webmcp.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["toolName"]}}',
    description: 'Call a WebMCP tool exposed on a website',
    defaults: { name: 'WebMCP Tool' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'webMcpApi', required: false }],
    properties: [
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'options',
        options: [
          { name: 'Declarative (Form Submit)', value: 'declarative' },
          { name: 'Imperative (API Call)', value: 'imperative' },
        ],
        default: 'declarative',
        description: 'How to invoke the WebMCP tool',
      },
      {
        displayName: 'Site URL',
        name: 'siteUrl',
        type: 'string',
        default: '',
        placeholder: 'https://example.com',
        description: 'Base URL of the site with WebMCP tools',
        required: true,
      },
      {
        displayName: 'Tool Name',
        name: 'toolName',
        type: 'string',
        default: '',
        placeholder: 'search-products',
        description: 'The name of the WebMCP tool to call',
        required: true,
      },
      {
        displayName: 'Form Action Path',
        name: 'formAction',
        type: 'string',
        default: '',
        placeholder: '/api/search',
        description: 'The form action path (for declarative mode)',
        displayOptions: { show: { mode: ['declarative'] } },
      },
      {
        displayName: 'Input Parameters',
        name: 'inputParams',
        type: 'json',
        default: '{}',
        description: 'JSON object with input parameters for the tool',
        required: true,
      },
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
        ],
        default: 'POST',
        description: 'HTTP method for the tool call',
      },
      {
        displayName: 'Auto-detect CSRF Token',
        name: 'autoDetectCsrf',
        type: 'boolean',
        default: false,
        description: 'Whether to fetch the page first to extract CSRF tokens and include them in the request',
      },
      {
        displayName: 'Timeout (ms)',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Request timeout in milliseconds',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const mode = this.getNodeParameter('mode', i) as string;
      const siteUrl = this.getNodeParameter('siteUrl', i) as string;
      const toolName = this.getNodeParameter('toolName', i) as string;
      const inputParamsRaw = this.getNodeParameter('inputParams', i) as string;
      const method = this.getNodeParameter('method', i) as string;
      const timeout = this.getNodeParameter('timeout', i) as number;

      // Parse input parameters safely
      let inputParams: Record<string, unknown>;
      try {
        inputParams =
          typeof inputParamsRaw === 'string' ? JSON.parse(inputParamsRaw) : inputParamsRaw;
      } catch {
        returnData.push({
          json: {
            toolName,
            mode,
            success: false,
            error: 'Invalid JSON in inputParams',
          },
        });
        continue;
      }

      // Build headers with WebMCP identification
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-WebMCP-Tool': toolName,
        'X-Agent-Invoked': 'true',
      };

      // Get credentials if available
      try {
        const credentials = await this.getCredentials('webMcpApi');
        if (credentials?.apiKey) {
          headers['Authorization'] = `Bearer ${credentials.apiKey as string}`;
        }
        if (credentials?.customHeaders) {
          const customHeadersRaw = credentials.customHeaders as string;
          if (customHeadersRaw && customHeadersRaw !== '{}') {
            const custom = JSON.parse(customHeadersRaw);
            headers = { ...headers, ...custom };
          }
        }
      } catch {
        // No credentials configured, continue without authentication
      }

      try {
        // CSRF token auto-detection: fetch the page first to extract tokens
        const autoDetectCsrf = this.getNodeParameter('autoDetectCsrf', i) as boolean;
        if (autoDetectCsrf) {
          try {
            const pageHtml = await this.helpers.httpRequest({
              method: 'GET',
              url: siteUrl,
              timeout,
            });
            const csrfTokens = extractCsrfTokens(pageHtml as string);
            if (csrfTokens['csrf-token']) {
              headers['X-CSRF-Token'] = csrfTokens['csrf-token'];
              headers['X-XSRF-Token'] = csrfTokens['csrf-token'];
            }
            // Merge hidden field tokens into inputParams
            for (const [key, value] of Object.entries(csrfTokens)) {
              if (key !== 'csrf-token' && !(key in inputParams)) {
                inputParams[key] = value;
              }
            }
          } catch {
            // CSRF detection failed; proceed without tokens
          }
        }

        const startTime = Date.now();
        let url: string;
        let response: unknown;

        if (mode === 'declarative') {
          // Declarative mode: submit as a form would
          const formAction = this.getNodeParameter('formAction', i) as string;
          url = new URL(formAction || `/api/${toolName}`, siteUrl).toString();

          if (method === 'GET') {
            // Build query string from input params
            const params = new URLSearchParams(
              Object.entries(inputParams).map(([k, v]) => [k, String(v)]),
            );
            response = await this.helpers.httpRequest({
              method: 'GET',
              url: `${url}?${params.toString()}`,
              headers,
              timeout,
            });
          } else {
            // POST with JSON body
            response = await this.helpers.httpRequest({
              method: 'POST',
              url,
              body: inputParams,
              headers,
              timeout,
            });
          }
        } else {
          // Imperative mode: call the tool's WebMCP execute endpoint
          url = new URL(`/api/webmcp/${toolName}`, siteUrl).toString();
          response = await this.helpers.httpRequest({
            method: 'POST',
            url,
            body: { input: inputParams },
            headers,
            timeout,
          });
        }

        const duration = Date.now() - startTime;

        // Attempt to parse string responses as JSON
        let parsedResponse = response;
        if (typeof response === 'string') {
          try {
            parsedResponse = JSON.parse(response);
          } catch {
            // Response is not JSON, keep as string
            parsedResponse = { raw: response };
          }
        }

        returnData.push({
          json: {
            toolName,
            mode,
            success: true,
            duration,
            response: parsedResponse as Record<string, unknown>,
          },
        });
      } catch (error) {
        returnData.push({
          json: {
            toolName,
            mode,
            success: false,
            error: (error as Error).message,
          },
        });
      }
    }

    return [returnData];
  }
}
