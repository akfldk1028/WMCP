# WebMCP Infrastructure Business Plan

> "앱은 쏟아지고, 인프라는 남는다."

## 핵심 테제

Chrome 146 (2026-02-25)이 `navigator.modelContext`를 활성화하면,
**모든 웹사이트가 AI 에이전트의 도구가 된다.**

이건 웹 역사상 가장 큰 인터페이스 변화 중 하나:
- 1995: HTTP → 문서 연결
- 2005: AJAX → 동적 인터랙션
- 2015: Service Worker → 오프라인/PWA
- **2026: WebMCP → AI 에이전트 연결**

역사적으로 새 웹 API가 나올 때마다 **인프라 회사**가 탄생했다.
앱은 수만 개 생기고 99% 사라지지만, 인프라는 남아서 수십억 달러가 된다.

---

## 역사적 증거

### 모바일 앱 생태계 (2008-2012)
| 앱 만든 사람 | 인프라 만든 사람 |
|------------|--------------|
| 수만 개 앱, 대부분 사라짐 | Flurry (앱 분석) → Yahoo $200M 인수 |
| | TestFlight (앱 테스팅) → Apple 인수 |
| | Appsflyer (어트리뷰션) → $2B+ 가치 |
| | Urban Airship (푸시 알림) → Airship $1B |

### API Economy (2006-2015)
| API 앱 | API 인프라 |
|--------|----------|
| 수천 개 API 매시업 | Apigee (API Gateway) → Google $625M 인수 |
| | Postman (API 테스팅) → $5.6B 가치 |
| | Kong (API Gateway) → $1.4B 가치 |
| | RapidAPI (API 마켓플레이스) → $1B+ |

### AI/LLM (2023-2025)
| AI 앱 | AI 인프라 |
|-------|---------|
| "GPT wrapper" 수만 개 | LangChain → $1B+ 가치 |
| | Vercel AI SDK → Vercel $3.2B |
| | Cursor (AI IDE) → $2.5B+ |
| | Anthropic MCP → 월 9,700만 npm DL |

### SEO (2004-현재)
| SEO 에이전시 | SEO 인프라 |
|------------|----------|
| 수만 개 에이전시 | SEMrush → IPO, $3B 시가총액 |
| | Ahrefs → 연 $100M+ 매출 |
| | Moz → 연 $60M 매출 |
| | Screaming Frog → 업계 표준 크롤러 |

**패턴: 생태계 초기에 인프라를 만들면, 그 위의 앱이 아무리 바뀌어도 인프라는 살아남는다.**

---

## 시장 데이터 (2026-02 기준)

### WebMCP / 에이전트 생태계
- Chrome 146 Stable: **2026-02-25 ~ 03-10** (2주 내)
- MCP npm: 월 9,700만 다운로드
- MCP 서버: 17,000+ 등록
- AI 에이전트 = **유기 검색 트래픽의 33%** (BrightEdge)

### Agentic Commerce
- 시장 규모: **$60.43B** (2026) → **$218B** (2031), CAGR 29.29%
- 소비자 45%가 AI로 쇼핑 (IBM 2026)
- McKinsey: 2030년 $1T~$5T 에이전트 거래 예측
- Microsoft: "AEO/GEO가 마케팅의 새 전선" (2026.02)

### SEO → AEO/GEO 전환
- 전통 SEO 시장: **$90B**
- 새 카테고리:
  - **AEO** (Answer Engine Optimization): AI 답변에 노출되도록 최적화
  - **GEO** (Generative Engine Optimization): 생성형 검색에 최적화
  - **ATO** (Agent Tool Optimization): **에이전트가 내 도구를 선택하도록 최적화** ← NEW, 우리 영역

---

## 에이전트-웹 인프라 10 레이어

웹에 HTTP가 있으면 CDN/DNS/Analytics가 필요했듯이,
에이전트-웹에 WebMCP가 있으면 **10개 인프라 레이어**가 필요하다.

```
┌─────────────────────────────────────────────────┐
│                 에이전트/유저                      │
├─────────────────────────────────────────────────┤
│  9. Billing     │  10. Compliance               │
│  에이전트 결제    │  규정 준수/감사                 │
├─────────────────────────────────────────────────┤
│  7. Monitoring  │  8. Auth/Identity             │
│  실시간 감시     │  에이전트 인증                  │
├─────────────────────────────────────────────────┤
│  5. Optimization│  6. Registry/Discovery        │
│  Agent SEO/ATO  │  도구 검색/등록                 │
├─────────────────────────────────────────────────┤
│  3. Analytics   │  4. Testing/Audit             │
│  에이전트 분석   │  WebMCP 점수/검증              │
├─────────────────────────────────────────────────┤
│  1. Gateway     │  2. Converter                 │
│  프록시/보안     │  기존 사이트→WebMCP 변환        │
├─────────────────────────────────────────────────┤
│                 웹사이트                          │
└─────────────────────────────────────────────────┘
```

### 각 레이어의 역사적 비유

| # | 레이어 | 웹 비유 | 시가총액/가치 | WebMCP 버전 |
|---|--------|--------|-------------|------------|
| 1 | Gateway | Cloudflare WAF | $30B | **Agent Gateway** |
| 2 | Converter | Babel/Polyfill | OSS | **Form Bridge** |
| 3 | Analytics | Google Analytics | $무한 | **Agent Analytics** |
| 4 | Testing | Lighthouse/SSL Labs | 무료→리드 | **WebMCP Score** |
| 5 | Optimization | SEMrush/Ahrefs | $3B~$90B | **Agent SEO (ATO)** |
| 6 | Registry | npm/Docker Hub | $인수 | **Tool Directory** |
| 7 | Monitoring | Datadog/PagerDuty | $40B | **Agent Monitor** |
| 8 | Auth | Auth0/Clerk | $6.5B | **Agent Identity** |
| 9 | Billing | Stripe | $65B | **Agent Pay** |
| 10 | Compliance | OneTrust | $5B | **Agent Compliance** |

**합산하면 이 인프라 시장은 $100B+ 규모가 될 수 있다.**
우리가 1 레이어의 1%만 먹어도 연 $1M~$10M.

---

## 우리가 이미 만든 것 (리매핑)

| 기존 프로젝트 | 인프라 레이어 | 새 포지셔닝 | 상태 |
|-------------|------------|-----------|------|
| wmcp-scanner | 4. Testing | **WebMCP Score** - 사이트 에이전트 준비도 점수 | 빌드 완료 |
| agent-pulse | 3. Analytics | **Agent Metrics** - 에이전트 트래픽 분석 | 빌드 완료, 이름 변경 필요 |
| tool-rank | 5. Optimization | **ATO Suite** - Agent Tool Optimization | 빌드 완료 |
| mcp-gateway (webmcp-pro) | 1. Gateway | **Agent Gateway** - 보안/레이트리밋 프록시 | 빌드 완료 |
| form-bridge | 2. Converter | **WebMCP Converter** - 폼→도구 자동변환 | 빌드 완료 |
| n8n-nodes | (자동화) | **Agent Automation** - n8n 연동 | 빌드 완료 |
| openclaw-bridge | (브릿지) | **Agent Bridge** - OpenClaw↔웹 연결 | 빌드 완료 |

### 아직 없는 레이어 (새로 만들어야 할 것)

| 레이어 | 프로젝트명 | 설명 | 우선순위 |
|--------|----------|------|---------|
| 6. Registry | **tool-directory** | WebMCP 도구 크롤러+검색엔진 | 높음 |
| 7. Monitoring | **agent-monitor** | 실시간 도구 호출 감시/알림 | 중간 |
| 8. Auth | **agent-id** | 에이전트 신원 인증/신뢰 등급 | 낮음 (미래) |
| 9. Billing | **agent-pay** | 도구 호출 마이크로 결제 | 낮음 (미래) |
| 10. Compliance | **agent-audit** | 에이전트 행동 감사 로그 | 낮음 (기업 수요 후) |

---

## 브랜딩 & 배포 전략 ($0 예산)

### 이름 충돌 주의
- ~~AgentPulse~~ → **AvePoint가 이미 상표 사용** (나스닥 AVPT, AI 거버넌스 제품)
- → **"ToolPulse"** 또는 **"Agent Metrics"** 로 변경 필요

### 핵심 원칙: 도메인 없이 시작한다

도메인은 사치품. 수익 $0일 때 도메인에 $260 쓰는 건 바보짓.
**무료 URL로 시작 → 유저/수익 확보 → 도메인 구매** 순서가 맞다.

Notion은 `notion.so`로 시작했고, Linear는 `linear.app`으로 시작했다.
우리도 `.vercel.app`으로 시작하면 된다.

### $0 배포 전략

| 제품 | 무료 배포 경로 | URL | 비용 |
|------|-------------|-----|------|
| wmcp-scanner | **Vercel** | `wmcp-scanner.vercel.app` | $0 |
| site-guard | **Chrome Web Store** | Chrome Web Store URL | **$5** (1회 등록비) |
| tool-rank | **npm** | `npm i @wmcp/tool-rank` | $0 |
| agent-pulse→ToolPulse | **npm + Vercel** (대시보드) | `toolpulse.vercel.app` | $0 |
| mcp-gateway | **npm** | `npm i @wmcp/mcp-gateway` | $0 |
| form-bridge | **Chrome Web Store** | (site-guard와 묶기) | $0 |
| n8n-nodes | **n8n 커뮤니티** | n8n 커뮤니티 노드 | $0 |
| openclaw-bridge | **npm** | `npm i @wmcp/openclaw-mcp-bridge` | $0 |
| landing page | **GitHub Pages** | `{username}.github.io/wmcp` | $0 |

**총 비용: $5** (Chrome Web Store 개발자 등록 1회)

### 무료 마케팅 채널

| 채널 | 비용 | 기대 효과 |
|------|------|----------|
| Product Hunt | $0 | 런칭데이 트래픽, 초기 유저 |
| Hacker News (Show HN) | $0 | 개발자 커뮤니티 노출 |
| r/webdev, r/javascript | $0 | 타겟 개발자 유입 |
| X/Twitter 스레드 | $0 | 바이럴 가능성 |
| DEV.to 블로그 | $0 | SEO + 개발자 신뢰 |
| n8n 커뮤니티 포럼 | $0 | n8n 유저 유입 |
| GitHub README 배지 | $0 | 오가닉 발견 |

### 수익화 (역시 $0 초기 비용)

| 플랫폼 | 초기 비용 | 수수료 | 용도 |
|--------|----------|--------|------|
| **Polar.sh** | $0 | 4% + $0.40/건 | SaaS 구독 판매 |
| **Apify** | $0 | 수익 분배 (개발자 80%) | MCP Actor 수익화 |
| **GitHub Sponsors** | $0 | 0% (GitHub이 수수료 면제) | 후원 |
| **Buy Me a Coffee** | $0 | 5% | 소액 후원 |

### 도메인은 나중에 (수익 달성 후)

돈이 생기면 순서대로 사면 됨:

| 우선순위 | 도메인 | 예상 가격 | 언제 사나 |
|---------|--------|----------|----------|
| 1 | wmcpscore.com | $10-15 | 첫 $100 MRR 달성 시 |
| 2 | toolrank.dev | $12 | 첫 유료 유저 확보 시 |
| 3 | toolpulse.dev | $12 | 대시보드 출시 시 |
| 4 | agentseo.com | **판매 중 (비쌀 수 있음)** | 수익 $1K+ MRR 시 |
| 5+ | 나머지 | $10-50 각각 | 필요할 때 |

**규칙: 도메인 비용 < 월 수익의 10%일 때만 구매**

---

## 수익 모델 상세

### Layer 4: WebMCP Score (wmcp-scanner.vercel.app → 나중에 wmcpscore.com)
```
무료: URL 스캔 + A-F 등급 + 기본 리포트
Pro ($19/월):
  - 스케줄 스캔 (매주/매일)
  - CI/CD 통합 (GitHub Actions)
  - 히스토리 트렌드
  - 경쟁사 비교
  - API 접근 (1,000 calls/월)
Enterprise ($99/월):
  - 무제한 API
  - 화이트라벨 리포트
  - 다중 도메인
  - Slack/Teams 알림
```

**수익 경로**: SSL Labs 모델
- 무료 스캔으로 트래픽 → Pro 전환 → Enterprise 영업
- "WebMCP Score A+" 배지가 표준이 되면 모든 사이트가 스캔

### Layer 3: Agent Metrics (toolpulse.vercel.app → 나중에 toolpulse.dev)
```
무료:
  - 월 10K 이벤트
  - 7일 보존
  - 기본 대시보드
Pro ($29/월):
  - 월 100K 이벤트
  - 90일 보존
  - 에이전트 식별 (Claude/GPT/Gemini)
  - 전환율 추적
  - 커스텀 이벤트
Business ($99/월):
  - 월 1M 이벤트
  - 365일 보존
  - 실시간 대시보드
  - A/B 테스트 통합
  - 웹훅/API
  - 팀 멤버
```

**수익 경로**: Mixpanel/Amplitude 모델
- "에이전트 트래픽을 측정할 수 없으면 최적화할 수 없다"
- WebMCP Score에서 유입 → "점수 높이려면 분석이 필요" → 전환

### Layer 5: ATO Suite (toolrank.dev 또는 agentseo.com)
```
무료:
  - 도구 설명 점수 체크 (1회)
  - 기본 개선 제안
Pro ($49/월):
  - 무제한 도구 분석
  - A/B 테스트 (5개 동시)
  - AI 기반 설명 자동 생성
  - 경쟁 도구 비교
  - 선택률 예측
Agency ($199/월):
  - 클라이언트 관리 (10개 사이트)
  - 화이트라벨
  - 벌크 최적화
  - 우선 지원
```

**수익 경로**: SEMrush 모델
- $90B SEO 시장 → AEO/GEO/ATO로 전환 중
- 기존 SEO 에이전시가 ATO 도구 필요 → 우리 제품으로

### 복합 수익 예측

| 시점 | wmcpScore | Agent Metrics | ATO Suite | 합계 MRR |
|------|-----------|---------------|-----------|---------|
| 3개월 | $200 | $0 | $300 | **$500** |
| 6개월 | $800 | $500 | $1,500 | **$2,800** |
| 12개월 | $3K | $3K | $5K | **$11K** |
| 24개월 | $10K | $10K | $20K | **$40K** |
| 36개월 | $20K | $30K | $50K | **$100K** |

보수적 추정. Agent SEO(ATO) 시장이 폭발하면 10x.

---

## 타이밍 전략: 골든 윈도우

```
[지금] ──2주──→ [Chrome 146] ──6~12개월──→ [대기업 진입]
                    ↑                          ↑
               여기서 배포                  Google/CF 자체 솔루션
               = 선점 시작                  = 여기선 늦음
```

### 왜 2주가 중요한가
1. Chrome 146 출시 = **"내 사이트 WebMCP 준비 됐나?"** 수요 폭발
2. 기존 도구(Lighthouse, GA)에 WebMCP 지원 없음 = **빈 공간**
3. Google/Cloudflare가 자체 도구 만들기까지 6-12개월 = **선점 기회**
4. de facto 표준이 되면 대기업도 인수/통합해야 함

### Week 1 (02-13 ~ 02-20)
- [ ] wmcp-scanner에 점수 시스템 추가 (A-F + 100점)
- [ ] 배지 API 추가 (/badge/example.com.svg)
- [ ] **Vercel 배포** → `wmcp-scanner.vercel.app` (무료)
- [ ] agent-pulse → "ToolPulse" 리브랜딩

### Week 2 (02-20 ~ 02-27)
- [ ] site-guard Chrome Extension manifest + 최소 popup
- [ ] Chrome Web Store 개발자 등록 ($5)
- [ ] GitHub Pages 랜딩 페이지 (한/영)
- [ ] Product Hunt / Hacker News 게시글 초안

### Chrome 146 Launch Day (~02-25)
- [ ] Product Hunt 런칭: "WebMCP Score - Is your site AI-agent ready?"
- [ ] Hacker News: "Show HN: Free WebMCP readiness scanner"
- [ ] r/webdev, r/javascript 포스트
- [ ] X/Twitter 스레드 (WebMCP 설명 + 스캐너 링크)

### Month 1-3
- [ ] tool-rank Pro → Polar.sh $49/월
- [ ] Agent Metrics 대시보드 (Next.js) → Vercel
- [ ] n8n 커뮤니티 노드 배포
- [ ] Apify Actor 배포

### Month 3-6
- [ ] tool-directory (크롤러+검색) 개발
- [ ] mcp-gateway 기업 패키지
- [ ] 첫 기업 고객 확보

---

## 소비자 앱의 역할 (재정의)

site-guard, price-shield, booking-pilot은 인프라가 아닌 **앱**이지만,
인프라 비즈니스에서 3가지 핵심 역할을 한다:

### 1. 수요 창출 엔진
- 소비자가 site-guard로 약관 F 등급 → 사이트에 압력
- 사이트가 "어떻게 개선하지?" → wmcpScore, ATO Suite 사용
- **소비자 앱이 B2B 인프라의 리드 생성기**

### 2. 데이터 수집
- site-guard가 수천 개 사이트 약관을 분석하면
- → "어떤 패턴이 위험한지" 데이터 축적
- → ATO Suite의 AI 모델 훈련 데이터
- **앱이 인프라 제품의 데이터 모트(moat)**

### 3. PR/미디어 채널
- "AI가 약관 읽어줌" → TechCrunch 기사감
- "숨겨진 수수료 AI가 발견" → 뉴스감
- "WebMCP Score" 같은 B2B 도구는 뉴스 안 됨
- **앱이 PR을 만들고, PR이 B2B 트래픽을 몰고 옴**

→ 앱을 버리는 게 아니라, **앱 = 인프라의 마케팅 부서**로 포지셔닝.

---

## Agent SEO (ATO) 심화: $90B 시장의 전환

### 기존 SEO → ATO 전환 맵

| 기존 SEO 개념 | ATO 대응 개념 | 우리 제품 |
|-------------|-------------|----------|
| PageRank | **ToolRank** (에이전트의 도구 선택 순위) | tool-rank |
| 키워드 밀도 | **설명 품질** (도구 설명의 정확도/완전성) | tool-rank |
| 메타 태그 | **toolname/tooldescription** (WebMCP 속성) | wmcp-scanner |
| 백링크 | **에이전트 호출 횟수** (다른 에이전트가 얼마나 쓰는지) | agent-metrics |
| 사이트맵 | **도구 레지스트리** (도구 목록 공개) | tool-directory |
| Core Web Vitals | **Agent Response Time** (도구 응답 속도) | agent-monitor |
| robots.txt | **WebMCP permissions** (에이전트 접근 제어) | mcp-gateway |
| 구조화 데이터 | **inputSchema** (도구 입력 스키마) | wmcp-scanner |
| GA 트래픽 | **에이전트 트래픽** | agent-metrics |
| A/B 테스트 | **도구 설명 A/B** | tool-rank |

### 시장 규모 추정
- 전통 SEO: $90B (2026)
- AI가 유기 검색의 33% (BrightEdge) → AEO/GEO/ATO = **$30B** 잠재 시장
- ATO 도구 시장 (SEMrush 급): **$1B-$5B** (3-5년 내)
- 우리가 초기 1% → **$10M-$50M ARR** 가능

### ATO가 기존 SEO와 다른 점
1. **선택 기준이 다름**: 검색엔진 = 키워드 매칭, AI 에이전트 = 의미적 이해
2. **측정 방법이 다름**: 클릭률 → 도구 선택률, 완료율
3. **최적화 대상이 다름**: 콘텐츠 → 도구 설명 + 스키마 + 응답 품질
4. **경쟁 구도가 다름**: 10개 검색 결과 → 에이전트가 1개만 선택

**4번이 핵심.** 검색에서는 10개 결과 다 보이지만, 에이전트는 1개만 고른다.
→ 2위 = 죽음. 1위가 되려면 ATO 최적화 필수.
→ **모든 사이트가 ATO를 해야 하는 이유.**

---

## 경쟁 분석: 누가 이걸 하고 있나?

### WebMCP 인프라 (직접 경쟁)
| 영역 | 경쟁자 | 위협도 |
|------|--------|-------|
| WebMCP 스캐너/점수 | **없음** | - |
| WebMCP 에이전트 분석 | **없음** (GA에 없음) | - |
| WebMCP 도구 최적화 | **없음** | - |
| WebMCP Gateway | **없음** (Cloudflare AI Gateway는 LLM용) | - |
| WebMCP 도구 레지스트리 | **없음** (mcp.so는 MCP 서버용) | - |

→ **전 영역 0경쟁.** Chrome 146이 2주 전이니 당연함.

### 간접 경쟁 (인접 시장)
| 영역 | 경쟁자 | 우리의 차별화 |
|------|--------|------------|
| Agent SEO | WordLift (Schema.org 중심) | WebMCP 네이티브 |
| Agent Analytics | AvePoint AgentPulse (M365 거버넌스) | WebMCP 전용, 가볍고 무료 |
| MCP 서버 마켓 | Apify, mcp.so | 우리는 WebMCP(브라우저), 그들은 MCP(서버) |
| 사이트 감사 | Lighthouse, Ahrefs | WebMCP 점수 없음 |
| 폼 자동화 | wmcp.dev | 우리는 인프라 전체, 그들은 SDK만 |

### 미래 경쟁 (6-12개월 후)
| 위협 | 대응 |
|------|------|
| Google이 Lighthouse에 WebMCP 점수 추가 | 이미 "WebMCP Score"가 표준이면 Google도 호환해야 함 |
| Cloudflare가 Agent Gateway 출시 | 우리는 WebMCP 전문, CF는 범용 → 니치 승리 |
| GA에 에이전트 분석 추가 | GA 로드맵은 느림. 우리는 전문 도구의 깊이로 차별화 |
| SEMrush가 ATO 기능 추가 | 기존 SEO 도구의 확장은 느림. 네이티브 ATO가 더 좋음 |

---

## 플라이휠 (전체 시스템)

```
site-guard (소비자 압력)
  → 사이트가 "F등급이래, 개선해야 해"
    → wmcp-scanner.vercel.app (무료 스캔/점수)
      → "점수 높이려면?"
        → ATO Suite (도구 설명 최적화, $49/월)
        → Agent Metrics (트래픽 분석, $29/월)
        → Agent Gateway (보안/인증, $99/월)
          → 더 많은 WebMCP 도구 노출
            → 더 많은 에이전트 사용
              → site-guard가 더 가치있어짐
                → 🔄 무한 루프
```

무료(wmcpScore) → 저가($29-$49) → 고가($99-$499) **자연 퍼널.**

---

## 조직 전략: 1인 → 팀 → 회사

### Phase 1: Solo, $0 예산 (지금 ~ 3개월)
- 1인이 모든 코드 작성
- 핵심 2개만 집중: wmcp-scanner + site-guard
- 배포: Vercel 무료, Chrome Web Store $5
- 수익화: Polar.sh, GitHub Sponsors, Apify
- 수익 $0 → $500 MRR
- **목표: 첫 100명 유저, 첫 $1**

### Phase 2: 수익 재투자 (3-6개월)
- 수익으로 도메인 1-2개 구매 ($20-30)
- 필요시 프리랜서 디자이너 (수익 범위 내에서)
- 수익 $500 → $3K MRR
- **목표: Product-Market Fit 확인**

### Phase 3: Startup (6-12개월)
- 풀타임 2-3명
- 엔젤 투자 or 부트스트랩
- 수익 $3K → $30K MRR
- **목표: 기업 고객 5개+**

### Phase 4: Scale (12-24개월)
- 시드 라운드 (필요시)
- 10명+ 팀
- $30K → $100K+ MRR
- **목표: 카테고리 리더**

---

## 리스크 & 대응

| 리스크 | 확률 | 대응 |
|--------|------|------|
| WebMCP 스펙이 크게 바뀜 | 높음 | 스캐너 규칙을 설정 파일로 분리, 빠른 업데이트 |
| Chrome 146 출시 지연 | 중간 | site-guard는 WebMCP 없이도 동작 |
| Google이 직접 만듦 | 중간 | 선점 + 니치 전문성. 인수 가능성도 있음 |
| 유저가 안 옴 | 높음 | 무료 도구로 시작, SEO/커뮤니티로 유기 성장 |
| 1인으로 12개 유지 불가 | 확실 | 핵심 2개만 집중. 나머지는 빌드만 해두고 대기 |
| 예산 $0 | 현실 | 전부 무료 인프라(Vercel/npm/GitHub)로 시작. $5만 필요 |

---

## 결론

### 한 문장 전략
> **"WebMCP의 인프라 레이어를 선점하라. 앱은 인프라의 마케팅 부서로 쓰라."**

### 즉시 행동 3가지 (총 비용: $5)
1. **wmcp-scanner Vercel 배포** (점수 시스템 + 배지 추가, $0)
2. **site-guard Chrome Web Store 등록** ($5)
3. **Chrome 146 출시일에 런칭** (Product Hunt + HN + Reddit, $0)

### 기억할 것
- 앱 만들지 마. 인프라 만들어.
- **도메인 사지 마. 유저부터 모아.**
- 무료로 뿌리고, 표준이 돼라.
- $5로 시작하고, 수익으로 확장하라.
- 2주가 6개월보다 중요하다. 지금이 골든 윈도우다.
