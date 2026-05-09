#!/usr/bin/env node

/**
 * @wmcp/bizscope-mcp — Stdio proxy for BizScope AI MCP server.
 *
 * Reads JSON-RPC from stdin, forwards to remote BizScope Streamable HTTP endpoint,
 * writes JSON-RPC responses to stdout.
 *
 * Usage:
 *   claude mcp add bizscope -- npx -y @wmcp/bizscope-mcp
 *   claude mcp add bizscope -- npx -y @wmcp/bizscope-mcp --key YOUR_API_KEY
 */

const REMOTE_URL = process.env.BIZSCOPE_MCP_URL || 'https://bizscope-rho.vercel.app/api/mcp';
// Supports both personal bsai_xxx keys and legacy BIZSCOPE_API_KEY
const API_KEY = process.env.BIZSCOPE_API_KEY || parseKeyArg();

function parseKeyArg() {
  const idx = process.argv.indexOf('--key');
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : '';
}

let buffer = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;

  // Try to parse complete JSON-RPC messages (newline-delimited)
  let newlineIdx;
  while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIdx).trim();
    buffer = buffer.slice(newlineIdx + 1);
    if (line) handleLine(line);
  }

  // Also try to parse if buffer looks like complete JSON (no newline yet)
  if (buffer.trim()) {
    try {
      JSON.parse(buffer.trim());
      const line = buffer.trim();
      buffer = '';
      handleLine(line);
    } catch {
      // Incomplete JSON, wait for more data
    }
  }
});

process.stdin.on('end', () => {
  process.exit(0);
});

async function handleLine(line) {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    writeError(null, -32700, 'Parse error');
    return;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

  try {
    const res = await fetch(REMOTE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (res.status === 204) return; // notification, no response
    if (res.status === 401) {
      writeError(request.id ?? null, -32001, 'Unauthorized — set BIZSCOPE_API_KEY or use --key');
      return;
    }

    const json = await res.json();
    process.stdout.write(JSON.stringify(json) + '\n');
  } catch (err) {
    writeError(request.id ?? null, -32603, `Remote error: ${err.message}`);
  }
}

function writeError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n');
}
