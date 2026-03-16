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
    console.log(`[BizScope AI] Using provider: ${cachedConfig.provider} (${cachedConfig.model})`);
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
