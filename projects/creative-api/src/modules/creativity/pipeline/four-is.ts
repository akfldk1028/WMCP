/** 4I's 풀 파이프라인: Immersion → Inspiration → Isolation → Iteration
 *
 * 학술 근거: Digital Creativity 수업자료 섹션 4 (슬라이드 10-16)
 *
 * Isolation 재해석 노트:
 * 원래 4I's에서 Isolation = "마음을 비우고, 명상처럼, 억지로 하지 않기" (슬라이드 13)
 * 이는 인간의 잠재의식 처리를 위한 의도적 비활동.
 *
 * AI 에이전트는 "명상"이 불가능하므로, 우리는 Isolation을 다음과 같이 재해석:
 * → "다른 에이전트의 편향 없이 독립적으로 사고" (Independent Evaluation)
 * → 각 evaluator가 다른 에이전트의 결과를 보지 않고 독립 평가
 * → Amabile의 3요소 기준으로 객관적 점수 부여
 *
 * 이 재해석은 Isolation의 핵심 의도(편향 제거, 새로운 관점)를 보존하면서
 * 계산적으로 구현 가능한 형태로 변환한 것.
 *
 * 참고 문헌:
 * - Guilford, J.P. (1967). The Nature of Human Intelligence.
 * - Amabile, T.M. (1996). Creativity in Context.
 * - Csikszentmihalyi, M. (1996). Creativity: Flow and the Psychology of Discovery.
 * - Finke, R.A., Ward, T.B., & Smith, S.M. (1992). Creative Cognition.
 */

import type { CreativeSession, PhaseResult } from '@/types/session';
import type { Idea } from '@/types/creativity';
import Anthropic from '@anthropic-ai/sdk';
import { divergentGenerate, convergentSelect } from '../theories/guilford';
import { scamperFullSweep } from '../techniques/scamper';
import { CREATIVE_SYSTEM_PROMPT } from '../prompts/system';
import { buildIterationPrompt } from '../prompts/iteration';
import { DEFAULTS } from '@/config/creativity';

const anthropic = new Anthropic();

/**
 * 4I's 풀 창의 파이프라인
 * Light mode: TypeScript에서 직접 실행 (ClawTeam 없이)
 */
export async function runFourIsPipeline(
  topic: string,
  domain: string,
  options?: { divergentCount?: number; iterationRounds?: number }
): Promise<CreativeSession> {
  const sessionId = `session-${Date.now()}`;
  const startTime = Date.now();
  const divergentCount = options?.divergentCount ?? DEFAULTS.divergentCount;
  const iterationRounds = options?.iterationRounds ?? DEFAULTS.iterationRounds;

  const phases: CreativeSession['phases'] = {};

  // Phase 1: IMMERSION — 도메인 리서치 (Graph DB 검색)
  // TODO: Memgraph 연결 후 구현. 지금은 패스스루.
  phases.immersion = {
    phase: 'immersion',
    status: 'completed',
    ideas: [],
    metadata: { note: 'Graph DB search pending — using topic context only' },
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  // Phase 2: INSPIRATION — 발산적 아이디어 대량 생성
  const divergent = await divergentGenerate(topic, domain, divergentCount);
  phases.inspiration = {
    phase: 'inspiration',
    status: 'completed',
    ideas: divergent.ideas,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  // Phase 3: ISOLATION — 독립 평가 (편향 없이)
  const convergent = await convergentSelect(divergent.ideas, domain);
  phases.isolation = {
    phase: 'isolation',
    status: 'completed',
    ideas: convergent.ranked,
    metadata: { eliminated: convergent.eliminated },
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  // Phase 4: ITERATION — 2단계 (4I's Iteration + Geneplore Exploratory)
  // Step A: 의미적 변주 — buildIterationPrompt로 "universal themes" 기반 변주 (슬라이드 14)
  // Step B: 구조적 변환 — SCAMPER 기법으로 체계적 변환 (슬라이드 9)
  const topIdeas = convergent.ranked.slice(0, DEFAULTS.convergentTopK);
  const iterated: Idea[] = [];

  for (const idea of topIdeas) {
    // Step A: 의미적 Iteration (Graph DB context + universal themes)
    // "Iteration is NOT copying — it's finding universal themes" (슬라이드 14)
    const iterPrompt = buildIterationPrompt(
      { title: idea.title, description: idea.description },
      topIdeas.filter((t) => t.id !== idea.id).map((t) => ({ title: t.title, description: t.description })),
      domain
    );
    const iterResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: CREATIVE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: iterPrompt }],
    });
    const iterText = iterResponse.content[0].type === 'text' ? iterResponse.content[0].text : '{"iterations":[]}';
    try {
      const parsed = JSON.parse(iterText) as { iterations: { title: string; description: string }[] };
      for (const iter of parsed.iterations) {
        iterated.push({
          id: `iter-${Date.now()}-${iterated.length}`,
          title: iter.title,
          description: iter.description,
          theory: 'four_is',
          method: 'iteration:semantic',
          parentId: idea.id,
          createdAt: new Date().toISOString(),
        });
      }
    } catch { /* JSON parse fail — skip */ }

    // Step B: 구조적 SCAMPER 변환 (1라운드만, semantic iteration이 주력)
    if (iterationRounds > 0) {
      const variants = await scamperFullSweep(idea);
      iterated.push(...variants);
    }
  }

  phases.iteration = {
    phase: 'iteration',
    status: 'completed',
    ideas: iterated,
    metadata: { rounds: iterationRounds },
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  // 최종 아이디어 = 상위 선별 + iteration 결과
  const finalIdeas = [...topIdeas, ...iterated];

  return {
    id: sessionId,
    topic,
    domain,
    status: 'completed',
    mode: 'light',
    phases,
    finalIdeas,
    totalGenerated: divergent.ideas.length + iterated.length,
    duration: Date.now() - startTime,
    createdAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
  };
}
