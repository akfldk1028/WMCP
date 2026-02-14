# 04. MCP vs WebMCP 비교

## 한 눈에 보는 비교표

| 항목 | MCP (Model Context Protocol) | WebMCP |
|------|-----|--------|
| **만든 곳** | Anthropic | W3C Web Machine Learning CG (Microsoft + Google) |
| **실행 환경** | 백엔드 서버 (Python, Node.js 등) | 브라우저 내 JavaScript |
| **통신 방식** | stdio, SSE(HTTP), Streamable HTTP | 브라우저 내부 API 호출 |
| **에이전트 유형** | Claude Desktop, OpenAI SDK 등 | 브라우저 내장 에이전트 |
| **사용자 참여** | 선택적 (자율 에이전트 가능) | 필수 (Human-in-the-loop) |
| **UI** | 없음 (헤드리스) | 있음 (웹 페이지 UI 공유) |
| **인증** | 별도 구현 필요 | 브라우저 세션/쿠키 활용 |
| **도구 발견** | 서버 연결 후 tools/list | 페이지 탐색 후 등록된 도구 확인 |
| **프리미티브** | Tools, Resources, Prompts, Sampling | Tools (현재 단계) |

---

## MCP 프로토콜 구조 복습

MCP는 3개 레이어로 구성된다:

```
+--------------------------------------------------+
|              MCP 프로토콜 스택                       |
|                                                    |
|  Layer 3: 프리미티브 (Primitives)                   |
|    - Tools: 실행 가능한 함수                         |
|    - Resources: 정적 데이터/컨텍스트                  |
|    - Prompts: 시스템 프롬프트 템플릿                  |
|    - Sampling: LLM 추론 요청                        |
|                                                    |
|  Layer 2: 데이터/제어 (Control Messages)             |
|    - JSON-RPC 2.0 메시지                            |
|    - tools/list, tools/call 등                      |
|    - 클라이언트 <-> 서버 간 제어 흐름                 |
|                                                    |
|  Layer 1: 전송 (Transport)                          |
|    - stdio: 로컬 프로세스 간 통신                    |
|    - SSE/HTTP: 원격 통신                             |
|    - Streamable HTTP: 최신 전송 방식                 |
+--------------------------------------------------+
```

### MCP 도구 정의 예시 (Python SDK)

```python
@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state.

    Args:
        state: Two-letter US state code (e.g. CA, NY)
    """
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)
    alerts = [format_alert(feature) for feature in data["features"]]
    return "\n---\n".join(alerts)
```

### MCP tools/list 응답 예시 (JSON-RPC)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_weather",
        "description": "Get current weather information for a location",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name or zip code"
            }
          },
          "required": ["location"]
        }
      }
    ]
  }
}
```

---

## 레이어별 대응 관계

### Layer 1: 전송 (Transport)

```
MCP:
  클라이언트 ←[stdio/SSE/HTTP]→ 서버

WebMCP:
  에이전트 ←[브라우저 내부 API]→ 웹 페이지
```

| MCP | WebMCP |
|-----|--------|
| stdio (로컬 프로세스 통신) | 해당 없음 (같은 브라우저 프로세스) |
| SSE/HTTP (원격 통신) | 해당 없음 (네트워크 불필요) |
| JSON-RPC 2.0 메시지 | 브라우저가 내부적으로 처리 |

**핵심 차이**: MCP는 클라이언트와 서버가 별도 프로세스(또는 별도 머신)이므로 전송 레이어가 필수다. WebMCP는 모두 같은 브라우저 안이므로 전송 레이어가 브라우저 내부 구현에 맡겨진다.

### Layer 2: 데이터/제어

```
MCP:
  Client → Server:  {"method": "tools/list", ...}
  Server → Client:  {"result": {"tools": [...]}, ...}
  Client → Server:  {"method": "tools/call", "params": {"name": "...", ...}}

WebMCP:
  (브라우저가 내부적으로 처리 - 개발자가 직접 다루지 않음)
  페이지: provideContext({tools: [...]})  →  브라우저가 도구 목록 관리
  에이전트: "add-stamp 호출"              →  브라우저가 execute 콜백 실행
```

| MCP | WebMCP |
|-----|--------|
| tools/list → 서버가 도구 목록 응답 | provideContext()로 도구를 push 방식으로 등록 |
| tools/call → 서버가 도구 실행 | 브라우저가 execute 콜백 직접 호출 |
| JSON-RPC 메시지를 개발자가 직접 처리 | 브라우저가 제어 흐름을 추상화 |

**핵심 차이**: MCP에서는 개발자가 JSON-RPC 메시지를 직접 주고받는다(SDK가 추상화하지만). WebMCP에서는 브라우저가 이 제어 흐름을 완전히 숨기고, 개발자는 JavaScript 콜백만 작성한다.

**이것이 의도적인 설계**: 브라우저가 중간에서 제어함으로써:
1. MCP 프로토콜 버전이 바뀌어도 하위 호환성 유지 가능
2. 웹 플랫폼 고유의 보안 정책 적용 가능 (iframe 제한 등)
3. 비-LLM 클라이언트(접근성 도구 등)도 같은 API 사용 가능

### Layer 3: 프리미티브

```
MCP 프리미티브:
  ├── Tools (실행 가능한 함수)           ← WebMCP에서 지원
  ├── Resources (정적 데이터)            ← WebMCP에서 미지원 (현재)
  ├── Prompts (프롬프트 템플릿)          ← WebMCP에서 미지원 (현재)
  └── Sampling (LLM 추론 요청)          ← WebMCP에서 미지원 (현재)
```

WebMCP는 현재 **Tools만 지원**한다. 이유:
- Tools가 가장 핵심적이고 범용적인 프리미티브
- Resources, Prompts는 나중에 추가 가능
- MCP와 1:1 대응보다 웹 플랫폼에 맞는 최적 API를 우선

---

## 도구 정의 비교

### MCP (Python SDK)

```python
@mcp.tool()
async def add_stamp(name: str, description: str, year: int, image_url: str = None) -> str:
    """Add a new stamp to the collection.

    Args:
        name: The name of the stamp
        description: A brief description
        year: The year the stamp was issued
        image_url: Optional image URL
    """
    stamps.append({"name": name, "description": description, "year": year})
    return f'Stamp "{name}" added successfully!'
```

### MCP (TypeScript SDK)

```typescript
server.tool("add-stamp", {
    name: z.string(),
    description: z.string(),
    year: z.number(),
    imageUrl: z.string().optional()
}, async ({ name, description, year, imageUrl }) => {
    stamps.push({ name, description, year, imageUrl });
    return { content: [{ type: "text", text: `Stamp "${name}" added!` }] };
});
```

### WebMCP (JavaScript)

```javascript
navigator.modelContext.registerTool({
    name: "add-stamp",
    description: "Add a new stamp to the collection",
    inputSchema: {
        type: "object",
        properties: {
            name: { type: "string", description: "The name of the stamp" },
            description: { type: "string", description: "A brief description" },
            year: { type: "number", description: "The year issued" },
            imageUrl: { type: "string", description: "Optional image URL" }
        },
        required: ["name", "description", "year"]
    },
    execute({ name, description, year, imageUrl }) {
        addStamp(name, description, year, imageUrl);  // 기존 함수 재사용!
        return {
            content: [{ type: "text", text: `Stamp "${name}" added!` }]
        };
    }
});
```

### 비교 포인트

| 측면 | MCP | WebMCP |
|------|-----|--------|
| **언어** | Python, TypeScript 등 서버 언어 | JavaScript (브라우저) |
| **스키마 정의** | 데코레이터/Zod 등으로 추상화 | JSON Schema 직접 작성 |
| **콜백 형태** | 함수 정의 | execute 프로퍼티에 함수 할당 |
| **반환 형식** | content 배열 (text, image 등) | 동일 (MCP와 정렬) |
| **기존 코드 재사용** | 백엔드 코드만 | 프론트엔드 코드 직접 호출 가능 |
| **UI 연동** | 별도 작업 필요 | DOM 직접 접근 가능 |

---

## 아키텍처 흐름 비교

### MCP: 백엔드 통합

```
사용자 → AI 플랫폼(Claude 등) → MCP 클라이언트 → [네트워크] → MCP 서버 → 백엔드 로직
                                                                         |
                                                              (별도 DB, API 등)

* 웹 UI와 완전히 분리
* 서버가 항상 실행 중이어야 함
* 인증 별도 구현
```

### WebMCP: 프론트엔드 통합

```
사용자 ←→ 브라우저 에이전트 ←→ 브라우저(중재) ←→ 웹 페이지 JS
              |                                    |
              |         (같은 UI를 공유)             |
              +------ 사용자가 직접 볼 수 있음 ------+

* 웹 UI 안에서 동작
* 페이지가 열려 있을 때만 동작 (SW 확장 전)
* 브라우저 세션 인증 자동 활용
```

---

## 각각 언제 쓰는가?

### MCP가 적합한 경우

- 서버-to-서버 통신 (헤드리스)
- 완전 자율 에이전트 워크플로우
- Always-on 서비스 (24/7 가용성)
- 다수의 AI 플랫폼에 동시 제공
- 브라우저 없이 동작해야 할 때

### WebMCP가 적합한 경우

- 사용자가 함께 보면서 작업 (Human-in-the-loop)
- 기존 프론트엔드 코드 재사용
- 복잡한 UI 상태와 연동 필요
- 인증이 이미 브라우저 세션으로 처리됨
- 시각적 피드백이 중요한 워크플로우
- 접근성 도구에서 고수준 동작 제공

### 둘 다 쓰는 경우

```
같은 서비스가 두 채널 모두 제공:

[MCP 서버]  ←→  자율 에이전트 (헤드리스, 백그라운드 작업)
    |
 (같은 비즈니스 로직)
    |
[WebMCP]    ←→  브라우저 에이전트 (사용자와 함께 실시간 작업)
```

---

## 관련 프로토콜/기술 비교

| 기술 | 용도 | WebMCP와의 관계 |
|------|------|----------------|
| **MCP** | AI 에이전트 ↔ 외부 서비스 통신 | WebMCP가 정렬하는 대상. 보완적 |
| **OpenAPI** | HTTP API 스키마 정의 | MCP/WebMCP 도구의 inputSchema와 유사한 역할 |
| **A2A (Agent2Agent)** | 에이전트 간 통신 | WebMCP와 다른 문제를 풀음. 보완적 |
| **MCP-B** | 브라우저 확장을 통한 MCP | WebMCP와 유사한 동기. 커뮤니티 프로젝트 |
| **Prompt API** | 브라우저 내 LLM 추론 | WebMCP 도구와 함께 사용 가능 |
| **WebNN** | 브라우저 내 신경망 추론 | 같은 W3C 커뮤니티 그룹 |
