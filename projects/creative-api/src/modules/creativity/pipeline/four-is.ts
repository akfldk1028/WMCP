/** 4I's 풀 파이프라인: Immersion → Inspiration → Isolation → Iteration */

import type { CreativeSession, PhaseResult } from '@/types/session';
import type { Idea } from '@/types/creativity';
import { divergentGenerate, convergentSelect } from '../theories/guilford';
import { scamperFullSweep } from '../techniques/scamper';
import { DEFAULTS } from '@/config/creativity';

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

  // Phase 4: ITERATION — 상위 아이디어 SCAMPER 변주
  const topIdeas = convergent.ranked.slice(0, DEFAULTS.convergentTopK);
  const iterated: Idea[] = [];

  for (let round = 0; round < iterationRounds; round++) {
    for (const idea of topIdeas) {
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
