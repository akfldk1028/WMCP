/**
 * Streamable HTTP transport for the MCP server.
 *
 * Simpler than SSE: client sends POST with JSON-RPC body,
 * server responds with JSON-RPC result directly.
 *
 * This is the recommended transport for Claude Code (SSE is deprecated).
 *
 * Auth: Bearer bsai_xxx (per-user key) or legacy BIZSCOPE_API_KEY env.
 * MCP requires a paid plan — free tier is rejected.
 */

import { handleMCPRequest } from './server';
import { resolveAuth, isLegacyEnvKey, unauthorizedResponse } from '@/lib/auth';

/**
 * Handle POST — Streamable HTTP transport.
 * Client sends JSON-RPC, server responds with JSON-RPC directly.
 */
export async function handleHTTPPost(request: Request): Promise<Response> {
  // Auth: per-user bsai_xxx key (paid only) or legacy env key
  const auth = await resolveAuth(request);
  if (auth.plan === 'free' && !isLegacyEnvKey(request)) {
    return unauthorizedResponse('MCP requires a paid API key. Get one at /pricing');
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const rpcRequest = body as {
    jsonrpc: '2.0';
    id?: string | number | null;
    method: string;
    params?: Record<string, unknown>;
  };

  const response = await handleMCPRequest(rpcRequest);

  // Notifications return null
  if (!response) {
    return new Response('', { status: 204 });
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
}
