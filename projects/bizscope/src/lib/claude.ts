/**
 * Multi-provider AI client.
 * Auto-detects available API key and uses the corresponding provider.
 *
 * Priority: Anthropic > OpenAI > xAI (Grok) > Google Gemini
 */

type Provider = 'anthropic' | 'openai' | 'xai' | 'gemini';

interface ProviderConfig {
  provider: Provider;
  model: string;
  apiKey: string;
}

function detectProvider(): ProviderConfig {
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      apiKey: process.env.ANTHROPIC_API_KEY,
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY,
    };
  }
  if (process.env.XAI_API_KEY) {
    return {
      provider: 'xai',
      model: 'grok-3-mini',
      apiKey: process.env.XAI_API_KEY,
    };
  }
  if (process.env.GOOGLE_GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    };
  }
  throw new Error(
    'AI API 키가 설정되지 않았습니다. .env.local에 ANTHROPIC_API_KEY, OPENAI_API_KEY, XAI_API_KEY, 또는 GOOGLE_GEMINI_API_KEY 중 하나를 설정하세요.',
  );
}

// --- Cached config + clients ---

let cachedConfig: ProviderConfig | null = null;
let cachedAnthropicClient: InstanceType<typeof import('@anthropic-ai/sdk').default> | null = null;
let cachedOpenAIClient: InstanceType<typeof import('openai').default> | null = null;

function getConfig(): ProviderConfig {
  if (!cachedConfig) {
    cachedConfig = detectProvider();
    console.log(`[BizScope AI] Provider: ${cachedConfig.provider} (${cachedConfig.model})`);
  }
  return cachedConfig;
}

// --- Anthropic ---
async function callAnthropic(
  config: ProviderConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  if (!cachedAnthropicClient) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    cachedAnthropicClient = new Anthropic({ apiKey: config.apiKey });
  }
  const response = await cachedAnthropicClient.messages.create({
    model: config.model,
    max_tokens: 8192,
    temperature: 0.3,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('Anthropic returned no text content');
  }
  return block.text;
}

// --- OpenAI / xAI (OpenAI-compatible) ---
async function callOpenAI(
  config: ProviderConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  if (!cachedOpenAIClient || cachedOpenAIClient.baseURL !== (config.provider === 'xai' ? 'https://api.x.ai/v1' : undefined)) {
    const { default: OpenAI } = await import('openai');
    cachedOpenAIClient = new OpenAI({
      apiKey: config.apiKey,
      ...(config.provider === 'xai' ? { baseURL: 'https://api.x.ai/v1' } : {}),
    });
  }
  const response = await cachedOpenAIClient.chat.completions.create({
    model: config.model,
    max_tokens: 8192,
    temperature: 0.3,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });
  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error(`${config.provider} returned no content`);
  }
  return text;
}

// --- Google Gemini ---
async function callGemini(
  config: ProviderConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({
    model: config.model,
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userMessage);
  const text = result.response.text();
  if (!text) {
    throw new Error('Gemini returned no content');
  }
  return text;
}

// --- Public API ---

export async function generateSection(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const config = getConfig();

  switch (config.provider) {
    case 'anthropic':
      return callAnthropic(config, systemPrompt, userMessage);
    case 'openai':
    case 'xai':
      return callOpenAI(config, systemPrompt, userMessage);
    case 'gemini':
      return callGemini(config, systemPrompt, userMessage);
  }
}

// --- Multi-model ensemble for cross-validation ---

function getAllProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({ provider: 'anthropic', model: 'claude-sonnet-4-20250514', apiKey: process.env.ANTHROPIC_API_KEY });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({ provider: 'openai', model: 'gpt-4o', apiKey: process.env.OPENAI_API_KEY });
  }
  if (process.env.XAI_API_KEY) {
    providers.push({ provider: 'xai', model: 'grok-3-mini', apiKey: process.env.XAI_API_KEY });
  }
  if (process.env.GOOGLE_GEMINI_API_KEY) {
    providers.push({ provider: 'gemini', model: 'gemini-2.5-flash', apiKey: process.env.GOOGLE_GEMINI_API_KEY });
  }
  return providers;
}

async function callProvider(
  config: ProviderConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  switch (config.provider) {
    case 'anthropic':
      return callAnthropic(config, systemPrompt, userMessage);
    case 'openai':
    case 'xai':
      return callOpenAI(config, systemPrompt, userMessage);
    case 'gemini':
      return callGemini(config, systemPrompt, userMessage);
  }
}

export interface EnsembleResult {
  text: string;
  provider: string;
  allScores: { provider: string; score: number }[];
  medianScore: number;
}

/**
 * Call all available AI providers in parallel for cross-validation.
 * Returns the result from the provider closest to the median totalScore.
 */
export async function generateWithEnsemble(
  systemPrompt: string,
  userMessage: string,
): Promise<EnsembleResult> {
  const providers = getAllProviders();
  if (providers.length === 0) {
    throw new Error('AI API 키가 설정되지 않았습니다.');
  }

  // Single provider — skip ensemble overhead
  if (providers.length === 1) {
    const text = await callProvider(providers[0], systemPrompt, userMessage);
    return { text, provider: providers[0].provider, allScores: [], medianScore: 0 };
  }

  console.log(`[BizScope AI Ensemble] Running ${providers.length} providers: ${providers.map(p => p.provider).join(', ')}`);

  const results = await Promise.allSettled(
    providers.map(async (config) => {
      const text = await callProvider(config, systemPrompt, userMessage);
      return { text, provider: config.provider };
    }),
  );

  const successes = results
    .filter((r): r is PromiseFulfilledResult<{ text: string; provider: Provider }> => r.status === 'fulfilled')
    .map((r) => r.value);

  if (successes.length === 0) {
    throw new Error('All providers failed in ensemble call');
  }

  if (successes.length === 1) {
    return { text: successes[0].text, provider: successes[0].provider, allScores: [], medianScore: 0 };
  }

  // Extract totalScore from each result for median selection
  const scored: { text: string; provider: string; score: number }[] = [];
  for (const s of successes) {
    try {
      const jsonMatch = s.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;
      const parsed = JSON.parse(jsonMatch[0]);
      const score = Number(parsed?.scoreCard?.totalScore ?? parsed?.verdict?.score);
      if (!isNaN(score)) scored.push({ ...s, score });
    } catch {
      // skip unparseable results
    }
  }

  if (scored.length === 0) {
    return { text: successes[0].text, provider: successes[0].provider, allScores: [], medianScore: 0 };
  }

  scored.sort((a, b) => a.score - b.score);

  const mid = Math.floor(scored.length / 2);
  const medianScore = scored.length % 2 === 0
    ? Math.round(((scored[mid - 1].score + scored[mid].score) / 2) * 10) / 10
    : scored[mid].score;

  // Pick result closest to median (outlier rejection)
  let closest = scored[0];
  let closestDiff = Math.abs(scored[0].score - medianScore);
  for (const s of scored) {
    const diff = Math.abs(s.score - medianScore);
    if (diff < closestDiff) {
      closest = s;
      closestDiff = diff;
    }
  }

  const allScores = scored.map((s) => ({ provider: s.provider, score: s.score }));
  console.log(`[BizScope AI Ensemble] Scores: ${allScores.map(s => `${s.provider}=${s.score}`).join(', ')} | Median: ${medianScore} | Selected: ${closest.provider}`);

  return { text: closest.text, provider: closest.provider, allScores, medianScore };
}
