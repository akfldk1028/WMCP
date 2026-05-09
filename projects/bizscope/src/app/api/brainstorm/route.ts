import { runBrainstorm, quickBrainstorm, getAvailableModels } from '@/lib/brainstorm';
import { resolveAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // brainstorm can take 2+ minutes

interface BrainstormRequest {
  topic: string;
  context?: string;
  rounds?: number;
  quick?: boolean;
}

export async function POST(request: Request) {
  // Brainstorm requires paid plan (it calls multiple AI APIs)
  const auth = await resolveAuth(request);
  if (auth.plan === 'free') {
    return Response.json({ error: 'Brainstorm requires a paid plan' }, { status: 403 });
  }

  let body: BrainstormRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { topic, context, rounds, quick } = body;
  if (!topic || typeof topic !== 'string') {
    return Response.json({ error: 'topic is required' }, { status: 400 });
  }

  const models = getAvailableModels();
  if (models.length === 0) {
    return Response.json({ error: 'No AI providers configured for brainstorm' }, { status: 503 });
  }

  // Quick mode — single round, no SSE
  if (quick) {
    const result = await quickBrainstorm(topic, context);
    return Response.json(result);
  }

  // Full brainstorm — SSE stream for progress
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const result = await runBrainstorm(topic, {
          rounds: Math.min(Math.max(Number(rounds) || 2, 1), 4),
          context,
          onProgress: (msg) => send('progress', { message: msg }),
        });

        send('result', {
          synthesis: result.synthesis,
          modelCount: result.modelCount,
          roundCount: result.rounds.length,
          durationMs: result.totalDurationMs,
          rounds: result.rounds.map((round) =>
            round.map((r) => ({ model: r.modelId, content: r.content, error: r.error })),
          ),
        });
        send('done', {});
      } catch (err) {
        send('error', { message: err instanceof Error ? err.message : 'Brainstorm failed' });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
