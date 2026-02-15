import type { NodeDefinition, PipelineContext } from '../../runtime/types.js';

interface FetchInput {
  url?: string;
}

interface FetchOutput {
  url: string;
  html: string;
  userAgent: string;
  fetchedAt: string;
}

interface FetchConfig {
  url?: string;
  userAgent?: string;
  timeout?: number;
}

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36';

export class FetchPageNode implements NodeDefinition<FetchInput, FetchOutput, FetchConfig> {
  readonly type = 'fetch-page';

  async execute(input: FetchInput, config: FetchConfig, _ctx: PipelineContext): Promise<FetchOutput> {
    const url = config.url ?? input.url;
    if (!url) throw new Error('FetchPageNode: url is required (via config or input)');

    const userAgent = config.userAgent ?? DEFAULT_UA;
    const timeout = config.timeout ?? 15_000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': userAgent },
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }
      const html = await res.text();
      return { url, html, userAgent, fetchedAt: new Date().toISOString() };
    } finally {
      clearTimeout(timer);
    }
  }
}
