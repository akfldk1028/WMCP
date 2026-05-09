/**
 * BizScope AI — Brainstorm engine (multi-model debate).
 *
 * Lightweight wrapper around brainstorm-mcp's core debate logic.
 * Uses OpenAI-compatible API to call multiple models in parallel,
 * then synthesizes results. No MCP server needed — runs inline.
 *
 * Providers auto-detected from env vars:
 *   OPENAI_API_KEY → openai:gpt-4o
 *   DEEPSEEK_API_KEY → deepseek:deepseek-chat
 *   GOOGLE_GEMINI_API_KEY → gemini:gemini-2.5-flash
 *   XAI_API_KEY → xai:grok-3-mini
 */

import OpenAI from 'openai';

// --- Types ---

export interface BrainstormModel {
  id: string;       // "openai:gpt-4o"
  provider: string;
  modelId: string;
  baseURL: string;
  apiKey: string;
}

export interface RoundResponse {
  modelId: string;
  round: number;
  content: string;
  error?: string;
}

export interface BrainstormResult {
  topic: string;
  rounds: RoundResponse[][];
  synthesis: string;
  modelCount: number;
  totalDurationMs: number;
}

export type ProgressCallback = (message: string) => void;

// --- Provider detection ---

const PROVIDERS: Record<string, { baseURL: string; defaultModel: string; envKey: string }> = {
  openai: { baseURL: 'https://api.openai.com/v1', defaultModel: 'gpt-4o', envKey: 'OPENAI_API_KEY' },
  deepseek: { baseURL: 'https://api.deepseek.com', defaultModel: 'deepseek-chat', envKey: 'DEEPSEEK_API_KEY' },
  gemini: { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai', defaultModel: 'gemini-2.5-flash', envKey: 'GOOGLE_GEMINI_API_KEY' },
  xai: { baseURL: 'https://api.x.ai/v1', defaultModel: 'grok-3-mini', envKey: 'XAI_API_KEY' },
};

export function getAvailableModels(): BrainstormModel[] {
  const models: BrainstormModel[] = [];
  for (const [provider, config] of Object.entries(PROVIDERS)) {
    const apiKey = process.env[config.envKey];
    if (!apiKey) continue;
    models.push({
      id: `${provider}:${config.defaultModel}`,
      provider,
      modelId: config.defaultModel,
      baseURL: config.baseURL,
      apiKey,
    });
  }
  return models;
}

// --- OpenAI client cache ---

const clientCache = new Map<string, OpenAI>();

function getClient(model: BrainstormModel): OpenAI {
  const key = `${model.baseURL}::${model.provider}`;
  const cached = clientCache.get(key);
  if (cached) return cached;
  const client = new OpenAI({ apiKey: model.apiKey, baseURL: model.baseURL });
  clientCache.set(key, client);
  return client;
}

// --- Model calling ---

const MODEL_TIMEOUT_MS = 120_000;

async function callModel(model: BrainstormModel, system: string, user: string): Promise<string> {
  const client = getClient(model);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const response = await client.chat.completions.create(
      {
        model: model.modelId,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      },
      { signal: controller.signal },
    );
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error(`${model.id} returned empty response`);
    return content;
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) {
      throw new Error(`${model.id} timed out after ${MODEL_TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// --- Prompts ---

const ROUND1_SYSTEM = 'You are participating in a multi-model brainstorming debate. Provide your best thinking on the given topic. Be specific, creative, and substantive.';

function roundNSystem(round: number, total: number): string {
  return `You are in round ${round} of ${total} of a multi-model brainstorming debate. You can see all previous responses. Build upon the best ideas, challenge weak reasoning, add new perspectives, and refine your position.`;
}

const SYNTHESIS_SYSTEM = `You are the synthesizer in a multi-model brainstorming debate. Produce a structured verdict:

## Recommendation
One clear, opinionated recommendation (2-3 sentences max).

## Key Tradeoffs
The 2-3 most important tradeoffs (bullet points).

## Strongest Disagreement
The single most important unresolved disagreement — state each side's strongest argument.

Be thorough but concise. Prioritize actionable insight over comprehensiveness.`;

function buildHistory(rounds: RoundResponse[][]): string {
  const sections: string[] = [];
  for (let r = 0; r < rounds.length; r++) {
    const lines = [`--- Round ${r + 1} ---`];
    for (const resp of rounds[r]) {
      if (resp.error) {
        lines.push(`[${resp.modelId}] (FAILED: ${resp.error})`);
      } else {
        const content = resp.content.length > 3000
          ? resp.content.slice(0, 3000) + '\n[...truncated]'
          : resp.content;
        lines.push(`[${resp.modelId}]:\n${content}`);
      }
    }
    sections.push(lines.join('\n'));
  }
  return sections.join('\n\n');
}

// --- Public API ---

/**
 * Run a multi-model brainstorm debate.
 * Auto-detects available providers from env vars.
 * Returns synthesis + all round responses.
 */
export async function runBrainstorm(
  topic: string,
  options?: {
    rounds?: number;
    context?: string;
    onProgress?: ProgressCallback;
  },
): Promise<BrainstormResult> {
  const startTime = Date.now();
  const rounds = options?.rounds ?? 2;
  const log = options?.onProgress ?? (() => {});
  const fullTopic = options?.context ? `Context:\n${options.context}\n\nTopic: ${topic}` : topic;

  const models = getAvailableModels();
  if (models.length === 0) {
    throw new Error('No AI providers configured. Set OPENAI_API_KEY, DEEPSEEK_API_KEY, or GOOGLE_GEMINI_API_KEY.');
  }

  log(`Starting brainstorm: ${models.length} models, ${rounds} rounds`);

  const allRounds: RoundResponse[][] = [];

  // Round 1
  log(`Round 1/${rounds}: ${models.map((m) => m.id).join(', ')}...`);
  const r1Results = await Promise.allSettled(
    models.map((m) => callModel(m, ROUND1_SYSTEM, fullTopic)),
  );
  allRounds.push(r1Results.map((r, i) => ({
    modelId: models[i].id,
    round: 1,
    content: r.status === 'fulfilled' ? r.value : '',
    error: r.status === 'rejected' ? (r.reason as Error).message : undefined,
  })));

  // Rounds 2-N
  for (let r = 2; r <= rounds; r++) {
    log(`Round ${r}/${rounds}: refining...`);
    const history = buildHistory(allRounds);
    const userMsg = `Original topic: ${fullTopic}\n\n${history}\n\nProvide your refined response for round ${r}.`;

    const results = await Promise.allSettled(
      models.map((m) => callModel(m, roundNSystem(r, rounds), userMsg)),
    );
    allRounds.push(results.map((res, i) => ({
      modelId: models[i].id,
      round: r,
      content: res.status === 'fulfilled' ? res.value : '',
      error: res.status === 'rejected' ? (res.reason as Error).message : undefined,
    })));
  }

  // Synthesis
  log('Synthesizing...');
  const history = buildHistory(allRounds);
  const synthMsg = `Original topic: ${fullTopic}\n\n${history}\n\nSynthesize the above debate into a structured verdict.`;

  let synthesis: string;
  try {
    synthesis = await callModel(models[0], SYNTHESIS_SYSTEM, synthMsg);
  } catch {
    // Fallback to second model
    if (models.length > 1) {
      try {
        synthesis = await callModel(models[1], SYNTHESIS_SYSTEM, synthMsg);
      } catch {
        synthesis = 'Synthesis failed — review the raw debate rounds above.';
      }
    } else {
      synthesis = 'Synthesis failed — review the raw debate rounds above.';
    }
  }

  const totalDurationMs = Date.now() - startTime;
  log(`Done in ${(totalDurationMs / 1000).toFixed(1)}s`);

  return {
    topic,
    rounds: allRounds,
    synthesis,
    modelCount: models.length,
    totalDurationMs,
  };
}

/**
 * Quick parallel opinions — single round, no debate.
 * Faster than full brainstorm for quick decisions.
 */
export async function quickBrainstorm(
  topic: string,
  context?: string,
): Promise<{ opinions: Array<{ model: string; content: string; error?: string }>; modelCount: number }> {
  const models = getAvailableModels();
  if (models.length === 0) {
    throw new Error('No AI providers configured.');
  }

  const fullTopic = context ? `Context:\n${context}\n\nTopic: ${topic}` : topic;

  const results = await Promise.allSettled(
    models.map((m) => callModel(m, ROUND1_SYSTEM, fullTopic)),
  );

  return {
    opinions: results.map((r, i) => ({
      model: models[i].id,
      content: r.status === 'fulfilled' ? r.value : '',
      error: r.status === 'rejected' ? (r.reason as Error).message : undefined,
    })),
    modelCount: models.length,
  };
}
