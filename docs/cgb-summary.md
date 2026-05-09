# CGB (Creative Graph Brain) — Project Summary

## 프로젝트 개요
- **한 줄 요약**: 학술 창의성 이론 5가지를 AI 에이전트로 코드화하고, 아이디어를 그래프에 영구 축적하는 창의성 엔진
- **해결하는 문제**: AI 아이디어 생성은 세션마다 리셋됨 — 이전 아이디어와의 관계, 축적, 진화가 없음. 또한 "창의적"이라는 주장의 근거가 없음 (학술 이론 부재).
- **타겟 사용자**: AI 에이전트 개발자, 창의성 연구자, 아이디어 축적형 도구가 필요한 팀/개인

## 기술 스택
- **주요 기술**: Next.js 15.5, React 19, Tailwind 4, react-force-graph-3d, AI SDK (Gemini 2.5 Flash), Vitest
- **핵심 알고리즘/모델**:
  - 5대 창의성 이론 통합 (Guilford 확산사고 + Amabile 동기부여 + Csikszentmihalyi 시스템 + Geneplore 생성탐색 + SCAMPER 기법)
  - Knowledge Distance 기반 Novelty Scoring (BFS 최단경로 거리 = 창의성)
  - 그래프 알고리즘 3종: PageRank, Louvain Community Detection, KNN Similarity (순수 TypeScript)
  - 9개 오케스트레이션 패턴 (Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, Hierarchical + 복합3)

## 현재 구현 상태
- **완성된 기능**:
  - Light mode: 4I's 파이프라인 (~100초)
  - Heavy mode: 5 에이전트 자율 실행 (~191초)
  - 9노드 25엣지 그래프 온톨로지 (YAML 기반 도메인 확장)
  - 5 Brain Views (Collective/Domain/User/Agent/Visual)
  - Reasoning Trace — 에이전트 사고과정을 그래프 노드로 영구 저장
  - SSE 실시간 스트리밍 (8종 이벤트)
  - Agent-as-Node + GENERATED_BY 기여 추적
  - 합성 데이터 파이프라인 (3도메인 × 20아이디어 + concepts + traces)
  - 36개 테스트 (algorithms 12 + traces 12 + ontology 6 + seed 6)
  - 4-tier 인증 (free/pro/team/enterprise)
  - 9개 오케스트레이션 패턴 (Harness 흡수)
- **데모 가능 여부**: 로컬 데모 가능 (Vercel 배포 미완)
- **프로토타입 수준**: **MVP** (핵심 기능 전부 동작, 배포만 남음)

## 차별점
- **기존 대안 대비 뭐가 다른지**:
  - Neo4j Labs의 create-context-graph(CCG): Neo4j 전용, Python, 창의성 이론 없음, 아이디어 성숙도 없음
  - 일반 AI 아이디어 도구 (ChatGPT 등): 세션 리셋, 축적 없음, 이론 근거 없음
  - CGB: 세션마다 아이디어가 쌓여서 복리로 불어남 + 학술 이론 기반 품질 보증
- **독창적인 부분**:
  - Knowledge Distance = 창의성 (그래프 거리가 멀수록 novel)
  - Agent-as-Node: 에이전트가 1등 시민으로 그래프에 존재, 기여 추적 가능
  - Reasoning Trace 그래프화: 에이전트 사고과정이 노드로 저장되어 트레이스 간 관계 탐색 가능 (CCG는 파일 저장)
  - Zero-dependency 실행: In-memory 그래프로 Neo4j 없이 동작 (선택적 Memgraph 연결)
  - 5 Brain Views: 단일 그래프에 5가지 필터 뷰 (전체/도메인/유저/에이전트/비주얼)

## 활용 가능성
- **사업화 가능성**: 중간~높음. AI 에이전트 생태계 확산 시 "창의성 인프라"로 포지셔닝 가능. API SaaS 모델 (콜당 과금) + 엔터프라이즈 온프레미스 라이선스. 4-tier 과금 구조 이미 설계됨.
- **논문/연구 가능성**: 높음. 5대 창의성 이론의 계산적 구현, Knowledge Distance 기반 Novelty 측정, Agent Reasoning Trace의 그래프 영속화, 오케스트레이션 패턴 비교 연구 등 — Computational Creativity, AI Agent, Knowledge Graph 분야 다수 논문 소재.
- **특허 가능성**: 높음. Knowledge Distance 기반 창의성 스코어링 방법, 에이전트 사고과정의 그래프 노드화 방법, 5 Brain View 필터링 시스템, YAML 온톨로지 기반 도메인 확장 메커니즘 등이 방법 특허 후보.
