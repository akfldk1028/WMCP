# n8n Workflow Modules

Import these JSON files into n8n for business automation.

## Workflows

| File | Purpose | Trigger |
|------|---------|---------|
| `lead-gen.json` | Find potential WebMCP clients | Schedule (weekly) |
| `content-publish.json` | Auto-publish blog/social content | Schedule or webhook |
| `monitoring.json` | Monitor competitor sites & WebMCP adoption | Schedule (daily) |
| `deploy.json` | Deploy projects to Vercel/Cloudflare | Git push webhook |

## Setup
1. Import JSON into n8n (Settings > Import Workflow)
2. Configure credentials (API keys, etc.)
3. Activate workflows

## n8n Installation
```bash
npx n8n          # Quick start
# or
docker run -p 5678:5678 n8nio/n8n  # Docker
```
