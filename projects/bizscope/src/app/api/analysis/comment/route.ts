import { generateChat } from '@/lib/claude';
import type { SectionType, ReportMode } from '@/frameworks/types';
import { getSectionTitles } from '@/frameworks/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

interface CommentRequest {
  mode: ReportMode;
  subjectName: string;
  sectionType: SectionType;
  sectionData: Record<string, unknown>;
  nextSectionType?: SectionType;
  completedCount: number;
  totalCount: number;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  locale?: string;
}

const SYSTEM_PROMPT = `You are BizScope AI, an interactive business analysis assistant.
You are helping the user analyze their business idea or company through conversation.

Your role:
1. After each analysis section completes, give a brief (2-3 sentence) insight about the key finding.
2. Highlight the most important takeaway from the section.
3. If there's a concerning finding (risk, weakness), mention it constructively.
4. Then preview what comes next and ask if the user has questions or wants to continue.
5. Respond in the same language as the user (Korean or English).

Keep responses SHORT and conversational. Do NOT repeat the full section data.
Focus on the "so what?" — what does this mean for their business?`;

export async function POST(request: Request) {
  let body: CommentRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { mode, subjectName, sectionType, sectionData, nextSectionType, completedCount, totalCount, messages, locale } = body;

  const titles = getSectionTitles(locale);
  const sectionTitle = titles[sectionType] ?? sectionType;
  const nextTitle = nextSectionType ? (titles[nextSectionType] ?? nextSectionType) : null;

  const userPrompt = `[Section Complete: ${sectionTitle} (${completedCount}/${totalCount})]
Subject: ${subjectName} (${mode === 'idea' ? 'Idea Analysis' : 'Company Analysis'})

Key data from "${sectionTitle}":
${(() => { const s = JSON.stringify(sectionData); return s.length > 3000 ? s.slice(0, 2997) + '...' : s; })()}

${nextTitle ? `Next section: "${nextTitle}"` : 'This was the final section! All analysis complete.'}

Give a brief insight about this section's findings and ${nextTitle ? 'preview what comes next.' : 'summarize the overall analysis.'}`;

  const chatMessages = [
    ...messages.slice(-6), // keep last 6 messages for context
    { role: 'user' as const, content: userPrompt },
  ];

  try {
    const response = await generateChat(SYSTEM_PROMPT, chatMessages);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: text\ndata: ${JSON.stringify({ content: response })}\n\n`));
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
