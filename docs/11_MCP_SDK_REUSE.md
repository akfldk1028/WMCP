# 11. 기존 MCP SDK를 WebMCP에서 활용할 수 있는가?

> 결론: **직접 활용은 불가. 하지만 "도구 스키마 변환"이라는 틈새 비즈니스가 있다.**

---

## MCP 공식 SDK 현황

### 공식 SDK

| SDK | 패키지 | 다운로드 |
|-----|--------|----------|
| **TypeScript SDK** | `@modelcontextprotocol/sdk` (npm) | 97M+ 월간 |
| **Python SDK** | `mcp` (PyPI) | - |

### MCP SDK가 하는 일

```typescript
// MCP TypeScript SDK: 서버에서 도구 정의
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "MyServer", version: "1.0.0" });

server.tool(
    "add-stamp",                          // 도구 이름
    {                                     // Zod 스키마 → JSON Schema 자동 변환
        name: z.string(),
        description: z.string(),
        year: z.number(),
        imageUrl: z.string().optional()
    },
    async ({ name, description, year, imageUrl }) => {  // 실행 함수
        // 백엔드 로직 실행
        return { content: [{ type: "text", text: `Added ${name}` }] };
    }
);
```

### WebMCP에서의 도구 정의

```javascript
// WebMCP: 브라우저에서 도구 정의
navigator.modelContext.registerTool({
    name: "add-stamp",
    description: "Add a new stamp to the collection",
    inputSchema: {                        // JSON Schema 직접 작성
        type: "object",
        properties: {
            name: { type: "string", description: "The name" },
            description: { type: "string", description: "A description" },
            year: { type: "number", description: "The year" },
            imageUrl: { type: "string", description: "Image URL" }
        },
        required: ["name", "description", "year"]
    },
    execute({ name, description, year, imageUrl }) {  // 프론트엔드 로직 실행
        addStamp(name, description, year, imageUrl);
        return { content: [{ type: "text", text: `Added ${name}` }] };
    }
});
```

---

## 왜 직접 활용이 안 되는가?

### 근본적 차이: 실행 환경

```
MCP SDK:
  Node.js/Python 런타임 → 서버 프로세스에서 실행
  전송: stdio, SSE, HTTP
  인증: 별도 구현
  상태: 서버 메모리/DB

WebMCP:
  브라우저 JavaScript 런타임 → 탭/페이지에서 실행
  전송: 브라우저 내부 API (없음)
  인증: 브라우저 세션
  상태: DOM, 페이지 JS 변수
```

### 구체적으로 안 되는 것

| MCP SDK 기능 | WebMCP에서 | 이유 |
|---|---|---|
| `new McpServer()` | X | 서버 프로세스가 필요. 브라우저에서 실행 불가 |
| stdio 전송 | X | 브라우저에 stdin/stdout 없음 |
| SSE/HTTP 전송 | X | WebMCP는 네트워크 전송 자체가 불필요 |
| `server.tool()` | X | 서버 컨텍스트에서만 동작 |
| Zod 스키마 | **부분적 O** | Zod → JSON Schema 변환은 재사용 가능 |
| JSON-RPC 핸들링 | X | 브라우저가 내부 처리 |

### 재사용 가능한 것

| 재사용 가능 부분 | 방법 |
|---|---|
| **도구 이름/설명** | 그대로 복사 |
| **inputSchema (JSON Schema)** | 그대로 복사 |
| **반환 형식** | `{ content: [{ type: "text", text: "..." }] }` 동일 |
| **Zod 스키마** | `zodToJsonSchema()` 변환 후 WebMCP inputSchema에 사용 |
| **도구 설계 패턴** | 개념적으로 동일 |

---

## "변환 브릿지"라는 비즈니스 기회

### 핵심 아이디어

```
기존 MCP 서버 5,800+개의 도구 정의(스키마)를 읽어서
→ WebMCP용 JavaScript 코드를 자동 생성하는 도구

입력: MCP 서버의 tools/list 응답 (JSON)
출력: WebMCP registerTool() 보일러플레이트 코드
```

### 구현 가능한 도구: MCP → WebMCP 코드 생성기

```javascript
// 입력: MCP 서버의 tools/list 응답
const mcpTools = {
    tools: [
        {
            name: "get_weather",
            description: "Get current weather for a location",
            inputSchema: {
                type: "object",
                properties: {
                    location: { type: "string", description: "City name" }
                },
                required: ["location"]
            }
        }
    ]
};

// 변환기가 자동 생성하는 WebMCP 코드
function generateWebMCPCode(mcpTools) {
    return mcpTools.tools.map(tool => `
navigator.modelContext.registerTool({
    name: "${tool.name}",
    description: "${tool.description}",
    inputSchema: ${JSON.stringify(tool.inputSchema, null, 4)},
    async execute(input, agent) {
        // TODO: 프론트엔드 구현 추가
        // MCP 서버의 ${tool.name} 도구와 동일한 기능을
        // 브라우저 JavaScript로 구현하세요.
        //
        // 기존 MCP 서버: 백엔드 API 호출
        // WebMCP 변환: 기존 프론트엔드 함수 호출 또는
        //              fetch()로 같은 백엔드 API 호출

        const response = await fetch('/api/${tool.name}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        const result = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
});
`).join('\n');
}
```

### 하이브리드 패턴: WebMCP가 기존 MCP 서버를 프록시

```
가장 현실적인 패턴:

[브라우저]                              [기존 백엔드]
  |                                       |
  | navigator.modelContext                |
  | .registerTool({                       |
  |   execute: async (input) => {         |
  |     // 기존 MCP 서버의 API를           |
  |     // fetch()로 호출                  |
  |     const res = await fetch(          |
  |       '/api/mcp/tool-call',           |
  |       { body: JSON.stringify({        |
  |           name: "get_weather",        |
  |           input: input                |
  |       })}                             |
  |     );                                |-----------> MCP 서버
  |     return await res.json();          |<-----------
  |   }                                   |
  | })                                    |
```

**이 패턴의 장점**:
- 기존 MCP 서버 코드를 전혀 안 고쳐도 됨
- WebMCP가 프론트엔드 프록시 역할
- 사용자가 같은 브라우저 UI를 보면서 에이전트가 작업
- 인증은 브라우저 세션을 그대로 사용

**이 패턴의 단점**:
- 네트워크 왕복 발생 (WebMCP의 "로컬 실행" 장점 상실)
- 기존 MCP 서버가 가동 중이어야 함

---

## MCP SDK의 활용 가능한 부분

### 1. `zodToJsonSchema`: 스키마 변환

```typescript
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

// MCP 서버에서 쓰던 Zod 스키마
const weatherSchema = z.object({
    location: z.string().describe("City name or zip code"),
    units: z.enum(["celsius", "fahrenheit"]).optional()
});

// WebMCP inputSchema로 변환
const inputSchema = zodToJsonSchema(weatherSchema);
// → { type: "object", properties: { location: { type: "string", ... }, ... } }
```

### 2. 도구 카탈로그 재사용

MCP 서버 5,800+개의 도구 목록은 WebMCP 도구 설계의 참고 자료:

```
MCP 서버가 이미 정의한 것:      WebMCP에서 재사용:
  - 도구 이름                    → 그대로
  - 자연어 설명                  → 그대로
  - 파라미터 스키마              → 그대로
  - 비즈니스 로직 패턴           → 프론트엔드로 번역
```

### 3. 반환 형식 호환

MCP와 WebMCP 모두 같은 content 배열 형식:

```javascript
// MCP 서버 반환
return { content: [{ type: "text", text: "Result" }] };

// WebMCP 도구 반환
return { content: [{ type: "text", text: "Result" }] };
// → 동일!
```

---

## 빠르게 배포 가능한 제품 아이디어

### "MCP2Web" CLI 도구

```bash
# 기존 MCP 서버에 연결해서 도구 목록 가져오기
npx mcp2web scan --server ./my-mcp-server

# WebMCP 보일러플레이트 생성
npx mcp2web generate --output ./webmcp-tools.js

# Declarative HTML 폼 생성
npx mcp2web generate --format html --output ./webmcp-forms.html
```

```
실행 결과 예시:

Scanning MCP server... Found 5 tools.

Generated files:
  webmcp-tools.js     - 5 tools with registerTool() boilerplate
  webmcp-forms.html   - 3 forms with toolname/tooldescription attributes
  webmcp-types.d.ts   - TypeScript type definitions

Next steps:
  1. Add execute() implementations to webmcp-tools.js
  2. Include webmcp-tools.js in your web page
  3. Test with Chrome 146+ (enable WebMCP flag)
```

### 이게 가능한 이유

1. MCP SDK의 `tools/list`로 모든 도구의 스키마를 프로그래밍적으로 가져올 수 있음
2. JSON Schema는 MCP와 WebMCP가 동일 형식
3. 코드 생성은 템플릿 기반이므로 빠르게 구현 가능
4. 실제 비즈니스 로직(execute 함수 내부)만 개발자가 채우면 됨

---

## 정리: SDK 재사용 가능성 매트릭스

| 구분 | 재사용 가능? | 방법 |
|------|------------|------|
| 도구 이름/설명 | O | 복사 |
| JSON Schema | O | 복사 |
| Zod 스키마 | O | zodToJsonSchema() 변환 |
| 반환 형식 | O | 동일 형식 |
| 비즈니스 로직 | 부분적 | fetch() 프록시 또는 프론트엔드 재구현 |
| 서버 런타임 | X | 브라우저에서 실행 불가 |
| 전송 레이어 | X | 불필요 (브라우저 내부) |
| JSON-RPC | X | 브라우저가 처리 |
| 인증 로직 | X | 브라우저 세션으로 대체 |

**결론**: MCP SDK 자체를 브라우저에서 실행하는 것은 불가능하지만, **스키마/메타데이터 재사용 + 코드 생성**이라는 실질적이고 빠른 비즈니스 경로가 있다.
