# HANDOFF — CreativeGraph AI (2026-03-23)

## Goal

**학술적 창의성 이론 5가지를 AI 에이전트 행동 모델로 코드화**하여, 멀티에이전트 팀이 자율적으로 아이디어를 생성·평가·진화시키는 플랫폼. Graph DB에 아이디어 계보를 영구 축적. 3D 인터랙티브 그래프로 시각화. API로 판매.

### 핵심 차별점 (논문 근거)
- 5이론 통합 (Guilford + Amabile + Csikszentmihalyi + Geneplore + SCAMPER) — 경쟁자(TRIZ Agents)는 1이론만
- Graph DB 영구 축적 — 쓸수록 더 창의적 (Knowledge Distance 가설, Luo 2022)
- 자율 에이전트 + 도구 11종 — LLM이 자율적으로 웹 검색, Graph 조회, SCAMPER/TRIZ 적용
- 3D 시각화 — react-force-graph-3d로 아이디어 네트워크 현혹

---

## Current Progress — 완료된 것

### Phase 1: 스캐폴딩 + 학술 근거 (6 커밋)
```
c9c53ac  feat: 전체 스캐폴딩 (66파일, Next.js 15)
211941f  feat: story structure + 학술 근거 주석
4d437d4  fix: 학술적 정확성 5건 수정
f80ef46  feat: 자율 에이전트 아키텍처 (도구 시스템 + 런타임 루프)
22643f8  feat: 4계층 Graph 온톨로지 스키마 재설계
8713eb7  feat: 논문 기반 6개 기능 (keyword, novelty, TRIZ, judge 등)
```

### Phase 2: Graph 인프라 연결 (이번 세션, 미커밋)

#### 2-1. Graph 쿼리 모듈 (`modules/graph/queries/` — 7파일 신규)
| 파일 | 내용 |
|------|------|
| `ideas.ts` | Idea CRUD Cypher 쿼리 + in-memory helper |
| `concepts.ts` | Concept CRUD + 도메인별 검색 |
| `sessions.ts` | Session 생성/상태 업데이트/이력 |
| `connections.ts` | Edge 생성 + 3계층 분류 (creation/semantic/structural) |
| `search.ts` | 전체 노드 텍스트 검색 + in-memory tokenSearch |
| `traversal.ts` | BFS 이웃 탐색 + 서브그래프 추출 쿼리 |
| `index.ts` | 전체 export |

#### 2-2. Graph 서비스 레이어 (`modules/graph/service.ts` — 1파일 신규)
- **Dual-mode**: `NEO4J_URI` 환경변수 유무로 Memgraph/in-memory 자동 전환
- `addNode()`, `getNode()`, `listNodes()` — 노드 CRUD
- `addEdge()`, `listEdges()` — 엣지 CRUD
- `searchGraph()` — 키워드 검색
- `getNeighborhood()` — N홉 BFS 이웃 탐색
- `getVisualizationData()` — 3D react-force-graph 데이터 변환
- `getStats()` — 그래프 통계
- `getImmersionContext()` — Immersion phase용 기존 지식 추출
- `persistSession()` — **세션 완료 → Graph 영구 저장** ("ideas compound forever")

#### 2-3. API 라우트 실구현 (stub → 실제, 5파일)
| 라우트 | 변경 |
|--------|------|
| `GET/POST /api/graph/nodes` | 노드 목록/생성, 통계 포함 |
| `GET/POST /api/graph/edges` | 엣지 목록/생성, 카테고리 분류 |
| `GET /api/graph/search` | 키워드 검색 + `?nodeId=` 이웃 탐색 |
| `GET /api/graph/visualize` | mock/seed/live 3모드, 빈 그래프 시 mock fallback |
| `GET /api/graph/stats` | **신규** — 전체 통계 + Memgraph 연결 상태 |

#### 2-4. Immersion Phase 실구현 (2파일 수정)
- **Light mode** (`four-is.ts`): `getImmersionContext()` → `divergentGenerate()`에 Graph 컨텍스트 주입
- **Heavy mode** (`multi-agent.ts`): `getImmersionContext()` → researcher 에이전트의 baseContext에 주입
- **Divergent prompt** (`divergent.ts`): graphContext 파라미터 추가, 기존 아이디어와 차별화 지시

#### 2-5. 세션 결과 → Graph 영구 저장
- `persistSession()` — 세션 완료 시 Domain/Topic/Session/Idea 노드 + 관계 엣지 자동 생성
- `session/route.ts` — light/heavy 모두에서 `persistSession()` 호출
- 다음 세션의 Immersion에서 자동으로 이전 아이디어 재활용

#### 2-6. 기타
- **Memgraph 스키마 자동 초기화** — `driver.ts`에 `initSchema()` + `ensureConnection()` 추가
- **TRIZ 40원리 전체 확장** — 20개 → 40개 (Altshuller 1999 전체)
- 빌드 성공 (18페이지, 102kB First Load JS)

---

## 프로젝트 구조 (최종)
```
projects/creative-api/src/
├── app/
│   ├── (marketing)/        — 랜딩 (3D 히어로), 가격
│   ├── (app)/              — 그래프뷰어, 대시보드, 세션
│   └── api/
│       ├── creative/       — brainstorm, evaluate, iterate, session
│       ├── graph/          — nodes, edges, search, visualize, stats  ← 실구현 완료
│       └── pipeline/       — heavy (ClawTeam)
├── modules/
│   ├── creativity/         — 이론 5, 기법 5, 파이프라인, 프롬프트, 평가
│   ├── graph/
│   │   ├── driver.ts       — Memgraph Bolt 드라이버 + initSchema
│   │   ├── schema.ts       — 4계층 온톨로지 (7노드, 22엣지)
│   │   ├── service.ts      — dual-mode 서비스 + persistSession  ← NEW
│   │   ├── transform.ts    — → react-force-graph-3d 변환
│   │   └── queries/        — ideas, concepts, sessions, connections, search, traversal  ← NEW
│   ├── agents/
│   │   ├── runtime/        — agent-runner, multi-agent, definitions
│   │   └── tools/          — 11종 (TRIZ 40원리 전체 포함)  ← EXPANDED
│   └── payment/            — tiers
├── components/graph/       — ForceGraph3D (WebGL + Bloom)
├── config/                 — graph-styles, creativity, site, nav
└── types/                  — graph, creativity, session, agent, api
```

---

## Next Steps

### 즉시 (인프라)
1. **Google VM 세팅** — `scripts/setup-vm.sh` 실행 → Memgraph 설치
2. **`.env.local`에 환경변수 설정** — `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` → dual-mode가 자동 전환
3. **`/api/graph/stats` 호출로 연결 확인** — `connection.connected: true` 확인

### 중기 (기능)
4. **결제 연동** — LemonSqueezy (BizScope 패턴 이식)
5. **Vercel 배포** — `vercel link` + `vercel env add`
6. **대시보드 페이지** — `/dashboard`에서 `/api/graph/stats` 데이터 렌더링
7. **세션 히스토리 페이지** — 과거 세션 목록 + 그래프 성장 추이

### 논문화
8. **수업자료 29슬라이드 대조 감사** — `memory/creative-api/lecture-audit.md`
9. **경쟁자 차별화** — TRIZ Agents vs 우리 (`memory/creative-api/paper-insights.md`)

---

## 기술 정보

### 빌드/실행
```bash
pnpm --filter @wmcp/creative-api dev    # localhost:3001
pnpm --filter @wmcp/creative-api build  # 빌드 확인
```

### 환경변수 (.env.local)
```
NEO4J_URI=bolt://<VM_IP>:7687
NEO4J_USER=memgraph
NEO4J_PASSWORD=<pw>
CLAWTEAM_API_URL=http://<VM_IP>:8000
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_SEARCH_API_KEY=<key>
GOOGLE_SEARCH_CX=<cx>
```

### 기술 스택
- Next.js 15.5, React 19, TypeScript 5.5, Tailwind 4
- react-force-graph-3d + Three.js (3D 시각화)
- Anthropic SDK (에이전트 LLM + tool calling)
- neo4j-driver (Memgraph Bolt 호환)

### 메모리
`D:\DevCache\claude-data\projects\D--Data-28-WMCP\memory\creative-api\` (20파일)

### 논문
`D:\Data\28_WMCP\clone\papers\` (25편 PDF)

### GitHub
https://github.com/akfldk1028/WMCP — master 브랜치
