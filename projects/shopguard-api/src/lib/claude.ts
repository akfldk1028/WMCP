/** Server-side Claude Haiku client (direct fetch, no SDK) */

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 30_000;

export async function callClaudeHaiku(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Claude API ${res.status}: ${body}`);
    }

    const data = await res.json();
    return data?.content?.[0]?.text ?? '';
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
