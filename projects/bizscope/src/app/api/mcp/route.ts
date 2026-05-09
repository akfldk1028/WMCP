import { handleSSEGet, handleSSEPost } from '@/mcp/transport-sse';
import { handleHTTPPost } from '@/mcp/transport-http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * MCP endpoint — supports both Streamable HTTP and legacy SSE transports.
 *
 * Streamable HTTP (recommended):
 *   POST /api/mcp  (Content-Type: application/json, no sessionId)
 *   → JSON-RPC response directly
 *
 * Legacy SSE:
 *   GET  /api/mcp            → SSE stream + sessionId
 *   POST /api/mcp?sessionId= → JSON-RPC via SSE stream
 *
 * Auth: Bearer token via BIZSCOPE_API_KEY env var (optional).
 */
export function GET(request: Request) {
  return handleSSEGet(request);
}

export function POST(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  // If sessionId present → legacy SSE transport
  if (sessionId) {
    return handleSSEPost(request);
  }

  // Otherwise → Streamable HTTP transport
  return handleHTTPPost(request);
}
