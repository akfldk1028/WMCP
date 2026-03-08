# HANDOFF — ShopGuard 4레이어 전략 확정 (2026-03-03)

## 전략 (v3 최종)

**B2C 보호 도구 단독 수익화 불가능 → 4레이어 전략:**

```
L1: 소비자 확장 (무료)      → 마케팅 채널. 데이터 수집. 돈 안 벌어도 됨
L2: 셀러 SaaS (₩9,900/mo)  → 단기 수익. 같은 엔진, 셀러한테 판매
L3: MCP Trust Layer (콜당)  → 중기 수익. AI 에이전트 쇼핑 안전 검증 (WebMCP 본령)
L4: 인증마크 + 데이터       → 장기 수익
```

**핵심 발상**: 소비자한테 "다크패턴 있어" → ₩0. 셀러한테 "네 스토어 이렇게 고쳐" → ₩9,900/mo.
80만 스마트스토어/쿠팡 셀러가 전자상거래법 제재 피하려고 돈 냄.

상세: `memory/shopguard-business-strategy.md`

## 코드 변경 (이번 세션)

### 버그 수정 + 기능 추가 (16파일, 미커밋)
1. API HTML arg 누락 수정 (analyze + darkpatterns 라우트)
2. bait-and-switch locale EN/KO 분리 (darkpattern-signals)
3. disguised-ads `\bad\b` word boundary (signals + detector)
4. Welcome 탭 + 리뷰 프롬프트 (chrome extension)
5. 블로그 SEO 3포스트 (/blog)
6. enrich.test.ts 7개 + sync-check 양방향
7. scanCount 이중증가 버그 수정, 빌드 스크립트, branding

### 검증
```
pnpm --filter @wmcp/shopguard test          # 223/223
pnpm --filter @wmcp/shopguard-api test      # 7/7
pnpm --filter @wmcp/shopguard build:extension  # OK
pnpm --filter shopguard-api build           # 15 pages, 0 errors
```

## 다음에 해야 할 것

### 즉시: git commit + 배포 + CWS v0.4.0
### 1개월: 셀러 SaaS MVP (/seller 대시보드 + 리더보드)
### 3개월: MCP Trust Layer 호스티드 버전

## 파일 위치
- 전략: `memory/shopguard-business-strategy.md`
- 상태: `memory/shopguard-status.md`
- TODO: `memory/TODO.md`
- 메모리: `D:\DevCache\claude-data\projects\D--Data-28-WMCP\memory\`
