/** Graph DB 노드/엣지 타입 정의 — Memgraph Cypher 호환 */

export type NodeType = 'Idea' | 'Concept' | 'Domain' | 'Output' | 'Session';

export type EdgeType =
  | 'INSPIRED_BY'
  | 'ITERATED_FROM'
  | 'COMBINES'
  | 'SCAMPER_OF'
  | 'BELONGS_TO'
  | 'PRODUCED_IN'
  | 'RELATED_TO';

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
