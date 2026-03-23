/** Novelty Score Tool — Graph 거리 기반 창의성 측정
 *
 * 근거: Luo et al. (2022) "Guiding Data-Driven Design Ideation by Knowledge Distance"
 * Knowledge-Based Systems, 218, 106873.
 *
 * 핵심 가설: "의미적으로 먼 개념을 연결할수록 더 창의적"
 * 측정: Graph에서 가장 가까운 기존 Idea까지의 최단 경로 길이
 */

import type { AgentTool } from './registry';

/** 경로 길이 → novelty score 변환 */
export function pathLengthToNovelty(pathLength: number | null): number {
  if (pathLength === null || pathLength === 0) return 100; // 연결 없음 = 완전 새로움
  if (pathLength === 1) return 10;  // 직접 연결 = 파생 (낮은 창의성)
  if (pathLength === 2) return 40;  // 2홉 = 약간의 거리
  if (pathLength === 3) return 70;  // 3홉 = 교차 도메인 수준
  return Math.min(95, 60 + pathLength * 8); // 4+ = 매우 높은 창의성
}

export const noveltyTool: AgentTool = {
  name: 'measure_novelty',
  description: `Measure the novelty/creativity of an idea by calculating its "knowledge distance" from existing ideas in the graph. Based on Luo et al. (KBS 2022): ideas that connect semantically distant concepts are more creative. Returns a novelty score 0-100.`,
  parameters: {
    idea_title: { type: 'string', description: 'Title of the idea to measure' },
    idea_description: { type: 'string', description: 'Description of the idea' },
  },
  execute: async (params) => {
    // TODO: Memgraph 연결 후 실제 최단 경로 계산
    // MATCH (a:Idea {title: $title}), (b:Idea)
    // WHERE a <> b
    // MATCH path = shortestPath((a)-[*..5]-(b))
    // RETURN min(length(path)) as minDistance
    return {
      framework: 'Knowledge Distance (Luo et al., KBS 2022)',
      instruction: `Estimate the novelty of "${params.idea_title}" by considering:
1. How many existing ideas in the graph are SIMILAR_TO this one? (more similar = less novel)
2. Does this idea connect concepts from DIFFERENT domains? (cross-domain = more novel)
3. Has anything like this been done before? (web_search to verify)

Score 0-100:
- 0-20: Derivative (minor variation of existing idea)
- 21-50: Incremental (meaningful improvement but same domain)
- 51-80: Cross-domain (applies ideas from one field to another)
- 81-100: Paradigm-shifting (fundamentally new connection)`,
      scoringFormula: 'novelty = f(shortest_path_length_to_nearest_existing_idea)',
      note: 'When Memgraph is connected, this will calculate actual graph distances.',
    };
  },
};
