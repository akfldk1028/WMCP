# 08. 스펙 문서 구조와 W3C 프로세스

## 리포지토리 구조 맵

```
webmcp/
├── .github/
│   ├── dependabot.yml              # GitHub Actions 자동 업데이트 설정
│   └── workflows/
│       └── auto-publish.yml        # Bikeshed → HTML 자동 빌드 & 배포
│
├── content/
│   ├── explainer_mcp.png           # MCP 아키텍처 다이어그램
│   ├── explainer_webmcp.png        # WebMCP 아키텍처 다이어그램
│   └── screenshot.png              # Historical Stamp Database 앱 스크린샷
│
├── docs/
│   ├── explainer.md                # → README.md로 리다이렉트
│   ├── proposal.md                 # API 설계 제안서 (22KB)
│   ├── security-privacy-           # 보안/프라이버시 분석 (16KB)
│   │   considerations.md
│   └── service-workers.md          # Service Worker 확장 제안 (22KB)
│
├── index.bs                        # Bikeshed 스펙 소스 (핵심!)
├── README.md                       # 메인 Explainer (35KB)
├── CONTRIBUTING.md                 # W3C CLA 요구사항
├── LICENSE.md                      # W3C Software and Document License 2023
├── Makefile                        # Bikeshed 빌드 명령어
├── w3c.json                        # W3C 그룹 메타데이터
└── .pr-preview.json                # PR 미리보기 설정
```

### 파일 역할 분류

| 카테고리 | 파일 | 용도 |
|----------|------|------|
| **스펙 본문** | `index.bs` | 공식 W3C 사양 문서 소스 |
| **설명 문서** | `README.md` | Explainer (왜 필요한지, 사용 사례) |
| | `docs/proposal.md` | API 설계 상세 제안 |
| | `docs/security-privacy-considerations.md` | 보안 분석 |
| | `docs/service-workers.md` | SW 확장 제안 |
| **빌드** | `Makefile`, `.github/workflows/` | 스펙 빌드 & 배포 자동화 |
| **메타데이터** | `w3c.json`, `LICENSE.md`, `CONTRIBUTING.md` | W3C 프로젝트 정보 |
| **자산** | `content/*.png` | 다이어그램, 스크린샷 |

---

## Bikeshed란?

### 개요

Bikeshed는 W3C 스펙을 작성하기 위한 마크업 도구다. Markdown과 비슷하지만 W3C 스펙에 특화된 기능이 추가되어 있다.

```
[Bikeshed 소스 (.bs 파일)]
        |
        | bikeshed spec 명령어
        v
[HTML 스펙 문서 (.html)]
        |
        | GitHub Pages 배포
        v
[https://webmachinelearning.github.io/webmcp]
```

### index.bs 구조 분석

#### 메타데이터 블록

```
<pre class='metadata'>
Title: WebMCP                          ← 스펙 제목
Shortname: webmcp                      ← 짧은 이름 (URL 등에 사용)
Level: None                            ← 레벨 (버전)
Status: CG-DRAFT                       ← 상태: Community Group Draft
Group: webml                           ← W3C 그룹: Web Machine Learning
Repository: webmachinelearning/webmcp  ← GitHub 리포
URL: https://webmachinelearning.github.io/webmcp  ← 공개 URL
Editor: Brandon Walderman, Microsoft   ← 편집자
Editor: Khushal Sagar, Google
Editor: Dominic Farolino, Google
Abstract: The WebMCP API enables web applications to...  ← 요약
Markup Shorthands: markdown yes        ← Markdown 문법 허용
Die On: warning                        ← 경고가 있으면 빌드 실패
</pre>
```

#### 스펙 섹션 구조

```
index.bs 섹션 구성:

<h2> Introduction                      ← 소개 (비규범적)
<h2> Terminology                       ← 용어 정의
  - agent, browser's agent, AI platform
<h2> Security and privacy              ← 보안/프라이버시 (TODO 상태)
<h2> Accessibility                     ← 접근성 (TODO 상태)
<h2> API                               ← API 정의 (핵심)
  <h3> Navigator Extension             ←   Navigator 인터페이스 확장
  <h3> ModelContext Interface           ←   ModelContext 인터페이스
    <h4> ModelContextOptions            ←     옵션 딕셔너리
    <h4> ModelContextTool               ←     도구 딕셔너리
    <h4> ModelContextClient             ←     클라이언트 인터페이스
<h2> Acknowledgements                  ← 감사 인사
```

#### WebIDL 블록 읽는 법

```html
<!-- WebIDL 정의 블록 -->
<xmp class="idl">
[Exposed=Window, SecureContext]        ← Window 객체에서 접근, HTTPS만
interface ModelContext {                ← 인터페이스 정의
  undefined provideContext(            ← 메서드: 반환값 없음
    optional ModelContextOptions options = {}  ← 선택적 파라미터
  );
  undefined clearContext();
  undefined registerTool(ModelContextTool tool);
  undefined unregisterTool(DOMString name);
};
</xmp>

<!-- 딕셔너리 (JS 객체 리터럴에 대응) -->
<xmp class="idl">
dictionary ModelContextTool {
  required DOMString name;             ← 필수 문자열
  required DOMString description;      ← 필수 문자열
  object inputSchema;                  ← 선택적 객체
  required ToolExecuteCallback execute; ← 필수 콜백
  ToolAnnotations annotations;         ← 선택적 어노테이션
};
</xmp>

<!-- 콜백 정의 -->
<xmp class="idl">
callback ToolExecuteCallback = Promise<any> (
  object input,           ← 첫 번째 인자: 입력 파라미터
  ModelContextClient client  ← 두 번째 인자: 클라이언트 객체
);
</xmp>
```

#### 용어 정의 (dfn)

```html
An <dfn>agent</dfn> is an autonomous assistant...
```

`<dfn>` 태그는 용어를 정의한다. 정의된 용어는 문서 전체에서 링크로 참조 가능:
- `[=agent=]` → "agent" 정의로 링크
- `{{ModelContext}}` → ModelContext 인터페이스 정의로 링크

#### 알고리즘 블록

```html
<div algorithm>
The <dfn method for=ModelContext>provideContext(options)</dfn> method steps are:
1. TODO: fill this out.
</div>
```

현재 알고리즘은 TODO 상태. 스펙이 성숙하면 여기에 정확한 단계별 알고리즘이 작성됨.

---

## W3C 프로세스

### 상태 분류

```
WebMCP의 현재 위치: ★

비공식 → CG-DRAFT★ → CG-FINAL → FPWD → WD → CR → PR → REC

[Community Group 단계]
  CG-DRAFT: 커뮤니티 그룹 초안 (현재)
  CG-FINAL: 커뮤니티 그룹 최종 보고서

[Working Group 단계] (채택되면)
  FPWD: First Public Working Draft
  WD: Working Draft
  CR: Candidate Recommendation
  PR: Proposed Recommendation
  REC: W3C Recommendation (최종 표준)
```

### Community Group vs Working Group

| | Community Group (현재) | Working Group |
|---|---|---|
| 참여 자격 | 누구나 (CLA 서명) | W3C 회원 |
| 문서 상태 | CG-DRAFT/CG-FINAL | W3C TR (공식 기술 보고서) |
| 특허 정책 | CLA 기반 | W3C 특허 정책 |
| 표준 권위 | 커뮤니티 합의 | W3C 공식 표준 |

### 이 프로젝트의 현재 상태

- **상태**: CG-DRAFT (매우 초기 단계)
- **알고리즘**: 대부분 TODO
- **프리미티브**: Tools만 정의 (Resources, Prompts 미지원)
- **보안 섹션**: 별도 문서(security-privacy-considerations.md)에 작성 중
- **접근성 섹션**: 비어있음
- **구현**: 브라우저 구현 없음 (순수 스펙 단계)

---

## 빌드 파이프라인

### Makefile

```makefile
# 로컬 빌드 (Bikeshed 설치 필요)
remote: index.bs
	curl https://api.csswg.org/bikeshed/ -F file=@index.bs > index.html

local: index.bs
	bikeshed spec index.bs

watch: index.bs
	bikeshed watch index.bs

ci: index.bs
	bikeshed --die-on=warning spec index.bs
```

| 명령 | 용도 |
|------|------|
| `make remote` | Bikeshed 원격 API로 빌드 (설치 불필요) |
| `make local` | 로컬 Bikeshed로 빌드 |
| `make watch` | 파일 변경 감지 & 자동 리빌드 |
| `make ci` | CI용 빌드 (경고 시 실패) |

### GitHub Actions 워크플로우

```yaml
# .github/workflows/auto-publish.yml
name: Build and Deploy WebMCP Specification

on:
  pull_request: {}           # PR에서 빌드 검증
  push:
    branches: [main]         # main 브랜치 push 시 배포

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
    - uses: niccokunzmann/auto-pr-body-generator@...
    - uses: niccokunzmann/auto-comment-action@...
    - uses: niccokunzmann/auto-pr-body-generator@...
    - uses: niccokunzmann/auto-comment-action@...
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
    - uses: niccokunzmann/auto-pr-body-generator@...
    - uses: w3c/spec-prod@v2     # W3C 스펙 빌드 액션
      with:
        TOOLCHAIN: bikeshed      # Bikeshed 사용
        W3C_BUILD_OVERRIDE: |
          Die On: nothing        # 빌드 시 경고 허용 (오버라이드)
```

**빌드 흐름**:
```
PR/Push → GitHub Actions → Bikeshed 빌드 → gh-pages 브랜치 배포
                                             → https://webmachinelearning.github.io/webmcp
```

---

## 참조 표준과 관련 문서

### 스펙에서 참조하는 표준

| 참조 | 표준명 | 역할 |
|------|--------|------|
| `[[!MCP]]` | Model Context Protocol Specification | 도구 개념의 기반 |
| `[[!JSON-SCHEMA]]` | JSON Schema: A Media Type for Describing JSON Documents | inputSchema 형식 |

### 관련 W3C/WHATWG 표준

| 표준 | 관계 |
|------|------|
| HTML Living Standard | Navigator 인터페이스 확장 |
| Web IDL | API 인터페이스 정의 문법 |
| Service Workers | SW 확장 제안의 기반 |
| Web App Manifest | PWA/디스커버리 연계 |
| Payment Handler API | SW JIT 설치 패턴 참조 |
| Prompt API | 도구 사용(tool use) 스펙 정렬 |

---

## 기여하려면

### 요구사항

1. [W3C Community License Agreement (CLA)](https://www.w3.org/community/about/agreements/cla/) 서명
2. [Code of Conduct](https://www.w3.org/policies/code-of-conduct/) 준수
3. [Web Machine Learning Community Group](https://www.w3.org/community/webml/) 가입

### 기여 방법

```
1. 이슈 생성/참여:
   https://github.com/webmachinelearning/webmcp/issues

2. PR 작성:
   - index.bs 수정 → Bikeshed 빌드 테스트
   - PR 미리보기가 자동 생성됨 (.pr-preview.json)

3. 주요 열린 이슈:
   #11 - Prompt injection attacks
   #22 - Declarative tool counterparts
   #41 - Non-textual data handling (images)
   #44 - Action-specific permissions
```
