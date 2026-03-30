import type { A2UIMessage, A2UICatalog } from '@/modules/a2ui/types';
import { validateComponents } from '@/modules/a2ui/validator';
import { getBmcSystemPrompt } from '@/modules/bmc/prompts';
import { BMC_CATALOG } from '@/modules/bmc/catalog';
import { getPlanningSystemPrompt } from '@/modules/service-planning/prompts';
import { PLANNING_CATALOG } from '@/modules/service-planning/catalog';
import { streamChat } from '@/lib/claude';
// brainstorm multi-model imports removed — P6 (lib/brainstorm.ts still available)
import { searchWeb } from '@/lib/search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // searchWeb + generateChat can be slow

type ChatMode = 'bmc' | 'service-planning' | 'both';

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  mode: ChatMode;
}

// ---------------------------------------------------------------------------
// Rate limiting (10 req/min per IP)
// NOTE: In-memory map — resets per serverless instance on Vercel.
// Effective for dev/single-instance only. Use Upstash Redis for production.
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    if (rateLimitMap.size > 500) {
      for (const [key, val] of rateLimitMap) {
        if (now > val.resetAt) rateLimitMap.delete(key);
      }
    }
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// ---------------------------------------------------------------------------
// Catalog & system prompt
// ---------------------------------------------------------------------------

function getCatalog(mode: ChatMode): A2UICatalog {
  if (mode === 'bmc') return BMC_CATALOG;
  if (mode === 'service-planning') return PLANNING_CATALOG;
  const merged = new Map(BMC_CATALOG.components.map((c) => [c.component, c]));
  for (const c of PLANNING_CATALOG.components) merged.set(c.component, c);
  return { name: 'planning-combined', version: '1.0.0', components: [...merged.values()] };
}

function buildSystemPrompt(mode: ChatMode, catalog: A2UICatalog): string {
  const parts: string[] = [];

  // Core conversation rules — MUST come first
  parts.push(`## Conversation Rules (CRITICAL)

You are a collaborative planning assistant. You guide the user step-by-step through building their business plan.

RULES:
1. Ask ONE question at a time. Never dump all stages/blocks at once.
2. Wait for the user's answer before moving to the next topic.
3. **MANDATORY**: EVERY response MUST include an \`\`\`a2ui code block with the CURRENT block only (not all blocks).
4. Start with the basics: "What is your idea?" → then dig deeper one block at a time.
5. Keep responses short (2-3 sentences max) + one A2UI update showing only the current block.
6. You MUST go through ALL 9 BMC blocks. Never skip any. Never stop early.
7. If the user says "모르겠어" or doesn't have info, suggest reasonable defaults or write "미정" and move on.
8. After each answer, show progress: "✅ 가치 제안 완료 (1/9) → 다음: 고객 분류"
9. Only when ALL 9 blocks are done, suggest "Save & Analyze" to run the full analysis.

FLOW for BMC (MUST complete all 9):
1. Value Proposition (가치 제안) — Ask about the idea's core value
2. Customer Segments (고객 분류) — Who are the target customers?
3. Channels (채널) — How to reach customers?
4. Customer Relationships (고객 관계) — How to maintain relationships?
5. Revenue Streams (수익원) — How to make money?
6. Key Resources (핵심 자원) — What resources are needed?
7. Key Activities (핵심 활동) — What key activities?
8. Key Partners (핵심 파트너십) — Who are key partners?
9. Cost Structure (비용 구조) — What are the main costs?
- After each answer: output ONE BmcBlock A2UI for the completed block. NOT a grid of all blocks.
- If user provides multiple blocks in one message, fill them all and ask about the next unfilled one.
- **BmcBlock children MUST be inline Text components**. Example:
  {"id":"vp","component":"BmcBlock","block":"value-proposition","title":"가치 제안","children":[{"id":"vp-1","component":"Text","text":"AI 취향 추천"},{"id":"vp-2","component":"Text","text":"로스터리 직송 신선한 원두"}]}

FLOW for Service Planning (MUST complete all 8):
- After ALL 9 BMC blocks are done (or if mode is service-planning only), transition to Service Planning.
- Announce: "BMC 완료! 이제 서비스기획 8단계를 시작합니다."
- Go through stages in order:
  1. Executive Summary (프로젝트 개요) — overview, objectives, creative statement
  2. Conceptual Framework (컨셉 프레임워크) — theme, user personas, user journey
  3. Design & Content (디자인 & 컨텐츠 전략) — visual direction, content plan, prototyping, accessibility
  4. Technical Architecture (기술 아키텍처) — platform & infrastructure, security & privacy
  5. Development Roadmap (개발 로드맵) — milestones, budget, risk management
  6. Marketing & Community (마케팅 & 커뮤니티) — marketing strategy, community, partnerships
  7. Post-Launch (출시 후 & 진화) — maintenance, feedback loop, scalability
  8. Legal & Ethical (법률 & 윤리) — compliance, ethical guidelines
- One stage at a time, one question at a time.
- After each answer: output ONE StageCard A2UI for the completed stage. NOT all stages.
- Use BMC data as context (e.g., customer segments → user personas, revenue streams → budget).
- Show progress: "Stage 1/8 — 프로젝트 개요 완료 → 다음: 컨셉 프레임워크"
- **StageCard children MUST be inline Text components**. Example:
  {"id":"es","component":"StageCard","stage":"executive-summary","title":"프로젝트 개요","children":[{"id":"es-1","component":"Text","text":"AI 커피 추천 서비스"},{"id":"es-2","component":"Text","text":"목표: 6개월 내 MAU 5천명"}]}
- If user says "모르겠어", suggest reasonable defaults based on BMC data and move on.
- After ALL 8 stages, suggest "Save & Analyze" for full analysis.

BRAINSTORM (structured user-AI brainstorming):
When the user faces a difficult decision (revenue model, architecture, strategy, etc.),
or explicitly asks to brainstorm/토론/브레인스토밍:

1. ANNOUNCE: "이 결정을 체계적으로 살펴보겠습니다. 3라운드로 진행합니다."
2. ROUND 1 — Landscape: Present pros/cons of each option. Ask: "어떤 쪽이 끌리세요?"
3. ROUND 2 — Devil's Advocate: Challenge the user's preferred option. Show hidden strengths of alternatives. Ask: "이 약점을 어떻게 극복할 수 있을까요?"
4. ROUND 3 — Synthesis: Summarize the discussion with an A2UI Card:
   - title: "브레인스토밍 결론: [topic]"
   - children: 3 Text components — Recommendation / Key Tradeoffs / Open Question
5. RESUME: Return to BMC/service-planning flow. Apply the decision to the relevant block.

Rules:
- Each round = one message. Ask ONE question per round.
- Show round progress: "Round 1/3 — 옵션 분석"
- If user wants to skip: make a default recommendation and move on.
- Brainstorm can happen at ANY BMC block, not just specific ones.

NEVER:
- Render multiple BmcBlocks in one A2UI update (the left panel handles the full grid)
- Skip any of the 9 blocks
- Stop before all 9 blocks are filled
- Generate placeholder content the user didn't provide`);

  if (mode === 'bmc' || mode === 'both') parts.push(getBmcSystemPrompt());
  if (mode === 'service-planning' || mode === 'both') parts.push(getPlanningSystemPrompt());

  const componentList = catalog.components
    .map((c) => {
      const props = Object.entries(c.props)
        .map(([k, v]) => `${k}${v.required ? '*' : ''}: ${v.type}`)
        .join(', ');
      return `- ${c.component}: ${c.description} (${props})`;
    })
    .join('\n');

  parts.push(`## Interactive UI (A2UI)

When you want to show structured visual content (BMC grids, forms, cards), output an A2UI JSON block:

\`\`\`a2ui
{
  "version": "v0.9",
  "createSurface": { "surfaceId": "unique-id", "catalog": "${catalog.name}" },
  "updateComponents": {
    "surfaceId": "unique-id",
    "components": [{ "id": "comp-1", "component": "Card", "title": "Example" }]
  }
}
\`\`\`

Available components:
${componentList}

Rules:
- Each component needs a unique "id"
- Include "createSurface" only when creating a new surface for the first time
- Use "updateComponents" to add or update components on an existing surface
- Mix natural language text with A2UI blocks naturally in your response
- Respond in the same language as the user (Korean or English)`);

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Response parsing — separate text from A2UI blocks
// ---------------------------------------------------------------------------

const A2UI_BLOCK_RE = /```a2ui\s*\n([\s\S]*?)\n\s*```/g;

function parseResponse(
  text: string,
  catalog: A2UICatalog,
): { content: string; a2ui?: A2UIMessage } {
  const a2uiBlocks: A2UIMessage[] = [];

  const cleanText = text
    .replace(A2UI_BLOCK_RE, (_, json: string) => {
      try {
        const parsed = JSON.parse(json) as A2UIMessage;
        if (parsed.updateComponents) {
          const result = validateComponents(parsed.updateComponents.components, catalog);
          if (result.valid) {
            a2uiBlocks.push(parsed);
          } else {
            console.warn('[Planning Chat] A2UI validation failed:', result.errors);
          }
        } else {
          a2uiBlocks.push(parsed);
        }
      } catch {
        // invalid JSON — silently skip
      }
      return '';
    })
    .trim();

  let mergedA2UI: A2UIMessage | undefined;
  if (a2uiBlocks.length > 0) {
    mergedA2UI = { version: 'v0.9' };
    for (const block of a2uiBlocks) {
      if (block.createSurface) mergedA2UI.createSurface = block.createSurface;
      if (block.updateComponents) {
        if (mergedA2UI.updateComponents && mergedA2UI.updateComponents.surfaceId === block.updateComponents.surfaceId) {
          // Concatenate components on the same surface
          mergedA2UI.updateComponents = {
            surfaceId: block.updateComponents.surfaceId,
            components: [...mergedA2UI.updateComponents.components, ...block.updateComponents.components],
          };
        } else {
          mergedA2UI.updateComponents = block.updateComponents;
        }
      }
      if (block.updateDataModel) mergedA2UI.updateDataModel = block.updateDataModel;
      if (block.deleteSurface) mergedA2UI.deleteSurface = block.deleteSurface;
    }
  }

  return { content: cleanText, a2ui: mergedA2UI };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messages, mode } = body;
  if (!messages?.length || !mode) {
    return Response.json({ error: 'messages and mode are required' }, { status: 400 });
  }
  const validModes: ChatMode[] = ['bmc', 'service-planning', 'both'];
  if (!validModes.includes(mode)) {
    return Response.json({ error: 'Invalid mode. Use: bmc, service-planning, or both' }, { status: 400 });
  }

  const catalog = getCatalog(mode);
  const systemPrompt = buildSystemPrompt(mode, catalog);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Auto-inject market research when entering marketing stage for the first time.
        // Only triggers when the assistant's most recent message mentions moving to marketing,
        // AND no prior research was injected (check conversation history for the marker).
        const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')?.content?.toLowerCase() ?? '';
        const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() ?? '';
        const marketingStageSignals = ['marketing', '마케팅', 'gtm', 'go-to-market'];
        const alreadyResearched = messages.some((m) => m.role === 'assistant' && m.content.includes('[Market Research]'));
        const needsResearch = !alreadyResearched &&
          marketingStageSignals.some((kw) => lastAssistantMsg.includes(kw) || lastUserMsg.includes(kw));

        let enrichedPrompt = systemPrompt;
        if (needsResearch) {
          // Extract idea name from conversation
          const firstUserMsg = messages.find((m) => m.role === 'user')?.content ?? '';
          const searchQuery = `${firstUserMsg.slice(0, 100)} marketing strategy trends 2026`;
          try {
            const research = await searchWeb(searchQuery, 5);
            if (research) {
              enrichedPrompt += `\n\n## Real-time Market Research (auto-fetched)\nUse this data to give concrete, data-backed suggestions:\n${research.slice(0, 4000)}`;
            }
          } catch {
            // Search unavailable — continue without research
          }
        }

        let fullResponse = '';
        for await (const chunk of streamChat(enrichedPrompt, messages)) {
          fullResponse += chunk;
          send('token', { content: chunk });
        }
        const { content, a2ui } = parseResponse(fullResponse, catalog);
        if (content) send('text', { content });
        if (a2ui) send('a2ui', a2ui);

        send('done', {});
      } catch (err) {
        send('error', { message: err instanceof Error ? err.message : 'AI generation failed' });
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
