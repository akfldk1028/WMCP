# 09. Chrome 구현 현황과 스펙 업데이트

> 기존 docs에 없던 최신 정보 (2026년 2월 기준)

## Chrome 146 구현 상태

### 현재 상황

| 항목 | 상태 |
|------|------|
| **Chrome 버전** | Chrome 146 Canary |
| **플래그** | `chrome://flags` → "WebMCP for testing" 또는 "Experimental Web Platform Features" |
| **상태** | DevTrial (프로덕션 아님) |
| **안정화 예상** | Chrome 146 stable: 2026년 3월경 |
| **공식 발표** | 2026년 2월 10일 Chrome for Developers 블로그 |
| **Early Preview** | 프로그램 가입자에게 문서/데모 접근 제공 |

### 다른 브라우저

| 브라우저 | 상태 |
|----------|------|
| **Chrome** | DevTrial (플래그 뒤) |
| **Edge** | 미발표, 하지만 Microsoft가 스펙 공동 저자 → 지원 가능성 높음 |
| **Firefox** | W3C 워킹 그룹 참여 중, 미구현 |
| **Safari** | W3C 워킹 그룹 참여 중, 미구현 |

### 공식 타임라인 예측

```
2025.08  스펙 첫 공개 (GitHub)
2026.02  Chrome 146 Early Preview 발표 ← 현재
2026.03  Chrome 146 Stable 출시 예정
2026 중반  Google Cloud Next / Google I/O에서 정식 발표 예상
2026 후반  더 넓은 롤아웃 예상
2027+    W3C 공식 표준화 진행
```

---

## GitHub 스펙 vs Chrome 구현: 차이점

### 스펙에는 없고 Chrome에 추가된 것: Declarative API

**이건 큰 변화다.** GitHub 스펙(index.bs)에는 Imperative API만 정의되어 있다. 하지만 Chrome 구현에서는 **Declarative API**가 추가되었다.

#### Declarative API (새로 추가)

HTML `<form>`에 속성을 추가하는 것만으로 도구를 등록할 수 있다. JavaScript 불필요.

```html
<!-- 기존 HTML 폼 -->
<form action="/search" method="POST">
    <input name="query" type="text" placeholder="Search...">
    <button type="submit">Search</button>
</form>

<!-- WebMCP Declarative API 적용 (속성만 추가) -->
<form action="/search" method="POST"
      toolname="search-products"
      tooldescription="Search for products by keyword"
      toolautosubmit>
    <input name="query" type="text" placeholder="Search...">
    <button type="submit">Search</button>
</form>
```

| 속성 | 설명 |
|------|------|
| `toolname` | 도구 이름 (에이전트가 참조) |
| `tooldescription` | 도구의 자연어 설명 (에이전트가 판단 근거로 사용) |
| `toolautosubmit` | 에이전트가 자동으로 폼을 제출할 수 있는지 여부 |

**에이전트 호출 감지**:
```javascript
form.addEventListener('submit', (event) => {
    if (event.agentInvoked) {
        // 에이전트가 호출한 경우
        console.log("Agent submitted this form");
    } else {
        // 사용자가 직접 제출한 경우
        console.log("Human submitted this form");
    }
});
```

#### Imperative API (기존 스펙과 동일)

```javascript
navigator.modelContext.registerTool({
    name: 'capture_console_errors',
    description: 'Capture recent console errors',
    inputSchema: {
        type: 'object',
        properties: {
            severity: { type: 'string', enum: ['error', 'warn', 'all'] },
            limit: { type: 'number' }
        },
        required: ['severity']
    },
    handler: async ({ severity, limit = 50 }) => {
        const logs = await getConsoleLogs({ severity, limit });
        return { entries: logs, count: logs.length };
    }
});
```

> **주의**: Chrome 구현에서는 `execute` 대신 `handler`라는 이름을 사용할 수 있음. API가 아직 안정화 전이라 변경 가능.

### 비교: Declarative vs Imperative

| | Declarative API | Imperative API |
|---|---|---|
| **구현 방법** | HTML 속성 추가 | JavaScript 코드 |
| **JS 필요** | 불필요 | 필수 |
| **적합한 용도** | 기존 폼 (검색, 로그인, 체크아웃) | 동적/복잡한 도구 |
| **개발 난이도** | 매우 낮음 | 중간 |
| **동적 갱신** | 불가 (정적) | 가능 |
| **기존 사이트 적용** | 속성만 추가하면 끝 | 코드 리팩토링 필요할 수 있음 |

---

## 개발자 도구

### Model Context Tool Inspector

Chrome이 출시한 개발자 도구 확장:
- 등록된 도구 목록 표시
- 에이전트 호출을 실시간으로 보여줌
- 스키마 정의 검증

### 데모 사이트

Google이 공개한 라이브 데모:
- 여행 예약 데모: https://travel-demo.bandarra.me/
- Declarative & Imperative API 모두 시연

---

## 성능 벤치마크 (초기)

| 지표 | 기존 방식 (DOM 파싱/스크린샷) | WebMCP |
|------|---|---|
| **토큰 소비** | 100% (기준) | ~33% (67% 감소) |
| **작업 정확도** | ~85-90% | ~98% |
| **속도** | 수 초 (스크린샷 + 분석) | < 100ms (직접 호출) |

---

## 시작하는 법 (지금 당장)

```
1. Chrome 146+ 설치 (Canary 또는 Dev 채널)
2. chrome://flags 에서 "Experimental Web Platform Features" 활성화
3. 브라우저 재시작
4. 기능 감지 코드 추가:
   if ('modelContext' in navigator) { /* WebMCP 사용 가능 */ }
5. 도구 등록 시작
```
