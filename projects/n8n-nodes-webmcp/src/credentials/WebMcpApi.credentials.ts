import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class WebMcpApi implements ICredentialType {
  name = 'webMcpApi';
  displayName = 'WebMCP API';
  documentationUrl = 'https://github.com/nicepkg/wmcp';
  properties: INodeProperties[] = [
    {
      displayName: 'Target Site URL',
      name: 'siteUrl',
      type: 'string',
      default: '',
      placeholder: 'https://example.com',
      description: 'The base URL of the website exposing WebMCP tools',
    },
    {
      displayName: 'API Key (Optional)',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Optional API key if the site requires authentication for tool calls',
    },
    {
      displayName: 'Custom Headers',
      name: 'customHeaders',
      type: 'json',
      default: '{}',
      description: 'Optional custom headers to send with requests (JSON object)',
    },
  ];
}
