# HANDOFF — BizScope (2026-03-30 세션 2)

## 이번 세션 완료: P0~P5 전체 완료 + Vercel 배포

### 완료 항목

| # | 항목 | 변경 파일 | 핵심 |
|---|------|----------|------|
| P0 | 브레인스토밍 사용자↔AI | route.ts | 멀티모델 태그 삭제 → 3라운드 프롬프트 기반 (Landscape/Devil's Advocate/Synthesis) |
| P1 | extractBmcBlocks 노이즈 | PlanningChat.tsx | `NOISE_RE` 정규식으로 진행 메시지 필터링 |
| P2 | 서비스기획 8단계 대화형 | route.ts, PlanningChat.tsx, planning/page.tsx, report/new/page.tsx | 프롬프트 상세화 + extractPlanFromA2UI + PlanStageList 실시간 |
| P3 | Claude 플러그인 E2E | (변경 없음) | 53도구, initialize/tools/list/ping/web-search/auth 전부 통과 |
| P4 | SSE 토큰 스트리밍 | claude.ts, route.ts, PlanningChat.tsx | streamChat() async generator + send('token') + 점진적 UI |
| P5 | Vercel 배포 | — | bizscope-theta.vercel.app + bizscope-rho.vercel.app 200 OK |

### 테스트
- 127개 전부 통과 (24파일)
- 빌드 성공 (Next.js 15.5.14)
- Vercel 프로덕션 배포 성공

---

## 다음 세션 TODO

### P6: 멀티모델 브레인스토밍 (brainstorm-mcp API mode)
- `src/lib/brainstorm.ts` + `/api/brainstorm/route.ts` — 이미 코드 존재
- PlanningChat.tsx에 brainstorm SSE 핸들러도 존재 (dead code)
- 필요: AI가 기획 중 특정 결정에서 멀티모델 토론 트리거
- 조건: API 키 2개 이상 (OPENAI + GEMINI 등)
- brainstorm-mcp submodule 참조: `submodules/brainstorm-mcp/`

### i18n 잔여
- `/pricing/success` 페이지 일부 한국어 하드코딩
- 키 찾기 UI 한국어 하드코딩

### rate limit Redis 전환
- 현재 in-memory Map — 서버리스에서 인스턴스별 리셋
- Upstash Redis로 전환 필요

### BIZSCOPE_API_KEY legacy fallback 제거
- `isLegacyEnvKey()` — 마이그레이션 완료 후 제거

---

## Architecture Key Points

### 토큰 스트리밍 파이프라인
```
claude.ts: streamChat() → async generator (Anthropic/OpenAI/xAI/Gemini)
route.ts:  for await → send('token', chunk) → 완료 → parseResponse() → send('text') + send('a2ui')
client:    consumeSSE onToken → filter+replace 점진적 업데이트 → done → A2UI 캔버스 반영
```

### A2UI 이중 추출
```
텍스트: extractBmcBlocks() / extractPlanStages() — 헤딩 매칭 + NOISE_RE 필터
A2UI:  extractBmcFromA2UI() / extractPlanFromA2UI() — 컴포넌트 매칭
merge: { ...fromText, ...fromA2UI } — A2UI 우선
```

### 브레인스토밍 (사용자↔AI)
```
트리거: 어려운 결정 or "브레인스토밍/토론" 명시
Round 1: Landscape — 옵션별 장단점 + "어떤 쪽이 끌리세요?"
Round 2: Devil's Advocate — 선호 약점 도전
Round 3: Synthesis — A2UI Card (Recommendation / Tradeoffs / Open Question)
→ BMC/서비스기획 복귀
```

### 서비스기획 8단계
```
BMC 9블록 완료 → "서비스기획 8단계 시작합니다"
1. Executive Summary (프로젝트 개요)
2. Conceptual Framework (컨셉 프레임워크)
3. Design & Content (디자인 & 컨텐츠 전략)
4. Technical Architecture (기술 아키텍처)
5. Development Roadmap (개발 로드맵)
6. Marketing & Community (마케팅 & 커뮤니티)
7. Post-Launch (출시 후 & 진화)
8. Legal & Ethical (법률 & 윤리)
→ StageCard A2UI + PlanStageList 실시간 업데이트
```

## 빌드/실행
```bash
pnpm --filter @wmcp/bizscope dev       # localhost:3000
pnpm --filter @wmcp/bizscope test      # 127 tests (24 files)
pnpm --filter @wmcp/bizscope build     # 프로덕션 빌드
vercel --prod --scope clickaround8-4495s-projects  # 배포
```

## 메모리
- `memory/bizscope/overview.md` — 전체 개요 업데이트 (2026-03-30)
- `memory/bizscope/planning-mode.md` — P0~P5 완료 기록 (2026-03-30)
- `memory/bizscope/deployment.md` — URL 2개 + 53도구 MCP (2026-03-30)
- `memory/MEMORY.md` — 인덱스 업데이트됨
