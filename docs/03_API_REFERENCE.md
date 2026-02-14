# 03. WebMCP API 상세 레퍼런스

## API 진입점

```
window.navigator.modelContext
```

`navigator` 객체에 `modelContext` 속성이 추가된다. SecureContext(HTTPS)에서만 사용 가능.

### 기능 감지 (Feature Detection)

```javascript
if ("modelContext" in window.navigator) {
    // WebMCP 지원하는 브라우저
    navigator.modelContext.provideContext({ tools: [...] });
} else {
    // 미지원 -> graceful degradation
}
```

---

## WebIDL 정의 (공식 스펙 기준)

### Navigator 확장

```webidl
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
};
```

- `SecureContext`: HTTPS에서만 접근 가능
- `SameObject`: 매번 같은 객체 반환 (navigator.modelContext === navigator.modelContext)

### ModelContext 인터페이스

```webidl
[Exposed=Window, SecureContext]
interface ModelContext {
  undefined provideContext(optional ModelContextOptions options = {});
  undefined clearContext();
  undefined registerTool(ModelContextTool tool);
  undefined unregisterTool(DOMString name);
};
```

| 메서드 | 설명 |
|--------|------|
| `provideContext(options)` | 기존 도구를 모두 클리어하고 새 도구 목록을 등록 |
| `clearContext()` | 등록된 모든 도구를 해제 |
| `registerTool(tool)` | 기존 도구는 유지하면서 새 도구 하나를 추가. 같은 이름이면 에러 |
| `unregisterTool(name)` | 지정한 이름의 도구를 제거 |

### ModelContextOptions 딕셔너리

```webidl
dictionary ModelContextOptions {
  sequence<ModelContextTool> tools = [];
};
```

### ModelContextTool 딕셔너리

```webidl
dictionary ModelContextTool {
  required DOMString name;
  required DOMString description;
  object inputSchema;
  required ToolExecuteCallback execute;
  ToolAnnotations annotations;
};
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `name` | DOMString | O | 도구의 고유 식별자. 에이전트가 도구 호출 시 이 이름으로 참조 |
| `description` | DOMString | O | 도구의 기능을 자연어로 설명. 에이전트가 언제/어떻게 사용할지 판단하는 근거 |
| `inputSchema` | object | X | JSON Schema 형식으로 입력 파라미터를 정의 |
| `execute` | ToolExecuteCallback | O | 에이전트가 도구를 호출하면 실행되는 콜백 함수 |
| `annotations` | ToolAnnotations | X | 도구 동작에 대한 추가 메타데이터 (힌트) |

### ToolAnnotations 딕셔너리

```webidl
dictionary ToolAnnotations {
  boolean readOnlyHint;
};
```

| 필드 | 설명 |
|------|------|
| `readOnlyHint` | true이면 이 도구가 상태를 변경하지 않고 읽기만 함을 나타냄. 에이전트가 안전하게 호출 가능 여부를 판단하는 힌트 |

### ToolExecuteCallback

```webidl
callback ToolExecuteCallback = Promise<any> (object input, ModelContextClient client);
```

- `input`: JSON Schema에 맞는 파라미터 객체
- `client`: 현재 도구를 호출한 에이전트를 나타내는 ModelContextClient 인스턴스
- 반환값: Promise (비동기 실행 가능)

### ModelContextClient 인터페이스

```webidl
[Exposed=Window, SecureContext]
interface ModelContextClient {
  Promise<any> requestUserInteraction(UserInteractionCallback callback);
};

callback UserInteractionCallback = Promise<any> ();
```

| 메서드 | 설명 |
|--------|------|
| `requestUserInteraction(callback)` | 도구 실행 중 사용자 입력을 비동기로 요청. 여러 번 호출 가능 |

---

## 코드 예제 모음

### 예제 1: 가장 간단한 도구 등록

```javascript
navigator.modelContext.provideContext({
    tools: [
        {
            name: "greet",
            description: "사용자에게 인사말을 생성합니다",
            inputSchema: {
                type: "object",
                properties: {
                    name: { type: "string", description: "인사할 대상의 이름" }
                },
                required: ["name"]
            },
            execute: ({ name }) => {
                return { content: [{ type: "text", text: `안녕하세요, ${name}님!` }] };
            }
        }
    ]
});
```

### 예제 2: 기존 함수 재사용 (핵심 패턴)

```javascript
// === 기존 코드 (원래 있던 것) ===
function addStamp(name, description, year, imageUrl) {
    stamps.push({ name, description, year, imageUrl: imageUrl || null });
    document.getElementById('confirmationMessage').textContent =
        `Stamp "${name}" added successfully!`;
    renderStamps();
}

// HTML 폼의 submit 핸들러
document.getElementById('addStampForm').addEventListener('submit', (event) => {
    event.preventDefault();
    addStamp(
        document.getElementById('stampName').value,
        document.getElementById('stampDescription').value,
        document.getElementById('stampYear').value,
        document.getElementById('stampImageUrl').value
    );
});

// === WebMCP 추가 코드 (새로 추가하는 것) ===
if ("modelContext" in navigator) {
    navigator.modelContext.provideContext({
        tools: [{
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
                // 기존 함수를 그대로 재사용!
                addStamp(name, description, year, imageUrl);
                return {
                    content: [{
                        type: "text",
                        text: `Stamp "${name}" added! Collection: ${stamps.length} stamps.`
                    }]
                };
            }
        }]
    });
}
```

### 예제 3: 사용자 확인 요청 (requestUserInteraction)

```javascript
navigator.modelContext.registerTool({
    name: "buyProduct",
    description: "Use this tool to purchase a product given its unique product_id.",
    inputSchema: {
        type: "object",
        properties: {
            product_id: {
                description: "The unique identifier for the product to be purchased.",
                type: "string",
            }
        },
        required: ["product_id"]
    },
    execute: buyProduct
});

async function buyProduct({ product_id }, agent) {
    // 에이전트 실행 중 사용자에게 직접 확인을 받음
    const confirmed = await agent.requestUserInteraction(async () => {
        return new Promise((resolve) => {
            const confirmed = confirm(
                `Buy product ${product_id}?\nClick OK to confirm, Cancel to abort.`
            );
            resolve(confirmed);
        });
    });

    if (!confirmed) {
        throw new Error("Purchase cancelled by user.");
    }

    executePurchase(product_id);
    return `Product ${product_id} purchased.`;
}
```

### 예제 4: SPA에서 동적 도구 갱신

```javascript
// 페이지 초기 상태: 목록 보기 도구만 제공
navigator.modelContext.provideContext({
    tools: [{
        name: "filter-templates",
        description: "Filter the list of templates based on a description",
        inputSchema: { /* ... */ },
        execute: ({ description }) => filterTemplates(description)
    }]
});

// 사용자가 디자인 편집 모드에 진입하면 도구 추가
function onDesignEditorOpened() {
    navigator.modelContext.registerTool({
        name: "edit-design",
        description: "Makes changes to the current design based on instructions",
        inputSchema: { /* ... */ },
        execute: ({ instructions }) => editDesign(instructions)
    });
}

// 편집 모드 나가면 도구 제거
function onDesignEditorClosed() {
    navigator.modelContext.unregisterTool("edit-design");
}
```

### 예제 5: 읽기 전용 도구 (annotations 활용)

```javascript
navigator.modelContext.registerTool({
    name: "get-dresses",
    description: "Returns an array of product listings",
    inputSchema: {
        type: "object",
        properties: {
            size: { type: "number", description: "EU dress size (2-14)" },
            color: { type: "string", description: "Filter by color" }
        }
    },
    annotations: {
        readOnlyHint: true  // 이 도구는 상태를 변경하지 않음
    },
    execute: async ({ size, color }) => {
        const products = await fetchProducts(size, color);
        return { products };
    }
});
```

---

## provideContext vs registerTool/unregisterTool

| | `provideContext()` | `registerTool()` / `unregisterTool()` |
|---|---|---|
| **동작** | 기존 도구를 모두 클리어 후 새 목록 등록 | 기존 도구를 유지하면서 추가/제거 |
| **사용 시점** | 페이지 초기 로드, 전체 상태 리셋 | 점진적 도구 추가/제거 |
| **SPA 적합성** | 화면 전환 시 전체 도구셋 교체 | 부분적 상태 변화에 대응 |
| **에러** | 이름 중복 시 마지막 것 사용(TBD) | 이름 중복 시 에러 throw |

---

## 도구 응답 형식

MCP와 정렬된 구조화된 응답 형식:

```javascript
// 텍스트 응답
return {
    content: [
        { type: "text", text: "Operation completed successfully." }
    ]
};

// 여러 콘텐츠 조각
return {
    content: [
        { type: "text", text: "Found 3 matching stamps:" },
        { type: "text", text: JSON.stringify(results) }
    ]
};
```

> **참고**: 이미지 등 비텍스트 데이터 전달 방식은 아직 논의 중 ([Issue #41](https://github.com/webmachinelearning/webmcp/issues/41))

---

## JSON Schema (inputSchema) 작성법

inputSchema는 [JSON Schema](https://json-schema.org/draft/2020-12/json-schema-core.html) 표준을 따른다.

```javascript
inputSchema: {
    type: "object",            // 항상 object
    properties: {
        // 각 파라미터 정의
        text: {
            type: "string",              // 타입: string, number, boolean, array, object
            description: "설명 텍스트"     // 에이전트가 읽는 설명
        },
        count: {
            type: "number",
            description: "항목 수",
            minimum: 1,                  // 제약 조건
            maximum: 100
        },
        color: {
            type: "string",
            enum: ["Red", "Blue", "Green"],  // 열거형
            description: "Select a color"
        },
        items: {
            type: "array",               // 배열
            items: { type: "number" },
            description: "Product IDs"
        }
    },
    required: ["text"]           // 필수 파라미터 목록
}
```
