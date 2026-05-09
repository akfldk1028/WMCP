# ShopGuard TODO (2026-03-03)
● CGB에 쓸만한 것 3개 

y: "knowall-ai mcp-neo4j-agent-memory knowledge
                                                                                   
  1. InfraNodus MCP Server — 가장 유용                                              
                                                 
  - https://github.com/infranodus/mcp-server-infranodus                             
  - 그래프의 "구조적 빈틈(structural holes)"을 찾아서 새 아이디어 질문 생성     
  - CGB 그래프에 노드가 쌓이면 → InfraNodus에 넘겨서 "이 그래프에서 아직 연결 안 된 
  개념 조합" 발견 → 새 Idea 노드로                                                  
  - Knowledge Distance 논문의 실질적 구현체. 우리가 BFS로 novelty 재는 것보다 훨씬  
  정교함                                                                            
  - 단점: 유료 SaaS (API 호출 과금)                                                 
                                                                                    
  2. brainstorm-mcp — 멀티모델 디베이트                                             
                                                                                    
  - https://github.com/spranab/brainstorm-mcp                                       
  - TypeScript, Claude가 GPT + DeepSeek + Ollama에게 같은 주제를 던져서 다중 모델이 
  토론                                                                              
  - 75초에 $0.07, 단일 모델보다 다양한 관점                                         
  - CGB 통합: Topic 넣으면 → 토론 결과를 Idea 노드들로 저장 + GENERATED_BY 엣지에
  모델명 태깅
  - 장점: TypeScript라 바로 통합 가능

  3. branch-thinking-mcp — 병렬 사고 분기

  - https://github.com/ssdeanx/branch-thinking-mcp
  - 생각의 병렬 분기 + 시맨틱 교차 참조 + 점수 기반 정렬
  - 내부 모델이 CGB 그래프 스키마(노드+엣지+점수)와 거의 1:1 매핑
  - CGB 통합: 분기별로 Idea 노드, 교차 참조가 SIMILAR_TO 엣지

  나머지 — 참고용

## DONE (이번 세션)

### 코드 변경 (26파일, 커밋 86edde3 + b641243)
- [x] 4-layer 전략 피벗: Consumer Pro $4.99 → Free/Seller/Developer
- [x] 랜딩 페이지 Pricing 3-tier (Free/Seller ₩9,900/Developer $19)
- [x] Features 섹션: Pro → Free, 9 types → 14 types
- [x] Terms/Refund: Seller/Developer 반영
- [x] Chrome 확장: isPro 페이월 전체 제거 (review-panel, popup, settings, welcome)
- [x] API 라우트: /reviews, /pricing Free 개방, 에러 메시지 중립화
- [x] MCP 서버: proRequired → paid plan 메시지
- [x] Auth: seller plan 추가 (sg_sel_*, 1000 req/day)
- [x] Blog: $4.99 → free, 5개 신규 SEO 포스트 추가 (총 8편)
- [x] 비용 최적화: URL 캐시 24h (KV), local-first (AI 80-94% 절감)

### SEO 인프라
- [x] sitemap.xml (13 URLs, /leaderboard 포함)
- [x] robots.txt (Allow /, Disallow /api/)
- [x] JSON-LD 구조화 데이터
- [x] OG tags + Twitter cards
- [x] Google verification meta (환경변수 방식)
- [x] 8개 SEO 블로그 포스트

### 신규 페이지
- [x] /seller — 셀러 랜딩 + waitlist 폼 (KV 저장)
- [x] /leaderboard — 다크패턴 리더보드 (10개 사이트, A~F 등급)
- [x] /api/waitlist — 이메일 수집 API (IP rate limit)

### 배포
- [x] Git push (master, b641243)
- [x] Vercel 프로덕션 배포 (--force, 캐시 클리어)
- [x] 라이브 검증: $4.99=0, ConsumerPro=0, Seller=6, 14types=10

### 빌드 & 테스트
- [x] shopguard 테스트 223/223 통과
- [x] shopguard-api 테스트 7/7 통과
- [x] 확장 빌드 0 errors
- [x] API 빌드 17+ pages, 0 errors

### 배포 준비물
- [x] `shopguard-extension.zip` (77KB) — CWS 업로드용
- [x] `CHROME_WEB_STORE_DESCRIPTION.txt` — CWS 설명문 (short + full)
- [x] `SNS_POSTS.md` — Twitter 5개, Reddit 3개, LinkedIn 1개, HN 1개

---

## TODO (수동 — 브라우저 필요)

### P0: 지금 바로 (5분)
- [ ] **Google Search Console 등록**
  1. https://search.google.com/search-console → URL prefix → `https://shopguard-api.vercel.app`
  2. HTML tag 방식 → content 코드 복사
  3. Vercel Dashboard → Settings → Environment Variables → `GOOGLE_SITE_VERIFICATION` = (코드)
  4. Vercel 재배포 → 확인 클릭
  5. Sitemap 섹션 → `https://shopguard-api.vercel.app/sitemap.xml` 제출

### P0: 지금 바로 (10분)
- [ ] **SNS 첫 공유** (`SNS_POSTS.md` 복붙)
  - [ ] Twitter/X — 리더보드 발표 포스트
  - [ ] Reddit r/assholedesign — 리더보드 결과
  - [ ] Reddit r/darkpatterns — 분석 결과
  - [ ] LinkedIn — 전문가 포스트

### P1: 오늘 중 (15분)
- [ ] **Chrome Web Store 업데이트**
  1. https://chrome.google.com/webstore/devconsole → `befjaannnnnhcnmbgjhcakhjgmjcjklf`
  2. `shopguard-extension.zip` 업로드
  3. `CHROME_WEB_STORE_DESCRIPTION.txt`에서 설명 복붙
  4. 스크린샷 업데이트 (Pro 표시 없는 새 스크린샷)
  5. 제출

### P1: 오늘 중 (5분)
- [ ] **Hacker News Show HN** (`SNS_POSTS.md` 복붙)

---

## TODO (개발 — 다음 세션)

### P1: 셀러 SaaS MVP
- [ ] /seller/dashboard — 셀러 대시보드 UI
- [ ] /api/seller/scan — 스토어 URL 입력 → 컴플라이언스 리포트
- [ ] 주간 리포트 이메일 (Resend 또는 SendGrid)
- [ ] Lemonsqueezy 셀러 상품 추가 (₩9,900/mo)
- [ ] 셀러 결제 → API 키 발급 플로우

### P2: MCP Trust Layer
- [ ] /api/mcp/verify — AI 에이전트용 신뢰 검증 API
- [ ] 콜당 과금 ($0.01~0.05)
- [ ] MCP 프로토콜 표준 응답 포맷

### P2: 데이터 & 인사이트
- [ ] 리더보드 자동 업데이트 (주간 크롤링)
- [ ] 다크패턴 트렌드 리포트 (월간)
- [ ] 인증마크 시스템 설계

### P3: 그로스
- [ ] Google Ads (dark pattern checker 키워드)
- [ ] Product Hunt 런칭
- [ ] 한국어 블로그 포스트 (네이버 SEO)
- [ ] YouTube 데모 영상 업데이트
