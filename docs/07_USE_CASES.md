# 07. 실전 사용 사례 상세 분석

## 사용 사례의 공통 패턴

WebMCP의 모든 사용 사례는 다음 패턴을 공유한다:

```
사용자 시작 → 에이전트 보조 → 사용자 확인/개입 → 에이전트 실행 → 결과를 UI에 반영
```

핵심: **완전 위임이 아닌 협업**. 사용자가 항상 루프 안에 있다.

---

## 사례 1: 그래픽 디자인 (Creative)

### 시나리오

Jen이 야드세일 전단지를 만들고 싶어서 디자인 플랫폼(easely.example)에 접속.

### 도구 등록 흐름

```
[1단계: 템플릿 선택 화면]

페이지가 등록한 도구:
+------------------------------------------+
| name: "filterTemplates"                   |
| description: "Filters the list of        |
|   templates based on a description"       |
| inputSchema:                              |
|   description: string (자연어 설명)         |
+------------------------------------------+

사용자: "봄 테마에 흰 배경인 템플릿만 보여줘"
에이전트: filterTemplates("spring themed, white background")
결과: UI가 필터링된 템플릿 목록으로 갱신
```

```
[2단계: 디자인 편집 화면 - 새 도구가 동적으로 등록됨!]

페이지가 추가 등록한 도구:
+------------------------------------------+
| name: "editDesign"                        |
| description: "Makes changes to the       |
|   current design based on instructions"   |
| inputSchema:                              |
|   instructions: string (편집 지시)          |
+------------------------------------------+

사용자: "제목 폰트 크기 키우고, 클립아트를 야드세일 테마로 바꿔"
에이전트: editDesign("Make the title font larger")
에이전트: editDesign("Swap clipart for yard-sale themed images")
결과: 디자인이 실시간으로 변경됨 (사용자가 지켜봄)
```

```
[3단계: 에이전트가 여러 도구를 연속 호출]

사용자: "'Yard Sale Extravaganza!'를 제목으로, 각 CTA 문구로 복사본 만들어"

에이전트 행동:
  1. editDesign("Change title to 'Yard Sale Extravaganza!'")
  2. editDesign("Change CTA to 'The hunt is on!'")
  3. addPage("DUPLICATE")
  4. editDesign("Change CTA to 'Ready, set, shop!'")
  5. addPage("DUPLICATE")
  6. editDesign("Change CTA to 'Come for the bargains, stay for the cookies'")

결과: 3개의 전단지 변형이 생성됨
UI: "커밋되지 않은 변경" 배치로 표시 → 사용자가 리뷰/수정/취소 가능
```

```
[4단계: 에이전트가 사용자 모르는 기능 발견]

에이전트가 orderPrints 도구를 발견:
+------------------------------------------+
| name: "orderPrints"                       |
| description: "Orders the current design  |
|   for printing and shipping"              |
| inputSchema:                              |
|   copies: number (1-1000)                 |
|   page_size: enum [Legal, Letter, A4, A5] |
|   page_finish: enum [Regular, Glossy...]  |
+------------------------------------------+

에이전트: 사용자에게 "인쇄 주문하시겠어요?" 제안
사용자: "10부 인쇄해줘"
에이전트: orderPrints(10, "Letter", "Regular")
결과: 체크아웃 페이지로 이동 → 사용자가 직접 확인 후 결제
```

### 이 사례에서 배우는 점

| 패턴 | 설명 |
|------|------|
| **동적 도구 등록** | 편집 모드 진입 시 새 도구가 나타남. SPA에서 상태별 도구 제공 |
| **연속 도구 호출** | 에이전트가 5-6개 도구를 연속 호출하여 복합 작업 수행 |
| **크로스사이트 컨텍스트** | 에이전트가 이메일에서 시간/장소 정보를 가져와서 전단지에 입력 |
| **기능 발견** | 사용자가 모르던 기능을 에이전트가 발견하여 제안 |
| **안전한 위임** | 실제 결제는 사용자가 체크아웃 페이지에서 직접 수행 |

---

## 사례 2: 쇼핑 (Shopping)

### 시나리오

Maya가 친구 결혼식에 입을 드레스를 찾고 있음.

### 도구 상호작용 흐름

```
[1단계: 에이전트가 쇼핑몰 추천 (WebMCP 외부)]

Maya: "친환경적이고 너무 비싸지 않은 정장 드레스 매장 추천해줘"
에이전트: (자체 지식으로) 3개 매장 추천
Maya: "Wildebloom 가보자"
에이전트: wildebloom.example/shop 으로 내비게이션
```

```
[2단계: 상품 페이지에서 도구 발견]

페이지가 등록한 도구들:
+------------------------------------------+
| name: "getDresses"                        |
| description: "Returns an array of        |
|   product listings"                       |
| annotations: { readOnlyHint: true }       |
| inputSchema:                              |
|   size: number (2-14, EU size)            |
|   color: enum [Red, Blue, ...]            |
+------------------------------------------+
| name: "showDresses"                       |
| description: "Displays the given         |
|   products to the user"                   |
| inputSchema:                              |
|   product_ids: number[] (product IDs)     |
+------------------------------------------+
```

```
[3단계: 에이전트의 2단계 도구 호출]

Maya: "내 사이즈로 칵테일 파티에 적합한 것만 보여줘"

에이전트 행동:
  1단계 - 데이터 조회:
    getDresses(6)  ← 사이즈 6 (에이전트가 개인화 데이터에서 알고 있음)
                   ← EU 단위로 변환까지 에이전트가 처리
    → JSON 결과: [{id: 1021, description: "...", price: "€180", image: "..."}, ...]

  2단계 - 에이전트 내부 필터링:
    - 각 상품의 설명과 이미지를 분석
    - "칵테일 파티에 적합한" 기준으로 필터링
    - 이 부분은 에이전트의 LLM이 판단 (도구가 아님)

  3단계 - UI 갱신:
    showDresses([4320, 8492, 5532, ...])
    → 페이지 UI가 필터링된 드레스만 표시하도록 갱신
```

```
[4단계: 이미지 기반 검색 (멀티모달)]

Maya: (사진 첨부) "이 드레스와 비슷한 게 있어?"

에이전트:
  - 사진에서 색상, 핏, 넥라인 등 특징 추출
  - getDresses() 결과의 이미지들과 비교
  - 유사한 드레스 선별
  - showDresses([...])로 UI 갱신
```

### 이 사례에서 배우는 점

| 패턴 | 설명 |
|------|------|
| **읽기/쓰기 도구 분리** | getDresses(읽기) + showDresses(쓰기) 역할 분리 |
| **에이전트 내부 처리** | 도구가 반환한 데이터를 에이전트가 추가 가공 (필터링, 유사도 비교) |
| **개인화 컨텍스트 활용** | 사용자가 직접 말하지 않은 사이즈를 에이전트가 알고 있음 |
| **UI 연동** | showDresses()가 실제 페이지 UI를 갱신 |
| **readOnlyHint** | getDresses는 상태를 변경하지 않으므로 에이전트가 안심하고 호출 |

---

## 사례 3: 코드 리뷰 (Code Review)

### 시나리오

John이 동료의 코드 리뷰(Gerrit)를 보고 있음. Gerrit은 복잡한 UI를 가진 전문 도구.

### 도구 상호작용 흐름

```
[1단계: 테스트 실패 분석]

페이지가 등록한 도구들:
+------------------------------------------+
| name: "getTryRunStatuses"                 |
| description: "Returns the status of      |
|   each bot run in a try run job"          |
| annotations: { readOnlyHint: true }       |
+------------------------------------------+
| name: "getTryRunFailureSnippet"           |
| description: "Returns the TAIL snippet   |
|   of the log containing the error"        |
| inputSchema:                              |
|   bot_name: string                        |
| annotations: { readOnlyHint: true }       |
+------------------------------------------+

John: "Mac이랑 Android 봇이 왜 실패해?"

에이전트:
  1. getTryRunStatuses()
     → [{bot_name: "mac-x64-rel", status: "FAIL"},
        {bot_name: "android-10-rel", status: "FAIL"}, ...]

  2. getTryRunFailureSnippet("mac-x64-rel")
     → "Out of Space" 에러 로그

  3. getTryRunFailureSnippet("android-10-rel")
     → "missing symbol gfx::DisplayCompositor" 링크 에러

에이전트: "Mac은 인프라 문제(디스크 공간 부족), Android는
         gfx::DisplayCompositor 심볼 누락입니다."
```

```
[2단계: 코드 수정 제안]

페이지가 등록한 추가 도구:
+------------------------------------------+
| name: "addSuggestedEdit"                  |
| description: "Adds a suggested edit      |
|   to the review"                          |
| inputSchema:                              |
|   filename: string                        |
|   patch: string (unidiff format)          |
+------------------------------------------+

John: "BUILD.gn에 display_compositor_android.cc 추가해줘"

에이전트:
  - BUILD.gn 파일 분석 (DOM/페이지 컨텍스트에서 접근)
  - Android 섹션 찾기
  - unidiff 형식으로 패치 생성
  - addSuggestedEdit("BUILD.gn", "+display_compositor_android.cc\n...")

결과: Gerrit UI에 suggested diff가 표시됨
     John이 수락/수정/거부 가능
```

```
[3단계: 반복 작업 자동화]

John: "여러 파일에서 Point를 PointF로 바꿔야 해. 코멘트도 추가하고."

에이전트:
  1. addComment("input 좌표에는 Point 대신 PointF를 사용해야 합니다...")
  2. addSuggestedEdit("file1.cc", "- Point input_pos\n+ PointF input_pos")
  3. addSuggestedEdit("file2.cc", "- Point coords\n+ PointF coords")
  4. addSuggestedEdit("file3.cc", "- Point location\n+ PointF location")
  ... (반복)

결과: 모든 변경이 Gerrit UI에 개별 suggested edit로 표시
     John이 각각 리뷰하면서 수락/거부
```

### 이 사례에서 배우는 점

| 패턴 | 설명 |
|------|------|
| **전문 도메인 UI 보조** | Gerrit처럼 복잡한 도구를 에이전트가 "사용 설명서" 역할 수행 |
| **단계적 정보 수집** | 상태 조회 → 실패 상세 조회로 2단계 도구 호출 |
| **반복 자동화** | 여러 파일에 같은 패턴의 변경을 자동으로 |
| **리뷰 가능한 출력** | suggested edit로 제안 → 사용자가 최종 결정 |
| **DOM + 도구 병행** | 에이전트가 DOM으로 파일 내용을 보고 + 도구로 수정 제안 |

---

## 공통 설계 패턴 요약

### 패턴 1: 데이터 조회 → 에이전트 처리 → UI 업데이트

```
읽기 도구 → 에이전트가 결과 가공 → 쓰기 도구
(getDresses)   (필터/분석)        (showDresses)
```

### 패턴 2: 기존 함수 래핑

```javascript
// 기존 코드
function addStamp(name, desc, year, url) { /* ... */ }

// WebMCP 도구 = 기존 함수를 래핑
execute({ name, desc, year, url }) {
    addStamp(name, desc, year, url);  // 그대로 호출
    return { content: [{ type: "text", text: "Done!" }] };
}
```

### 패턴 3: 상태 기반 동적 도구

```
목록 화면  →  도구: [filter, search]
편집 화면  →  도구: [filter, search, edit, save, undo]
체크아웃   →  도구: [review, placeOrder]
```

### 패턴 4: 고위험 동작에 사용자 확인

```javascript
execute: async (params, agent) => {
    const confirmed = await agent.requestUserInteraction(async () => {
        return confirm("정말 실행하시겠습니까?");
    });
    if (!confirmed) throw new Error("Cancelled");
    // ... 실행
}
```

### 패턴 5: 에이전트가 기능 발견하여 사용자에게 제안

```
에이전트가 페이지에서 사용자가 모르는 도구 발견
→ 사용자의 현재 맥락과 관련이 있다면 제안
→ "인쇄 주문할 수 있는 기능이 있는데, 해드릴까요?"
```
