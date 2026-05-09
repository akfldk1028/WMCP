# BizScope AI — 통합 키 인증 설계

## 현재 상태 (AS-IS)

```
결제 → LemonSqueezy webhook → Redis에 bsai_xxx 생성
                                    ↓
                            키 전달 방법 없음 ❌
                            사용자가 Redis 직접 조회해야 함

인증 방식이 3개로 분산:
  웹앱:  x-license-key 헤더 (bsai_xxx)
  MCP:   Authorization: Bearer {BIZSCOPE_API_KEY} (env 고정값, 전체 공유)
  tools: Authorization: Bearer {BIZSCOPE_API_KEY} (env 고정값)
```

**문제:**
1. 결제 후 키 전달 경로 없음 — 사용자가 키를 받을 수 없음
2. MCP/tools는 `BIZSCOPE_API_KEY` 단일 키 — 과금 불가, 사용자 식별 불가
3. 인증 코드가 5곳에 중복 (`section/[type]`, `transport-sse`, `transport-http`, `tools/search`, `tools/financial`)
4. 서드파티(Claude Code, n8n)에서 유료 사용자가 자기 키로 호출하는 경로 없음

## 목표 (TO-BE)

```
하나의 키(bsai_xxx)로 모든 경로 인증.
결제 → 키 자동 전달 → 어디서든 사용.

  웹앱:         localStorage에 키 저장 → x-api-key 헤더
  MCP:          Authorization: Bearer bsai_xxx
  REST API:     Authorization: Bearer bsai_xxx
  Claude Code:  claude mcp add --header "Authorization:Bearer bsai_xxx" ...
  n8n:          HTTP Request 노드에 Bearer 토큰
```

## 1. 키 전달 플로우

### 1A. 체크아웃 → 키 수령 (메인 플로우)

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐
│ /pricing │────▶│ LemonSqueezy │────▶│ /pricing/success │
│  페���지   │     │  Checkout    │     │   ?session=xxx   │
└──────────┘     └──────┬───────┘     └────────┬─────────┘
                        │                       │
                  webhook 발동            polling 시작
                        │                       │
                        ▼                       ▼
                ┌──────────────┐      ┌──────────────────┐
                │ Redis에 키    │      │ GET /api/checkout │
                │ 생성 + session│      │   /status?s=xxx  │
                │ 완료 표시     │      │                  ��
                └──────────────┘      │ → { status, key }│
                                      └──────────────────┘
```

**상세 단계:**

1. **체크아웃 시작** (`/pricing` 페이지)
   - 사용자가 "구매" 클릭
   - 클라이언트에서 `checkout_session` 토큰 생성 (crypto.randomUUID)
   - LemonSqueezy checkout URL에 query param 추가:
     `?checkout[custom][session]={session}&checkout[success_url]={origin}/pricing/success?session={session}`
   - Redis: `bsai:checkout:{session}` → `{ status: 'pending', createdAt }` (TTL 1시간)

2. **결제 완료 → 웹훅** (기존 `/api/webhooks/lemonsqueezy`)
   - `custom_data.session`에서 session 토큰 추출
   - 기존대로 `bsai_xxx` 키 생성 → Redis 저장
   - 추가: `bsai:checkout:{session}` → `{ status: 'complete', licenseKey: 'bsai_xxx' }` 업데이트

3. **성공 페이지** (`/pricing/success?session=xxx`)
   - 2초 간격으로 `GET /api/checkout/status?session=xxx` 폴링
   - 응답: `{ status: 'pending' }` 또는 `{ status: 'complete', licenseKey: 'bsai_xxx', plan: 'pro' }`
   - 완료 시: 키를 화면에 표시 + 복사 버튼 + localStorage 자동 저장
   - 타임아웃(60초): "키가 아직 생성 중입니다. 이메일로 전송됩니다." 안내

4. **폴백: 이메일로 키 조회** (`/pricing` 페이지 하단)
   - `POST /api/license/lookup` — `{ email }` → `{ keys: [{ key: 'bsai_xxx', plan, credits }] }`
   - Rate limit: IP당 3회/분
   - 이메일 인증 없이 조회 허용 (키 자체가 인증 수단이므로, 이메일만으로는 API 호출 불가)

### 1B. 기존 사용자 (이미 결제했지만 키 모르는 경우)

- `/pricing` 페이지에 "키 찾기" 섹션 추가
- 결제 시 사용한 이메일 입력 → `/api/license/lookup` → 키 목록 표시
- 키의 앞 8자 + 마지막 4자만 표시, "전체 보기" 클릭 시 전체 노출

## 2. 통합 인증 미들웨어

### 2A. `resolveApiKey(request)` — 단일 함수

```ts
// src/lib/auth.ts

/** 요청에서 API 키를 추출. 3가지 헤더 지원. */
export function extractApiKey(request: Request): string | null {
  // 1. Authorization: Bearer bsai_xxx (표준, MCP/REST)
  const auth = request.headers.get('authorization')?.trim();
  if (auth?.startsWith('Bearer bsai_')) {
    return auth.slice(7);
  }

  // 2. x-api-key: bsai_xxx (API Gateway 패턴)
  const xApiKey = request.headers.get('x-api-key')?.trim();
  if (xApiKey?.startsWith('bsai_')) {
    return xApiKey;
  }

  // 3. x-license-key: bsai_xxx (레거시 웹앱, 하위 호환)
  const xLicense = request.headers.get('x-license-key')?.trim();
  if (xLicense?.startsWith('bsai_')) {
    return xLicense;
  }

  return null;
}

export interface AuthResult {
  key: string;
  plan: 'free' | 'credits' | 'pro';
  credits: number;       // -1 = unlimited
  ensembleEnabled: boolean;
}

/** 키 검증 + 플랜 조회. null이면 Free tier. */
export async function resolveAuth(request: Request): Promise<AuthResult> {
  const key = extractApiKey(request);
  if (!key || !isValidKeyFormat(key)) {
    return { key: '', plan: 'free', credits: 0, ensembleEnabled: false };
  }

  const info = await getLicenseInfo(key);
  if (!info) {
    return { key: '', plan: 'free', credits: 0, ensembleEnabled: false };
  }

  return {
    key,
    plan: info.plan,
    credits: info.plan === 'pro' ? -1 : info.credits,
    ensembleEnabled: info.plan === 'pro',
  };
}
```

### 2B. 적용 범위

| 엔드포���트 | 현재 인증 | 변경 후 |
|-----------|----------|--------|
| `/api/section/[type]` | `x-license-key` 직접 파싱 | `resolveAuth(request)` |
| `/api/mcp` (HTTP) | `BIZSCOPE_API_KEY` env 비교 | `resolveAuth(request)` |
| `/api/mcp` (SSE) | `BIZSCOPE_API_KEY` env 비교 | `resolveAuth(request)` |
| `/api/tools/search` | `BIZSCOPE_API_KEY` env 비교 | `resolveAuth(request)` |
| `/api/tools/financial` | `BIZSCOPE_API_KEY` env ���교 | `resolveAuth(request)` |
| `/api/analysis/comment` | 인증 없음 | `resolveAuth(request)` |
| `/api/planning/chat` | 인증 없음 | `resolveAuth(request)` |
| `/api/license/check` | 바디에서 키 | 유지 (키 확인용) |
| `/api/license/use` | 바디에서 키 | 유지 (크레딧 차감용) |
| `/api/webhooks/*` | HMAC 서명 | 유지 (서버→서버) |

### 2C. Free tier 허용 정책

```
/api/section/[type]:    Free 허용 (2건 제한은 클라이언트 카운터)
/api/analysis/comment:  Free 허용 (섹션 생성에 종속)
/api/planning/chat:     Free 허용 (기획 모드)
/api/mcp:               키 필수 (서드파티 → 유료만)
/api/tools/*:           키 필수 (서드파티 → 유료만)
```

## 3. MCP 인증 통합

### AS-IS
```
BIZSCOPE_API_KEY=고정값 (env)
모든 MCP 사용자가 같은 키 공유
과금/사용량 추적 불가
```

### TO-BE
```
사용자 개인 bsai_xxx 키로 MCP 호출
Bearer bsai_xxx → resolveAuth → plan 확인 → 도구 실행
Free tier 차단 (MCP는 유료 전용)
```

**Claude Code 설정 예시:**
```bash
claude mcp add bizscope \
  --transport http \
  --header "Authorization: Bearer bsai_xxxxxxxxxxxxxxxxxxxx" \
  https://bizscope-rho.vercel.app/api/mcp
```

**n8n 설정 예시:**
```
HTTP Request 노드
  URL: https://bizscope-rho.vercel.app/api/mcp
  Method: POST
  Headers: Authorization: Bearer bsai_xxx
  Body: { "jsonrpc": "2.0", "method": "tools/call", ... }
```

### BIZSCOPE_API_KEY 마이그레이션

1단계: `resolveAuth`가 `bsai_xxx` 키 우선 확인
2단계: fallback으로 `BIZSCOPE_API_KEY` env도 계속 인정 (하위 호환)
3단계: 2주 후 BIZSCOPE_API_KEY 지원 제거

```ts
// transport-http.ts 변경 후
export async function handleHTTPPost(request: Request): Promise<Response> {
  const auth = await resolveAuth(request);

  // MCP는 유료 전용
  if (auth.plan === 'free') {
    // 하위 호환: BIZSCOPE_API_KEY env 확인
    const envKey = process.env.BIZSCOPE_API_KEY?.trim();
    if (envKey) {
      const bearer = request.headers.get('authorization')?.trim();
      if (bearer === `Bearer ${envKey}`) {
        // OK — legacy env key 허용
      } else {
        return unauthorized();
      }
    } else {
      return unauthorized();
    }
  }
  // ... 기존 로직
}
```

## 4. 사용량 추적

### Redis 키 구조 (추가)

```
bsai:usage:{key}:{YYYY-MM-DD}  → number (일별 API 호출 수)
  TTL: 90일

bsai:usage:{key}:reports       → number (총 리포트 생�� 수)
  TTL: 없음
```

### Rate Limit (플랜별)

| 플랜 | 리포트 | API 호출/분 | MCP |
|------|--------|------------|-----|
| Free | 2건 총 | 20/분 | ❌ |
| Credits | 크레딧만큼 | 30/분 | ✅ |
| Pro | 무제한 | 60/분 | ✅ |

### 사용량 기록 위치

`resolveAuth` 호출 후, 각 라우트 핸들러에서:
```ts
await trackUsage(auth.key, 'section-generate');  // 비동기, fire-and-forget
```

## 5. 키 관리

### 5A. API 엔드��인트

```
POST /api/license/lookup    { email }         → { keys: [{ key, plan, credits, createdAt }] }
POST /api/license/rotate    { licenseKey }    → { newKey }  (기존 키 무효화, 새 키 발급)
GET  /api/license/usage     (Bearer bsai_xxx) → { today, thisMonth, total, plan }
POST /api/checkout/status   { session }       → { status, licenseKey?, plan? }
```

### 5B. UI (pricing 페이지 확장)

```
/pricing
  ├── 플랜 선택 + 구매 버튼 (기존)
  ├── 라이선스 키 입력 (기존)
  ├── 키 찾기: 이메일 입력 → lookup
  └── 내 키 관리: 사용량 조회, 키 교체

/pricing/success?session=xxx
  └── 결제 완료 → 키 표시 + 복사 + 자동 저장
```

## 6. 구현 순서

### Phase 1: 통합 인증 미들웨어 (1일)
- `src/lib/auth.ts` — `extractApiKey`, `resolveAuth`
- 기존 5곳의 인증 코드를 `resolveAuth`로 교체
- `BIZSCOPE_API_KEY` fallback 유지

### Phase 2: 키 전달 플로우 (1일)
- 체크아웃 URL에 session 파라미터 추가
- `POST /api/checkout/status` 엔드포인트
- `/pricing/success` 페이지 (폴링 + 키 표시)
- 웹훅에 session → key 매핑 추가

### Phase 3: 키 관리 (0.5일)
- `POST /api/license/lookup` (이메일 → 키 조회)
- `/pricing` 페이지에 "키 찾기" UI 추가

### Phase 4: 사용량 추적 (0.5일)
- `trackUsage()` 함수
- `GET /api/license/usage` 엔드포인트
- Rate limit을 Redis 기반으로 전환

## 7. 보안 고려사항

| 위협 | 대응 |
|------|------|
| 키 유출 | rotate API로 즉시 교체. 키 앞 8자만 로그에 기록. |
| 이메일로 키 탈취 | lookup은 마스킹된 키만 반환 (앞8+뒤4). 전체 키는 checkout success에서만 노출. |
| Rate limit 우회 | Redis INCR + TTL 기반 (서버리스에서도 동작). |
| Replay attack | 각 키의 usage 추적으로 이상 패턴 감지. |
| BIZSCOPE_API_KEY 유출 | Phase 1에서 fallback으로 남기되, Phase 4 이후 제거. |

## 8. 변경하지 않는 것

- LemonSqueezy 결제 자체 (상품, 가격, 웹훅 시크릿)
- Redis 키 구조 (bsai:key:*, bsai:sub:*, bsai:order:*)
- 라이선스 키 포�� (bsai_[a-f0-9]{32})
- Free tier 2건 localStorage 카운터 (서버 비용 없는 게이트)
- 웹훅 HMAC 검증 로직
