# 06. Service Worker 확장

## 문제 제기

기본 WebMCP는 **페이지가 열려 있을 때만** 도구가 작동한다. 하지만 실제 사용 시나리오에서는:

```
시나리오: 캠핑장 예약

사용자: 지도 앱에서 캠핑장을 보고 있음 (이 탭에 집중하고 싶음)
     "이 캠핑장 예약해줘"

에이전트: 예약 사이트의 도구가 필요한데...
     - 새 탭을 열면? → 사용자의 지도 탐색을 방해
     - 현재 탭을 이동하면? → 지도 페이지를 잃음

     필요한 것: 백그라운드에서 예약 사이트의 도구를 호출하는 방법
```

---

## 해결책: Service Worker에서 WebMCP 도구 제공

Service Worker(SW)가 WebMCP 도구를 등록하면, 페이지를 열지 않고도 백그라운드에서 도구를 실행할 수 있다.

```
기본 WebMCP:
  [열린 탭] ---도구 호출---> [페이지 JS에서 실행]

SW 확장 WebMCP:
  [에이전트] ---도구 호출---> [Service Worker에서 실행]
                                    |
                                    +---> 필요하면 새 창 열기
                                    +---> 또는 백그라운드에서 완료
```

---

## 전체 흐름 (Sequence Diagram)

```
사용자      에이전트      브라우저       디스커버리     서버          Service Worker
  |           |            |            |            |              |
  | "예약해줘" |            |            |            |              |
  |---------->|            |            |            |              |
  |           |            |            |            |              |
  |           | 적합한 앱 찾기           |            |              |
  |           |----------->|----------->|            |              |
  |           |            |            |            |              |
  |           |            | 추천 사이트  |            |              |
  |           |            |<-----------|            |              |
  |           |            |            |            |              |
  |           |            |                         |              |
  |           | (최초) SW 설치 요청       |            |              |
  |           |----------->|            |            |              |
  |           |            |                         |              |
  |  "이 사이트의 도구를     |                         |              |
  |   사용 허용?"          |                         |              |
  |<-----------------------|                         |              |
  |  "허용"                |                         |              |
  |----------------------->|                         |              |
  |           |            |                         |              |
  |           |            | manifest.json 요청       |              |
  |           |            |------------------------>|              |
  |           |            |          manifest 응답   |              |
  |           |            |<------------------------|              |
  |           |            |                         |              |
  |           |            | service-worker.js 요청   |              |
  |           |            |------------------------>|              |
  |           |            |          SW 코드 응답    |              |
  |           |            |<------------------------|              |
  |           |            |                         |              |
  |           |            | SW 설치 & 활성화          |              |
  |           |            |------------------------------------->|
  |           |            |                         |              |
  |           |            |              도구 등록    |              |
  |           |            |<-------------------------------------|
  |           |            |                         |              |
  |           | 도구 목록 갱신            |            |              |
  |           |<-----------|            |            |              |
  |           |            |            |            |              |
  |           | 도구 호출   |            |            |              |
  |           |----------->|            |            |              |
  |           |            | execute 콜백 실행        |              |
  |           |            |------------------------------------->|
  |           |            |                         |              |
  |           |            |              백엔드 요청  |              |
  |           |            |                         |<------------|
  |           |            |              응답        |              |
  |           |            |                         |------------>|
  |           |            |                         |              |
  |           |            |              결과 반환    |              |
  |           |            |<-------------------------------------|
  |           |            |            |            |              |
  |           | 도구 결과   |            |            |              |
  |           |<-----------|            |            |              |
  |           |            |            |            |              |
  | "예약 완료"|           |            |            |              |
  |<----------|            |            |            |              |
```

---

## SW에서의 도구 등록

Service Worker에서는 `self.agent` 객체를 통해 도구를 등록한다:

```javascript
// service-worker.js

self.agent.provideContext({
    tools: [
        {
            name: "add-to-cart",
            description: "Add an item to the user's shopping cart.",
            inputSchema: {
                type: "object",
                properties: {
                    itemId: { type: "string", description: "Product ID" },
                    quantity: { type: "number", description: "Quantity" }
                },
                required: ["itemId"]
            },
            async execute(params, clientInfo) {
                // 세션별 장바구니 관리
                const cart = carts.get(clientInfo.sessionId);
                cart.add(params.itemId, params.quantity || 1);

                // 백엔드 동기화
                await syncCartWithBackend(cart);

                return { content: [{ type: "text", text: "Added to cart." }] };
            }
        }
    ]
});
```

### 페이지 JS vs Service Worker 비교

| 측면 | 페이지 JS | Service Worker |
|------|----------|---------------|
| 진입점 | `navigator.modelContext` | `self.agent` |
| 수명 | 탭이 열려 있는 동안 | 설치 후 영구적 (브라우저가 관리) |
| DOM 접근 | 가능 | 불가능 |
| UI 갱신 | 직접 가능 | postMessage로 간접 통신, 또는 새 창 열기 |
| 상태 관리 | 페이지 JS 변수, DOM | IndexedDB, Cache API |
| 인증 | 브라우저 세션 자동 | 브라우저 세션 + Origin 기반 |

---

## 세션 관리 (Session ID)

SW는 여러 에이전트 세션을 동시에 처리할 수 있다. 예를 들어 사용자가 대화 2개를 열어놓고 둘 다 같은 쇼핑 사이트의 도구를 쓸 때:

```
대화 1: "생일 선물 사줘"   → SW → 장바구니 A (sessionId: "conv-1")
대화 2: "식료품 사줘"      → SW → 장바구니 B (sessionId: "conv-2")
```

```javascript
async execute(params, clientInfo) {
    // clientInfo.sessionId로 어떤 대화에서 온 요청인지 구분
    const cart = carts.get(clientInfo.sessionId);
    cart.add(params.itemId);
}
```

---

## 디스커버리 (Discovery)

### 문제

기본 WebMCP에서는 사용자가 먼저 사이트에 방문해야 도구가 발견된다. SW 확장에서는 사이트를 방문하지 않고도 에이전트가 관련 도구를 찾을 수 있어야 한다.

### 접근 1: Web App Manifest 활용

```json
{
    "name": "FreshMart Grocery",
    "description": "Online grocery shopping with delivery",
    "start_url": "/",
    "serviceworker": {
        "src": "service-worker.js",
        "scope": "/",
        "use_cache": false
    }
}
```

- Payment Handler API에서 이미 `"serviceworker"` 필드를 도입
- 여기에 WebMCP 지원 여부를 나타내는 필드를 추가할 수 있음
- 크롤러/디렉토리가 이 정보를 인덱싱

### 접근 2: 정적 도구 매니페스트

도구의 이름/설명/스키마를 매니페스트에 선언적으로 정의:

```json
{
    "tools": [
        {
            "name": "add-to-cart",
            "description": "Add an item to shopping cart",
            "inputSchema": { /* ... */ }
        }
    ]
}
```

**한계**: 정적이므로 동적 도구(앱 상태에 따라 변하는 도구)를 표현 불가

### 접근 3: 고수준 기능 광고 (권장 방향)

도구를 직접 선언하지 않고, 사이트가 제공하는 "기능"을 고수준으로 광고:

```json
{
    "capabilities": ["grocery-shopping", "delivery", "meal-planning"]
}
```

에이전트가 이 정보로 관련 사이트를 찾고, 실제 도구 등록은 SW 활성화 후 동적으로.

---

## 사용 사례 상세

### 사례 1: 백그라운드 Todo 추가

```
Sarah: "할 일 목록에 '세탁물 찾기'랑 '치과 예약 전화' 추가해"

에이전트가 todoapp.example의 SW가 등록한 도구를 발견:

  addTodoItem("세탁물 찾기", "medium")
  addTodoItem("치과 예약 전화", "medium")

SW가 처리:
  1. 로컬 저장소에 할 일 추가
  2. 네트워크 가능 시 백엔드 동기화
  3. 시스템 알림으로 추가 완료 표시

Sarah는 현재 작업을 중단하지 않음.
나중에 Todo 앱을 열면 이미 항목이 추가되어 있음.
```

### 사례 2: 복합 워크플로우 (식료품 주문)

```
Mike: "이번 주 식단 계획하고 필요한 재료 전부 주문해"

에이전트가 freshmart.example의 SW 도구들을 사용:

  1. searchProducts("닭가슴살") → 상품 목록 반환
  2. searchProducts("쌀") → 상품 목록 반환
  3. searchProducts("브로콜리") → 상품 목록 반환
  4. addToCart(product_id, 1) × 여러 번
  5. placeOrder()

placeOrder() 호출 시:
  - SW가 저장된 결제 정보 확인
  - 결제 정보 없음 → 브라우저 창 열어서 결제 페이지 표시
  - Mike가 카드 정보 입력 (에이전트는 결제 정보를 절대 보지 않음)
  - 결제 완료 → postMessage로 SW에 알림 → SW가 placeOrder() 완료

핵심: 에이전트가 쇼핑 자동화 + 결제는 사용자에게 안전하게 위임
```

---

## UI 핸드오프 패턴

SW에서 사용자 상호작용이 필요할 때:

```
Service Worker
    |
    | "결제 정보가 필요합니다"
    |
    v
clients.openWindow("https://example.com/checkout")
    |
    v
+----------------------------+
| 브라우저 창 (결제 페이지)     |
|                            |
| [카드번호: ____]            |
| [유효기간: __/__]           |
| [CVC: ___]                 |
|                            |
| [결제하기] 버튼              |
+----------------------------+
    |
    | 결제 완료 시
    | postMessage({ type: "payment-complete", orderId: "..." })
    |
    v
Service Worker가 메시지 수신
    |
    v
placeOrder() Promise resolve
```

---

## 라우팅: 탭 vs Service Worker

같은 origin에 탭도 열려 있고 SW도 등록되어 있으면 어떻게 되나?

### 규칙

```
1. 단일 도구 호출은 절대 두 곳에 동시에 라우팅되지 않음

2. 에이전트가 컨텍스트를 보고 판단:
   - 사용자가 해당 사이트의 탭을 보고 있으면 → 탭의 도구 우선
   - 사이트가 열려있지 않으면 → SW의 도구

3. 모호하면 사용자에게 물어봄:
   - "이메일 탭에서 직접 보내드릴까요, 아니면 백그라운드에서 보내드릴까요?"
```

### 예시

```
상황: 이메일 앱이 탭에도 열려있고 SW도 등록됨
요청: "매니저에게 현재 진행 상황 이메일 보내줘"

에이전트 판단:
  - 사용자가 이미 이메일 탭에서 초안을 작성 중이다
  - 초안 내용이 "진행 상황"과 관련된다
  → 탭의 도구를 사용하여 기존 초안에 내용을 채움

반대 상황:
  - 사용자가 지도 앱을 보고 있다
  - 이메일 탭은 열려있지 않다
  → SW의 도구를 사용하여 백그라운드에서 이메일 전송
```

---

## 보안 고려사항 (SW 특유)

### Lethal Trifecta의 SW 적용

| 요소 | SW에서의 상황 |
|------|-------------|
| Private Data | SW가 사용자 데이터에 접근 가능 (IndexedDB, 쿠키) |
| Untrusted Content | 사이트의 도구가 외부 콘텐츠를 반환할 수 있음 |
| External Communication | 에이전트가 다른 origin의 SW와도 통신 가능 |

### 제안된 완화책

```
1. 에이전트 세션을 단일 origin/scope로 제한
   - SW 도구에 접근하면 해당 대화에서는 그 origin만 사용
   - 다른 사이트의 도구와 데이터가 섞이지 않도록

2. 외부 통신 제한
   - SW 도구 사용 중 웹 검색/외부 API 호출 비활성화
   - 데이터 유출 경로 차단

3. 사용자 동의
   - 최초 SW 설치 시 권한 프롬프트
   - 고위험 동작 시 추가 확인
```

### 열린 질문

- 다중 origin 도구 사용이 안전하게 가능한가?
- cross-origin 워크플로우가 강력한 만큼 위험도 큰데, 어떻게 균형을 맞출 것인가?
