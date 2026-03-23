/** 3D 그래프 시각화 스타일 정의 — 현혹 포인트 */

import type { NodeType, EdgeType } from '@/types/graph';

/** 배경 */
export const GRAPH_BG = '#050510';

/** 노드 타입별 색상 + 크기 */
export const NODE_STYLES: Record<NodeType, { color: string; size: number; glow: number }> = {
  Idea:    { color: '#FFD700', size: 8,  glow: 1.5 },   // 금색, 중간, 강한 글로우
  Concept: { color: '#4FC3F7', size: 5,  glow: 1.0 },   // 하늘, 작음
  Domain:  { color: '#66BB6A', size: 4,  glow: 0.6 },   // 초록, 작음
  Output:  { color: '#AB47BC', size: 12, glow: 2.0 },   // 보라, 큼, 최강 글로우 + 펄스
  Session: { color: '#EF5350', size: 6,  glow: 1.0 },   // 빨강, 중간
};

/** 엣지 타입별 스타일 */
export const EDGE_STYLES: Record<EdgeType, {
  color: string;
  width: number;
  particles: number;
  particleSpeed: number;
  dash?: boolean;
}> = {
  // 창의성 관계
  INSPIRED_BY:    { color: '#4FC3F7', width: 1.5, particles: 3, particleSpeed: 0.004, dash: true },
  ITERATED_FROM:  { color: '#FFD700', width: 2.5, particles: 5, particleSpeed: 0.008 },
  COMBINES:       { color: '#E040FB', width: 2.0, particles: 4, particleSpeed: 0.006 },
  SCAMPER_OF:     { color: '#FF5252', width: 1.5, particles: 3, particleSpeed: 0.005, dash: true },
  // 의미 관계 (온톨로지)
  CONTRADICTS:    { color: '#F44336', width: 2.0, particles: 2, particleSpeed: 0.003, dash: true },
  CAUSES:         { color: '#FF9800', width: 1.8, particles: 3, particleSpeed: 0.005 },
  PART_OF:        { color: '#8BC34A', width: 1.2, particles: 0, particleSpeed: 0 },
  SIMILAR_TO:     { color: '#00BCD4', width: 1.0, particles: 1, particleSpeed: 0.002, dash: true },
  GENERALIZES:    { color: '#9C27B0', width: 1.3, particles: 0, particleSpeed: 0 },
  SPECIALIZES:    { color: '#673AB7', width: 1.3, particles: 0, particleSpeed: 0 },
  // 소속 관계
  BELONGS_TO:     { color: '#66BB6A', width: 1.0, particles: 0, particleSpeed: 0 },
  PRODUCED_IN:    { color: '#AB47BC', width: 1.0, particles: 2, particleSpeed: 0.003 },
  RELATED_TO:     { color: '#9E9E9E', width: 0.8, particles: 0, particleSpeed: 0 },
};

/** Bloom 후처리 설정 */
export const BLOOM_CONFIG = {
  strength: 1.8,
  radius: 0.6,
  threshold: 0.1,
};

/** 카메라 설정 */
export const CAMERA_CONFIG = {
  distance: 400,
  fov: 60,
  /** 초기 자동 회전 속도 (rad/s) */
  autoRotateSpeed: 0.3,
};

/** 노드 라벨 표시 최소 줌 거리 */
export const LABEL_VISIBLE_DISTANCE = 200;
