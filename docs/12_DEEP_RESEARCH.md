# 12. 심층 리서치: 생태계, 트렌드, 기회의 전체 지도

> 2026년 2월 기준. Reddit, HackerNews, 업계 분석, 투자 동향까지 종합.

---

## Part 1: WebMCP의 탄생 비화 - Amazon에서 시작됨

### Alex Nahas (MCP-B/WebMCP 원조 개발자) 인터뷰 핵심

Alex Nahas는 Amazon 백엔드 엔지니어였다. 2025년 초 MCP가 등장했을 때:

```
Amazon의 문제:
  - 내부 서비스 수천 개 → 하나의 거대한 MCP 서버로 통합 시도
  - MCP가 요구하는 OAuth 2.1을 쓰는 내부 서비스가 하나도 없음
  - 모든 서비스가 제각각의 인증 방식
  - 하지만 브라우저에서는? → Amazon SSO로 전부 로그인되어 있음

해결책:
  "그냥 브라우저에서 MCP를 돌리면 인증 문제가 사라지잖아?"
  → MCP-B(후에 WebMCP) 탄생
```

**핵심 교훈**: WebMCP는 "멋진 새 기술"이 아니라 **인증(Auth) 문제의 현실적 해결책**으로 태어남. 기업에서 가장 먼저 부딪히는 문제를 풀어줌.

---

## Part 2: 개발자 커뮤니티 반응

### Hacker News 반응

**긍정적**:
- "토큰 사용량 ~90% 감소, 속도와 결정론적 실행이 극적으로 개선"
- "기존 HTML 폼에 속성만 추가하면 끝 (Declarative API)"
- "보안 측면에서도 DOM 전체 접근 대신 명시적 도구 호출로 공격 표면 축소"

**우려/비판**:
- **보안**: "프롬프트 인젝션이 여전히 존재. 완벽하지 않다"
- **백엔드 부하**: "searchProducts()를 에이전트에게 열면 대량 호출 남용은?"
- **이름 혼동**: "WebMCP는 MCP가 아니다. JSON-RPC 스펙을 안 따른다"
- **프라이버시**: W3C SING(Security Interest Group)에서 "프라이버시 악몽이 될 수 있다"는 우려 → 2026.02.17 보안 논의 예정

### blink-dev (Chromium 개발 메일링 리스트) 반응

Tom Jones (브라우저 커뮤니티):
> "이것은 브라우저를 활성화하는 모든 사용자에게 프라이버시 악몽이 될 것이며, W3C SING에 위협 모델을 생성할 것"

→ 보안/프라이버시 우려가 가장 큰 저항 세력

### 실용적 개발자 의견

> "React 컴포넌트 상태나 Redux 스토어에 로직이 엮여 있으면 공유 서비스 레이어를 먼저 노출해야 한다. UI와 비즈니스 로직이 깨끗하게 분리된 앱은 쉽고, 타이트하게 결합된 SPA는 리팩토링이 필요하다."

---

## Part 3: Agentic Browser 전쟁 - 큰 그림

### 주요 플레이어 비교 (2026년 2월)

| 플레이어 | 접근 방식 | 현재 상태 | WebMCP 관계 |
|----------|----------|----------|------------|
| **Chrome + Gemini 3** | Auto Browse (자율 브라우징) + WebMCP | 프리미엄 구독자 대상, 미국 한정 | WebMCP를 네이티브 지원 |
| **OpenAI Operator** | CUA(Computer-Using Agent) - 스크린샷 기반 | 연구 프리뷰 | WebMCP와 무관 (독자 방식) |
| **Anthropic Claude** | Computer Use API - 스크린샷+입력 시뮬레이션 | 프로덕션 | WebMCP와 무관 (독자 방식) |
| **Google Mariner** | Gemini 기반 브라우저 에이전트 | I/O 2025 발표 | WebMCP 보완적 |
| **MCP-B / WebMCP-org** | 브라우저 확장 폴리필 | 오픈소스 활성 | WebMCP의 비공식 구현 |
| **AgentBoard** | 브라우저 AI 스위치보드 | 오픈소스 (Ilya Grigorik) | WebMCP 폴리필 + 확장 |
| **Browser Use** | 오픈소스 브라우저 자동화 프레임워크 | $17M 시드 | WebMCP와 경쟁적 |
| **Anchor Browser** | 엔터프라이즈 브라우저 자동화 | $6M 시드 | WebMCP와 보완적 |
| **Simular** | Mac/Windows AI 에이전트 | $21.5M 시리즈 A | 데스크톱 영역 |

### 핵심 관찰

```
현재 AI가 웹을 조작하는 방법 2가지:

방법 A: "눈으로 보고 클릭" (Computer Use)
  - 스크린샷 찍고 → 멀티모달 LLM으로 해석 → 클릭/타이핑 시뮬
  - OpenAI Operator, Claude Computer Use, Gemini Computer Use
  - 장점: 어떤 사이트든 작동
  - 단점: 느림, 비쌈 (토큰), 부정확 (~10% 복잡 작업 성공률)

방법 B: "API로 직접 호출" (WebMCP)
  - 사이트가 도구를 명시적으로 노출 → 에이전트가 직접 호출
  - 장점: 빠름, 정확, 토큰 90% 절감
  - 단점: 사이트 개발자가 구현해야 함

미래: A + B 하이브리드
  - WebMCP 도구가 있으면 → 도구 사용 (빠르고 정확)
  - 없으면 → 폴백으로 Computer Use (느리지만 범용)
```

---

## Part 4: Agentic Commerce - 돈이 되는 곳

### McKinsey 전망: $1~5조 시장

```
McKinsey "Agentic Commerce Automation Curve" (6단계):

Level 0: 수동 쇼핑 (기존)
Level 1: AI 추천 (넷플릭스식)
Level 2: AI 비교/검색 (에이전트가 찾아줌)
Level 3: AI 의사결정 보조 (에이전트가 필터링+추천)
Level 4: AI 반자율 구매 (에이전트가 장바구니 채움, 인간이 결제)  ← WebMCP의 sweet spot
Level 5: AI 완전자율 (에이전트가 모든 것 처리)

시장 규모:
  - 미국만 $1T (2030)
  - 글로벌 $3~5T (2030)
  - 44%의 사용자가 AI 검색을 전통 검색보다 선호
  - AI 출처 트래픽 1,200% 증가, 전통 검색 10% 감소
```

### Commerce 프로토콜 전쟁

```
+------------------------------------------------------------------+
|                    Agentic Commerce 스택                            |
|                                                                    |
|  [발견]  WebMCP Declarative/Imperative API                         |
|          ↕                                                         |
|  [탐색]  에이전트가 도구로 상품 검색/필터링                           |
|          ↕                                                         |
|  [거래]  ACP (OpenAI+Stripe) 또는 UCP (Google+Shopify)             |
|          ↕                                                         |
|  [결제]  Stripe / 기존 결제 인프라                                   |
+------------------------------------------------------------------+

ACP (Agentic Commerce Protocol):
  - 주도: OpenAI + Stripe
  - 특화: 채팅 기반 "대화→구매" 핸드쉐이크
  - 상태: 베타

UCP (Universal Commerce Protocol):
  - 주도: Google + Shopify
  - 참여: Etsy, Wayfair, Target, Walmart, Visa, Mastercard, Adyen 등 20+
  - 특화: 전체 쇼핑 여정 (검색→발견→구매→사후관리)
  - 상태: Chrome에서 지원 예정
```

---

## Part 5: 투자/펀딩 동향

### Agentic AI Foundation (Linux Foundation)

```
2025.12: MCP를 Linux Foundation에 기증
공동 설립: Anthropic, Block, OpenAI
지원: Google, Microsoft, AWS, Cloudflare, Bloomberg

의미: MCP가 특정 회사의 것이 아닌 업계 표준으로 전환
→ WebMCP도 이 생태계 위에 구축
```

### 관련 스타트업 펀딩

| 스타트업 | 분야 | 펀딩 | 시기 |
|----------|------|------|------|
| **Browser Use** | 브라우저 AI 자동화 | $17M Seed (Felicis) | 2025 |
| **Simular** | Mac/Win AI 에이전트 | $21.5M Series A (Felicis, NVidia) | 2025 |
| **Anchor Browser** | 엔터프라이즈 브라우저 | $6M Seed (Blumberg) | 2025 |
| **Strawberry** | 소비자 AI 브라우저 | $6M Seed (General Catalyst, EQT) | 2025 |
| **Runlayer** | MCP 보안 | $11M (Khosla, Felicis) | 2025 |
| **Neo4j** | Agentic AI 지식 레이어 | $100M | 2025 |

**패턴**: 에이전틱 인프라에 VC 자금이 대거 유입 중. 브라우저 에이전트 분야만 $50M+.

---

## Part 6: 지금 바로 쓸 수 있는 도구들

### MCP-B 폴리필 (Chrome 네이티브 지원 전에도 사용 가능)

```bash
# 핵심 폴리필 설치 (navigator.modelContext 구현)
npm install @mcp-b/global

# React 훅
npm install @mcp-b/react-webmcp

# TypeScript SDK
npm install @mcp-b/webmcp-ts-sdk
```

```javascript
// @mcp-b/global로 지금 당장 WebMCP 도구 등록
import '@mcp-b/global';  // navigator.modelContext 폴리필

navigator.modelContext.registerTool({
    name: "search-products",
    description: "Search products by keyword",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string" }
        },
        required: ["query"]
    },
    handler: async ({ query }) => {
        const results = await searchAPI(query);
        return { products: results };
    }
});
```

### React 통합

```jsx
import { useWebMCPTool } from '@mcp-b/react-webmcp';

function ProductSearch() {
    useWebMCPTool({
        name: "search-products",
        description: "Search products",
        inputSchema: { /* ... */ },
        handler: async ({ query }) => { /* ... */ }
    });

    return <div>...</div>;
}
```

### AgentBoard (Chrome 확장 - 즉시 테스트 가능)

Ilya Grigorik(전 Google 엔지니어)가 만든 오픈소스 브라우저 AI 스위치보드:
- 여러 AI 모델 연결 (OpenAI, Anthropic, Google 등)
- WebMCP 도구 스크립팅
- 원격 MCP 서버 연결
- "Greasemonkey, but AI-controlled"

---

## Part 7: Agentic SEO - 새로운 산업의 탄생

### 전통 SEO vs Agentic SEO

```
전통 SEO (2010~현재):
  목표: Google 검색 결과 순위 올리기
  대상: 검색엔진 크롤러
  도구: 키워드, 메타태그, 백링크, Schema.org
  측정: 순위, CTR, 트래픽

Agentic SEO (2026~):
  목표: AI 에이전트가 내 사이트를 선택하게 만들기
  대상: AI 에이전트 (Gemini, ChatGPT, Claude 등)
  도구: WebMCP Tool Contracts, UCP, 구조화된 행동
  측정: 에이전트 호출 빈도, 도구 성공률, 에이전트 전환율
```

### Microsoft 연구: AEO와 GEO

```
새로운 디지털 마케팅 디시플린:

AEO (Answer Engine Optimization):
  - AI가 답변할 때 내 콘텐츠를 인용하게 최적화
  - 기존 SEO의 진화형

GEO (Generative Engine Optimization):
  - 생성형 AI 검색 결과에 노출되도록 최적화
  - 새로운 디시플린

Agentic SEO:
  - AI 에이전트가 내 사이트의 도구를 선택하도록 최적화
  - WebMCP Tool Contract의 이름/설명/스키마 최적화
  - 완전히 새로운 디시플린
```

### Siteimprove 정의

> "Agentic SEO는 콘텐츠가 발행된 후 순위를 올리는 게 아니라, 실시간으로 검색 트렌드를 스캔하고, 사용자 의도에 맞추고, AI 시스템이 참조하고 노출할 수 있도록 콘텐츠를 구조화하는 것."

---

## Part 8: 법적 리스크와 선례

### Amazon vs Perplexity Comet (2026.01)

```
최초의 에이전틱 브라우저 관련 소송:
  - Amazon이 Perplexity의 Comet(자동 쇼핑 에이전트)을 고소
  - 쟁점: 자동화된 쇼핑 기능이 사이트 TOS를 위반하는가?
  - 의미: WebMCP가 이 문제를 해결할 수 있음
         (사이트가 명시적으로 도구를 노출 = 허가된 접근)
```

이것은 WebMCP의 숨은 가치 중 하나: **사이트가 "이것은 에이전트가 해도 됨"이라고 명시적으로 선언하는 메커니즘**. robots.txt의 AI 에이전트 버전.

---

## Part 9: 한국 시장 특수성

### 기회

| 영역 | 상황 | 기회 |
|------|------|------|
| **네이버 쇼핑** | 한국 이커머스 1위 | WebMCP 도구 최적화 솔루션 |
| **쿠팡** | 로켓배송 생태계 | 에이전트→쿠팡 도구 통합 |
| **카카오** | 카카오톡 내 쇼핑/예약 | 카카오 미니앱 + WebMCP |
| **여행** | 여기어때, 야놀자 | 예약 자동화 도구 |
| **은행** | 토스, 카카오뱅크 | 금융 조회/이체 도구 (고보안) |
| **공공** | 정부24, 홈택스 | 민원/세금 자동화 |
| **한국어 교육** | WebMCP 한국어 자료 0 | 선점 가능 |

### 타이밍

- Chrome이 한국에서 75%+ 점유율 → Chrome 네이티브 WebMCP의 영향 큼
- 한국 이커머스가 세계적으로 발달 → 에이전트 커머스 수요 높음
- 한국어 WebMCP 전문가/자료 현재 전무 → 블루오션

---

## Part 10: 업데이트된 비즈니스 전략

### 기존 10_BUSINESS_OPPORTUNITY.md에 추가되는 인사이트

```
[가장 확실한 3개 기회]

1. "MCP2Web" 변환 도구 (CLI/SaaS)
   - 기존 MCP 서버 10,000+개 → WebMCP 코드 자동 생성
   - 이미 @mcp-b/* 패키지가 폴리필 제공 중
   - 기술적으로 빠르게 구현 가능

2. Agentic SEO 에이전시 (한국 특화)
   - "당신 사이트 에이전트 레디인가요?" 감사 서비스
   - 네이버 쇼핑/쿠팡 특화 Tool Contract 설계
   - Declarative API 마크업 자동 추가 서비스

3. WebMCP 모니터링/분석 SaaS
   - 에이전트가 어떤 도구를 얼마나 호출하는지 추적
   - "Agentic Google Analytics"
   - 도구 설명 A/B 테스트 (어떤 description이 에이전트에게 더 잘 선택되나)
```

```
[타이밍 핵심]

지금 → 2026 Q2:  학습 + 프로토타입 + 콘텐츠 선점
2026 Q3~Q4:       Chrome stable 정식 지원 → 실제 수요 폭발
2027:              "에이전트 레디" 필수화 → 대규모 시장

선점 우위: 12~18개월
경쟁자 현황: 글로벌에서도 초기 단계, 한국은 제로
```
