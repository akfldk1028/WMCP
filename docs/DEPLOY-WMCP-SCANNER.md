# wmcp-scanner 배포 가이드

## 전제 조건
- Node.js 20+, pnpm 9+
- Vercel CLI (`npm i -g vercel`) 또는 Vercel 대시보드 연결
- 도메인: wmcpscore.com (Vercel에서 설정)

## 1. 빌드 확인

```bash
# 의존 패키지 먼저 빌드 (순서 중요)
pnpm --filter @wmcp/core build
pnpm --filter @wmcp/scanner-engine build
pnpm --filter wmcp-scanner build

# 또는 전체 빌드
pnpm -r build
```

빌드 성공 기준:
- `packages/core/dist/` 생성됨
- `packages/scanner-engine/dist/` 생성됨
- `projects/wmcp-scanner/.next/` 생성됨
- 에러 0개

## 2. 테스트 실행

```bash
npx vitest run
```

48개 테스트 전부 통과해야 함.

## 3. Vercel 배포

### 방법 A: CLI

```bash
cd projects/wmcp-scanner
vercel --prod
```

### 방법 B: Git Push (Vercel 대시보드 연동 시)

```bash
git add -A
git commit -m "feat: wmcp-scanner v2 - A-F grading, badge API, detailed scoring"
git push origin main
```

Vercel이 자동 빌드/배포.

### Vercel 프로젝트 설정

| 항목 | 값 |
|------|-----|
| Framework | Next.js |
| Root Directory | `projects/wmcp-scanner` |
| Build Command | `cd ../.. && pnpm --filter @wmcp/core build && pnpm --filter @wmcp/scanner-engine build && pnpm --filter wmcp-scanner build` |
| Output Directory | `.next` |
| Install Command | `cd ../.. && pnpm install` |
| Node.js Version | 20.x |

### 커스텀 도메인

Vercel Dashboard → Settings → Domains → `wmcpscore.com` 추가.
DNS에 Vercel CNAME 레코드 설정.

## 4. 배포 후 검증

```bash
# 메인 페이지
curl -I https://wmcpscore.com

# Scan API
curl -X POST https://wmcpscore.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Badge API
curl -I https://wmcpscore.com/api/badge/example.com
```

확인 항목:
- [ ] 메인 페이지 로드 (200)
- [ ] URL 입력 → A-F 등급 + 카테고리 프로그레스 바 표시
- [ ] Badge SVG 반환 (Content-Type: image/svg+xml)
- [ ] Badge에 올바른 등급/색상
- [ ] 뱃지 코드 복사 동작
- [ ] Share on X 버튼 동작
- [ ] OG 태그 확인 (https://developers.facebook.com/tools/debug/)

## 5. 라우트 요약

| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/` | GET | 메인 스캐너 UI |
| `/api/scan` | POST | `{url}` → 점수/등급/추천 JSON |
| `/api/badge/[domain]` | GET | shields.io 스타일 SVG 뱃지 |

## 6. 환경 변수

현재 필요 없음. 추후 rate limiting이나 캐시 추가 시:

| 변수 | 용도 |
|------|------|
| `REDIS_URL` | Badge 캐시 (선택) |
| `RATE_LIMIT_RPM` | 분당 요청 제한 (선택) |
