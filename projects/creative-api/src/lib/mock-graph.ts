/** 목업 그래프 데이터 — Neo4j 연결 전 시각 확인용 */

import type { Graph3DData } from '@/types/graph';
import { NODE_STYLES, EDGE_STYLES } from '@/config/graph-styles';

export function generateMockGraph(nodeCount = 60, edgeCount = 90): Graph3DData {
  const types = ['Idea', 'Concept', 'Domain', 'Output', 'Session'] as const;
  const edgeTypes = ['INSPIRED_BY', 'ITERATED_FROM', 'COMBINES', 'SCAMPER_OF', 'BELONGS_TO', 'PRODUCED_IN'] as const;

  const ideaNames = [
    'AI 요리 비서', '음악 생성 에이전트', '코드 리뷰 봇', '자동 번역 파이프라인',
    '감정 분석 대시보드', '스마트 일정 관리', '3D 모델 생성기', '자연어 SQL',
    'AR 인테리어 설계', '실시간 자막 생성', '자율 드론 경로', '건강 추적 AI',
    '법률 문서 분석', '패션 추천 엔진', '게임 NPC 대화', '자동 테스트 생성',
    '음성 클론 서비스', '교육 커리큘럼 AI', 'SNS 콘텐츠 생성', '주식 분석 봇',
  ];

  const conceptNames = [
    'Transfer Learning', 'Attention Mechanism', 'RAG', 'Fine-tuning',
    'Prompt Engineering', 'Chain of Thought', 'Multi-modal', 'Embeddings',
    'Reinforcement Learning', 'GAN', 'Diffusion', 'Knowledge Graph',
  ];

  const domainNames = [
    'Healthcare', 'Finance', 'Education', 'Entertainment', 'E-commerce',
    'Legal', 'Manufacturing', 'Agriculture', 'Logistics', 'Media',
  ];

  const nodes: Graph3DData['nodes'] = [];

  // 아이디어 노드
  for (let i = 0; i < Math.min(nodeCount * 0.4, ideaNames.length); i++) {
    const style = NODE_STYLES.Idea;
    nodes.push({
      id: `idea-${i}`,
      name: ideaNames[i],
      type: 'Idea',
      val: style.size + Math.random() * 4,
      color: style.color,
      score: Math.floor(40 + Math.random() * 60),
      method: ['SCAMPER', 'Brainstorming', '4Is', 'Geneplore'][Math.floor(Math.random() * 4)],
    });
  }

  // 개념 노드
  for (let i = 0; i < Math.min(nodeCount * 0.25, conceptNames.length); i++) {
    const style = NODE_STYLES.Concept;
    nodes.push({
      id: `concept-${i}`,
      name: conceptNames[i],
      type: 'Concept',
      val: style.size + Math.random() * 2,
      color: style.color,
    });
  }

  // 도메인 노드
  for (let i = 0; i < Math.min(nodeCount * 0.2, domainNames.length); i++) {
    const style = NODE_STYLES.Domain;
    nodes.push({
      id: `domain-${i}`,
      name: domainNames[i],
      type: 'Domain',
      val: style.size + Math.random() * 2,
      color: style.color,
    });
  }

  // Output 노드
  for (let i = 0; i < 5; i++) {
    const style = NODE_STYLES.Output;
    nodes.push({
      id: `output-${i}`,
      name: `Final Output #${i + 1}`,
      type: 'Output',
      val: style.size,
      color: style.color,
      score: Math.floor(80 + Math.random() * 20),
    });
  }

  // Session 노드
  for (let i = 0; i < 3; i++) {
    const style = NODE_STYLES.Session;
    nodes.push({
      id: `session-${i}`,
      name: `Session ${i + 1}`,
      type: 'Session',
      val: style.size,
      color: style.color,
    });
  }

  // 엣지 생성
  const links: Graph3DData['links'] = [];
  const nodeIds = nodes.map((n) => n.id);

  for (let i = 0; i < edgeCount; i++) {
    const source = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    let target = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    while (target === source) {
      target = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    }
    const edgeType = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];
    const style = EDGE_STYLES[edgeType];

    links.push({
      source,
      target,
      type: edgeType,
      color: style.color,
      width: style.width,
      particles: style.particles,
      particleSpeed: style.particleSpeed,
    });
  }

  return { nodes, links };
}

/** 수업 예시 기반 시드 데이터 (Iteration 체인: Raimondi→Manet→Picasso) */
export const SEED_ITERATION_CHAIN: Graph3DData = {
  nodes: [
    { id: 'art-1', name: 'Judgement of Paris (Raimondi, 1515)', type: 'Idea', val: 8, color: NODE_STYLES.Idea.color, description: 'Original engraving — classical composition' },
    { id: 'art-2', name: 'Dejeuner sur l\'Herbe (Manet, 1863)', type: 'Idea', val: 10, color: NODE_STYLES.Idea.color, description: 'Adapted classical composition to modern setting — Iteration of Raimondi', score: 95 },
    { id: 'art-3', name: 'Pastoral Concert (Giorgione, 1510)', type: 'Idea', val: 7, color: NODE_STYLES.Idea.color, description: 'Venetian pastoral — also inspired Manet' },
    { id: 'art-4', name: 'Dejeuner sur l\'Herbe (Picasso, 1961)', type: 'Idea', val: 10, color: NODE_STYLES.Idea.color, description: 'Cubist reinterpretation — Iteration of Manet', score: 92 },
    { id: 'art-5', name: 'Dejeuner sur l\'Herbe (Deandrea, 1982)', type: 'Idea', val: 8, color: NODE_STYLES.Idea.color, description: 'Hyperrealist sculpture — Iteration to 3D medium' },
    { id: 'art-6', name: 'New Luncheon (Ron English, 1994)', type: 'Idea', val: 7, color: NODE_STYLES.Idea.color, description: 'Pop art parody — Iteration with cultural commentary' },
    { id: 'art-7', name: 'YSL Advertisement', type: 'Output', val: 12, color: NODE_STYLES.Output.color, description: 'Commercial application — Fashion industry appropriation', score: 88 },
    { id: 'concept-iter', name: 'Iteration (Creative Theory)', type: 'Concept', val: 6, color: NODE_STYLES.Concept.color },
    { id: 'domain-art', name: 'Fine Art', type: 'Domain', val: 5, color: NODE_STYLES.Domain.color },
  ],
  links: [
    { source: 'art-2', target: 'art-1', type: 'ITERATED_FROM', color: EDGE_STYLES.ITERATED_FROM.color, width: 2.5, particles: 5, particleSpeed: 0.008 },
    { source: 'art-2', target: 'art-3', type: 'INSPIRED_BY', color: EDGE_STYLES.INSPIRED_BY.color, width: 1.5, particles: 3, particleSpeed: 0.004 },
    { source: 'art-4', target: 'art-2', type: 'ITERATED_FROM', color: EDGE_STYLES.ITERATED_FROM.color, width: 2.5, particles: 5, particleSpeed: 0.008 },
    { source: 'art-5', target: 'art-2', type: 'ITERATED_FROM', color: EDGE_STYLES.ITERATED_FROM.color, width: 2.5, particles: 5, particleSpeed: 0.008 },
    { source: 'art-6', target: 'art-2', type: 'ITERATED_FROM', color: EDGE_STYLES.ITERATED_FROM.color, width: 2.5, particles: 5, particleSpeed: 0.008 },
    { source: 'art-7', target: 'art-2', type: 'ITERATED_FROM', color: EDGE_STYLES.ITERATED_FROM.color, width: 2.5, particles: 5, particleSpeed: 0.008 },
    { source: 'art-1', target: 'concept-iter', type: 'RELATED_TO', color: EDGE_STYLES.RELATED_TO.color, width: 0.8 },
    { source: 'art-1', target: 'domain-art', type: 'BELONGS_TO', color: EDGE_STYLES.BELONGS_TO.color, width: 1.0 },
    { source: 'art-2', target: 'domain-art', type: 'BELONGS_TO', color: EDGE_STYLES.BELONGS_TO.color, width: 1.0 },
  ],
};
