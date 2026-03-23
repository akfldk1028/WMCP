/** Graph DB Tools — 에이전트가 자율적으로 Graph DB 조회/저장
 *
 * Memgraph에 아이디어를 저장하고, 관련 아이디어를 검색.
 * Csikszentmihalyi의 Domain 지식 = Graph DB에 축적된 노드.
 * Iteration = 기존 노드에서 새 노드로 연결.
 */

import type { AgentTool } from './registry';
// import { runQuery } from '@/modules/graph/driver';  // Memgraph 연결 후 활성화

/** 임시: Memgraph 미연결 시 in-memory store */
const memoryStore: { nodes: any[]; edges: any[] } = { nodes: [], edges: [] };

export const graphQueryTool: AgentTool = {
  name: 'graph_query',
  description: 'Run a Cypher query on the knowledge graph to find related ideas, concepts, or domains. Use for exploring the idea space during Immersion or Iteration.',
  parameters: {
    cypher: { type: 'string', description: 'Cypher query string' },
  },
  execute: async (params) => {
    const cypher = params.cypher as string;
    // TODO: Memgraph 연결 후 runQuery(cypher)로 교체
    return {
      source: 'memory_store',
      results: memoryStore.nodes.filter((n) =>
        JSON.stringify(n).toLowerCase().includes(cypher.toLowerCase().replace(/match|return|where/gi, '').trim().slice(0, 20))
      ).slice(0, 10),
      note: 'Using in-memory store. Connect Memgraph for persistent graph.',
    };
  },
};

export const graphSearchTool: AgentTool = {
  name: 'graph_search',
  description: 'Search the knowledge graph by keywords. Returns related ideas, concepts, and their connections. Essential for the Immersion phase and finding iteration targets.',
  parameters: {
    keywords: { type: 'string', description: 'Search keywords' },
    max_results: { type: 'number', description: 'Max results (default 10)' },
  },
  execute: async (params) => {
    const keywords = (params.keywords as string).toLowerCase();
    const max = (params.max_results as number) ?? 10;
    const results = memoryStore.nodes.filter((n) =>
      n.title?.toLowerCase().includes(keywords) || n.description?.toLowerCase().includes(keywords)
    ).slice(0, max);
    return { results, total: results.length };
  },
};

export const graphAddNodeTool: AgentTool = {
  name: 'graph_add_node',
  description: 'Add a new idea, concept, or output node to the knowledge graph. Every generated idea should be saved here so the graph grows over time. This is how "ideas compound forever".',
  parameters: {
    type: { type: 'string', description: 'Node type: Idea, Concept, Domain, Output' },
    title: { type: 'string', description: 'Title of the node' },
    description: { type: 'string', description: 'Description' },
    method: { type: 'string', description: 'Method used: divergent, scamper, iteration, etc.' },
  },
  execute: async (params) => {
    const node = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: params.type,
      title: params.title,
      description: params.description,
      method: params.method,
      createdAt: new Date().toISOString(),
    };
    memoryStore.nodes.push(node);
    // TODO: runQuery('CREATE (n:${type} {id: $id, title: $title, ...})', node)
    return { created: node, totalNodes: memoryStore.nodes.length };
  },
};

export const graphAddEdgeTool: AgentTool = {
  name: 'graph_add_edge',
  description: 'Create a relationship between two nodes in the knowledge graph. Use INSPIRED_BY for inspiration links, ITERATED_FROM for variations, SCAMPER_OF for transforms, CONTRADICTS for opposing ideas, SIMILAR_TO for related ideas.',
  parameters: {
    sourceId: { type: 'string', description: 'Source node ID' },
    targetId: { type: 'string', description: 'Target node ID' },
    type: { type: 'string', description: 'Edge type: INSPIRED_BY, ITERATED_FROM, COMBINES, SCAMPER_OF, CONTRADICTS, CAUSES, SIMILAR_TO, etc.' },
  },
  execute: async (params) => {
    const edge = {
      id: `edge-${Date.now()}`,
      source: params.sourceId,
      target: params.targetId,
      type: params.type,
      createdAt: new Date().toISOString(),
    };
    memoryStore.edges.push(edge);
    return { created: edge, totalEdges: memoryStore.edges.length };
  },
};
