/**
 * Anthropic API client for Chrome MV3 background service worker.
 * Direct fetch — no SDK, no dependencies.
 * The background SW has CORS exemption so browser-direct calls work.
 */

import type { AgentErrorCode } from '../types.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1_000;
const FETCH_TIMEOUT_MS = 30_000;

export type { AgentErrorCode };

export class AgentError extends Error {
  readonly code: AgentErrorCode;

  constructor(code: AgentErrorCode, message: string) {
    super(message);
    this.name = 'AgentError';
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Internal: Anthropic response shape (subset we care about)
// ---------------------------------------------------------------------------

interface AnthropicContentBlock {
  type: string;
  text: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': ANTHROPIC_VERSION,
    'anthropic-dangerous-direct-browser-access': 'true',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapStatusToError(status: number, body: string): AgentError {
  if (status === 401) {
    return new AgentError('auth', `Authentication failed: ${body}`);
  }
  if (status === 429) {
    return new AgentError('rate_limit', `Rate limited after retries: ${body}`);
  }
  if (status === 529) {
    return new AgentError('overloaded', `API overloaded: ${body}`);
  }
  return new AgentError('unknown', `API error ${status}: ${body}`);
}

/**
 * Low-level fetch with retry on 429.
 * Returns the parsed JSON body on success, throws `AgentError` otherwise.
 */
async function fetchWithRetry(
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<AnthropicResponse> {
  let lastStatus = 0;
  let lastBody = '';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // On retries (attempt > 0), wait with exponential backoff: 1s, 2s, 4s
    if (attempt > 0) {
      await sleep(INITIAL_BACKOFF_MS * 2 ** (attempt - 1));
    }

    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      response = await fetch(API_URL, {
        method: 'POST',
        headers: buildHeaders(apiKey),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (err: unknown) {
      // Network-level failure (offline, DNS, timeout, etc.)
      const message =
        err instanceof Error ? err.message : 'Unknown network error';
      throw new AgentError('network', message);
    }

    lastStatus = response.status;
    lastBody = await response.text();

    // Success
    if (response.ok) {
      try {
        return JSON.parse(lastBody) as AnthropicResponse;
      } catch {
        throw new AgentError('unknown', `Invalid JSON response: ${lastBody}`);
      }
    }

    // Retry only on 429 and only if we have attempts left
    if (response.status === 429 && attempt < MAX_RETRIES) {
      continue;
    }

    // Non-retryable error or retries exhausted
    break;
  }

  throw mapStatusToError(lastStatus, lastBody);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a single-turn message to the Anthropic Messages API and return the
 * assistant's text response.
 *
 * @param apiKey       - Anthropic API key
 * @param model        - Model identifier (e.g. "claude-sonnet-4-20250514")
 * @param systemPrompt - System prompt
 * @param userMessage  - User message content
 * @returns The text content of the first response block
 * @throws {AgentError} on auth, rate-limit, overload, network, or unknown errors
 */
export async function callClaude(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const payload = {
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  };

  const data = await fetchWithRetry(apiKey, payload);

  const text = data?.content?.[0]?.text;
  if (typeof text !== 'string') {
    throw new AgentError(
      'unknown',
      `Unexpected response shape: ${JSON.stringify(data)}`,
    );
  }

  return text;
}

/**
 * Validate an API key by making a minimal test call (1 max token).
 * Returns `true` if the key is valid, `false` if authentication fails.
 * Throws on network or other non-auth errors.
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  const payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1,
    messages: [{ role: 'user', content: 'Hi' }],
  };

  try {
    await fetchWithRetry(apiKey, payload);
    return true;
  } catch (err: unknown) {
    if (err instanceof AgentError && err.code === 'auth') {
      return false;
    }
    throw err;
  }
}
