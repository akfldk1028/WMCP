# HANDOFF — BizScope (2026-04-13 세션)

## Goal
BizScope 기업/아이디어 분석을 **대화형 PPT 생성 모드**로 전환.
왼쪽에 PPT 섹션 콘텐츠 + 오른쪽에 채팅 사이드바. AI가 섹션을 순차 생성하면서 유저와 대화, 피드백 반영 후 재생성 가능.

## Current Progress (이번 세션 완료)

### 1. Qwen 프로바이더 추가
- **파일**: `src/lib/claude.ts`
- Provider union에 `'qwen'` 추가
- `getOpenAICompatBaseURL()` 헬퍼로 xai/qwen baseURL 통합
- 엔드포인트: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` (국제 계정)
- 우선순위: Anthropic > OpenAI > xAI > **Qwen** > Gemini
- generateSection, generateChat, streamChat, getAllProviders, callProvider 모두 `case 'qwen'` 추가

### 2. 회사 목록 추가
- **파일**: `src/components/ui/CompanyInput.tsx`, `src/lib/finance.ts`
- 헬프데스크: Zendesk, Freshworks, ServiceNow, HubSpot
- 디지털트윈: Siemens, PTC, Ansys, Bentley Systems, Autodesk, Unity, 3D Systems
- 한글/영문 티커 매핑 추가

### 3. 대화형 분석 모드 (핵심 변경)
- **`src/modules/analysis-chat/useAnalysisFlow.ts`** — 전면 재작성
  - 섹션 순차 자동 생성 (멈추지 않고 계속 진행)
  - 유저가 메시지 보내면 `pausedRef=true`로 일시정지
  - "다음", "ㅇㅇ", "ok" 등 감지 → 재개
  - 피드백은 `feedbackRef`에 축적 → 다음 재생성 시 userFeedback으로 전달
  - `regenerateSection()` — 현재 섹션을 피드백 반영하여 재생성

- **`src/modules/analysis-chat/AnalysisChat.tsx`** — 3컬럼 레이아웃
  - 왼쪽 사이드바 (220px): `AnalysisCanvas` (섹션 nav + 진행률)
  - 센터 (flex-1): `SectionRenderer`로 PPT 콘텐츠 렌더링
  - 오른쪽 사이드바 (320px): 채팅 메시지 + react-markdown 렌더링

- **`src/app/api/section/[type]/route.ts`** — `userFeedback` 파라미터 추가
  - 피드백 텍스트를 research에 주입: `## User Feedback (incorporate this into the analysis)`

- **`src/app/report/new/page.tsx`**
  - `handleCompanySubmit` → `setInteractiveConfig` (대화형 모드 진입)
  - `handleIdeaSubmit` → 동일

### 4. JSON 파싱 수리
- **파일**: `src/frameworks/parse-json.ts`
- `repairJSON()` 함수 추가: trailing comma, 잘린 JSON, 문자열 내 개행 수리
- Qwen의 불완전한 JSON 출력 대응

### 5. 기타
- `vitest.config.ts` — Vitest 4.x `environmentMatchGlobs` 제거 (빌드 에러 수정)
- `ChatInput.tsx` — 하드코딩 검정 배경(`#1c1b1d`) 제거 → Tailwind 테마 색상
- `react-markdown` + `remark-gfm` 설치 — 채팅 마크다운 렌더링
- i18n `ko.ts` — placeholder 변경: "피드백을 입력하거나, '다음'을 입력하세요"

### 6. Vercel 환경변수 추가
- `QWEN_API_KEY` (production)
- `EXA_API_KEY` (production) — 웹 검색용
- `BRAVE_API_KEY` (production) — 검색 백업
- 기존 `GOOGLE_GEMINI_API_KEY`는 Vercel에 없었음 (로컬만)

## What Worked
- Qwen OpenAI 호환 API가 잘 동작 (국제 엔드포인트 필수: `dashscope-intl`)
- `repairJSON()`으로 Qwen의 불안정한 JSON 출력 90% 이상 복구
- `useAnalysisFlow` 자동 진행 + 유저 메시지 시 일시정지 패턴
- `SectionRenderer`를 `AnalysisChat`에서 직접 사용 — PPT 콘텐츠 정상 렌더링

## What Didn't Work
- `dashscope.aliyuncs.com` (중국 엔드포인트) → 401 에러. 반드시 `dashscope-intl` 사용
- react-markdown v10에서 `className` prop 제거됨 → div로 감싸야 함
- Vercel에 검색 API 키 없으면 AI 학습 데이터만 사용 → 2024년까지만 나옴
- 자동 멈춤(auto-pause) 매 섹션 → 유저가 "계속 돌아가야 하는데" 불만 → 자동 진행으로 변경

## Next Steps (우선순위 순)

### 1. 왼쪽 사이드바에 18p/72p 모드 토글 복원 (긴급)
- `ReportViewer.tsx` lines 124-139에 compact/expanded 토글 있음
- `AnalysisChat.tsx` 왼쪽 사이드바에 동일 토글 추가 필요
- compact = 섹션당 1페이지 (18p), expanded = 섹션당 서브페이지 (72p)
- `generateCompactPages()` / `generateExpandedPages()` from `src/lib/pages.ts`
- SectionRenderer의 `subPage` prop으로 제어 (현재 `-1`로 전체 표시)

### 2. 피드백 기반 섹션 재생성 테스트
- `regenerateSection()` 함수는 구현됨
- UI에 "재생성" 버튼도 있음 (control bar, isPaused일 때)
- 실제 피드백 → 재생성 → 내용 변경 확인 필요

### 3. Planning 모드(/planning)에서도 ChatInput 검정 배경 수정
- `ChatInput.tsx`는 공유 컴포넌트 — 이미 수정했으나 `/planning` 페이지에서도 확인 필요

### 4. 기존 TODO (이전 세션)
- P6: 멀티모델 브레인스토밍 (brainstorm-mcp API mode)
- i18n: success 페이지 + 키 찾기 한국어 → i18n
- rate limit: in-memory → Redis
- BIZSCOPE_API_KEY legacy fallback 제거

## Key Files Changed This Session
```
src/lib/claude.ts                          — Qwen provider + getOpenAICompatBaseURL
src/components/ui/CompanyInput.tsx          — 회사 11개 추가
src/lib/finance.ts                         — 티커 매핑 추가
src/modules/analysis-chat/useAnalysisFlow.ts — 전면 재작성 (자동 진행 + pause/resume)
src/modules/analysis-chat/AnalysisChat.tsx  — 3컬럼 레이아웃 (nav + PPT + chat)
src/app/api/section/[type]/route.ts        — userFeedback 파라미터 + resolveAuth
src/app/report/new/page.tsx                — handleCompanySubmit/handleIdeaSubmit → interactive
src/frameworks/parse-json.ts               — repairJSON()
src/modules/planning-chat/ChatInput.tsx    — 검정 배경 제거
src/i18n/ko.ts                             — placeholder 변경
vitest.config.ts                           — environmentMatchGlobs 제거
```

## Build/Deploy
```bash
pnpm --filter @wmcp/bizscope dev          # localhost:3000
pnpm --filter @wmcp/bizscope build        # 프로덕션 빌드
vercel deploy --prod                       # 배포 (bizscope-theta.vercel.app)
```

## Vercel Production Env Vars
```
QWEN_API_KEY       — DashScope 국제 (dashscope-intl.aliyuncs.com)
EXA_API_KEY        — Exa AI 검색
BRAVE_API_KEY      — Brave 검색 (백업)
```
