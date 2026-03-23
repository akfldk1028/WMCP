/** Graph DB 노드/엣지 타입 정의 — Memgraph Cypher 호환
 *
 * 온톨로지 설계 근거:
 * - Barrios et al. (2020). "Multi-agent system and ontology to manage ideas" (arxiv:2009.05282)
 *   → 아이디어 간 의미 관계 정형화: similarity, opposition, causation, composition
 * - Csikszentmihalyi (1996). Domain의 "규칙, 상징, 관습"을 그래프 구조로 표현
 */

export type NodeType = 'Idea' | 'Concept' | 'Domain' | 'Output' | 'Session';

/** 엣지 타입 — 창의성 관계 + 의미 관계 (온톨로지)
 *
 * 창의성 관계 (이론 기반):
 *   INSPIRED_BY, ITERATED_FROM, COMBINES, SCAMPER_OF — 아이디어 생성 과정 추적
 *
 * 의미 관계 (온톨로지, Barrios et al. 2020):
 *   CONTRADICTS, CAUSES, PART_OF, SIMILAR_TO, GENERALIZES, SPECIALIZES — 아이디어 간 의미 구조
 *
 * 소속 관계:
 *   BELONGS_TO, PRODUCED_IN, RELATED_TO — 도메인/세션 연결
 */
export type EdgeType =
  // 창의성 관계 (이론 기반)
  | 'INSPIRED_BY'       // ~에서 영감 (4I's Inspiration)
  | 'ITERATED_FROM'     // ~의 변주/진화 (4I's Iteration, Geneplore Explore)
  | 'COMBINES'          // 두 아이디어 결합 (SCAMPER Combine)
  | 'SCAMPER_OF'        // SCAMPER 기법 적용 결과
  // 의미 관계 (온톨로지)
  | 'CONTRADICTS'       // 반대/모순 관계
  | 'CAUSES'            // 인과 관계
  | 'PART_OF'           // 부분-전체 (composition)
  | 'SIMILAR_TO'        // 유사 관계
  | 'GENERALIZES'       // 일반화 (하위→상위)
  | 'SPECIALIZES'       // 특수화 (상위→하위)
  // 소속 관계
  | 'BELONGS_TO'        // 도메인/세션 소속
  | 'PRODUCED_IN'       // 세션에서 생성됨
  | 'RELATED_TO';       // 일반 관계

export interface GraphNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  /** 생성에 사용된 기법 */
  method?: string;
  /** 생성한 에이전트 */
  authorAgent?: string;
  /** 점수 (0-100) */
  score?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  weight?: number;
  createdAt: string;
}

/** react-force-graph-3d 렌더링용 변환 데이터 */
export interface Graph3DData {
  nodes: Graph3DNode[];
  links: Graph3DLink[];
}

export interface Graph3DNode {
  id: string;
  name: string;
  type: NodeType;
  val: number;       // 노드 크기
  color: string;
  description?: string;
  score?: number;
  method?: string;
}

export interface Graph3DLink {
  source: string;
  target: string;
  type: EdgeType;
  color: string;
  width: number;
  curvature?: number;
  particles?: number;
  particleSpeed?: number;
}

/** Memgraph 쿼리 결과 래퍼 */
export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalNodes: number;
  totalEdges: number;
}
