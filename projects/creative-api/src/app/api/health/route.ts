import { NextResponse } from 'next/server';
import { getAvailableProviders } from '@/modules/llm/client';

export async function GET() {
  const providers = getAvailableProviders();
  const llm = providers.some((p) => p.configured);
  const search = !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX);
  const memgraph = !!(process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD);

  let graph: 'memgraph' | 'file' | 'memory' = 'memory';
  if (memgraph) graph = 'memgraph';
  else {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      await fs.access(path.join(process.cwd(), 'data', 'graph-store.json'));
      graph = 'file';
    } catch {
      graph = 'memory';
    }
  }

  return NextResponse.json({
    llm,
    providers,
    search,
    graph,
    model: process.env.CREATIVE_MODEL ?? 'google/gemini-2.5-flash',
    ready: llm,
  });
}
