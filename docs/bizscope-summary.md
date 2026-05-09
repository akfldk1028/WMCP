# BizScope AI — Project Summary

## 프로젝트 개요
- **한 줄 요약**: AI와 대화하면 UI가 실시간으로 바뀌는 대화형 기획+검증 캔버스
- **해결하는 문제**: 누구나 앱/웹툰/사업을 만들 수 있는 시대에 "뭘 만들지" 기획하고 "될지" 검증하는 도구가 없음. 기존 분석 도구는 일방향 리포트 생성 — 사용자 맥락 반영 불가.
- **타겟 사용자**: 1인 창업자, 사이드프로젝트 개발자, 스타트업 초기 팀 — "아이디어는 있는데 사업이 될지 모르겠는" 사람

## 기술 스택
- **주요 기술**: Next.js 15 (Turbopack), React 19, Tailwind CSS 4, Upstash Redis, Vitest
- **핵심 알고리즘/모델**:
  - Multi-provider AI (Anthropic > OpenAI > xAI > Gemini) + 토큰 스트리밍 (SSE)
  - A2UI v0.9 — AI가 JSON으로 실시간 UI 컴포넌트 생성 (BmcBlock, StageCard)
  - 의존성 그래프 기반 섹션 파이프라인 (기업 8레벨, 아이디어 7레벨)
  - 브레인스토밍 프로토콜 (Landscape → Devil's Advocate → Synthesis 3라운드)

## 현재 구현 상태
- **완성된 기능**:
  - 기획 모드: BMC 9블록 + 서비스기획 8단계 (AI 대화형)
  - 아이디어 분석: 15섹션 순차 생성 + AI 코멘터리
  - 기업 분석: 18섹션 순차 생성 + AI 코멘터리
  - MCP 53개 도구 (기업18 + 아이디어15 + 기획12 + 브레인스토밍3 + 유틸5)
  - 통합 키 인증 (`bsai_xxx`) — 웹/MCP/REST 단일 키
  - LemonSqueezy 결제 + Redis 키 관리
  - Claude Code 플러그인 + npm 패키지 (`@bizscope-ai/mcp`)
  - 토큰 스트리밍 (타이핑 효과)
  - i18n (한국어/영어)
  - 127개 테스트 (Vitest)
- **데모 가능 여부**: 가능 — https://bizscope-rho.vercel.app (라이브)
- **프로토타입 수준**: **MVP** (결제+인증+3모드 전부 동작, 실사용 가능)

## 차별점
- **기존 대안 대비 뭐가 다른지**: 기존 사업 분석 도구(Crunchbase, CB Insights)는 데이터 조회형. BizScope는 AI가 사용자와 대화하며 함께 기획하고, 대화 내용이 실시간으로 캔버스 UI에 반영됨.
- **독창적인 부분**:
  - A2UI — AI 응답에서 구조화된 UI 컴포넌트를 실시간 추출·렌더링
  - 기획→분석 자동 매핑 (17규칙) — 대화에서 나온 기획이 15섹션 분석의 입력으로 자동 변환
  - 53개 MCP 도구 — Claude Desktop/Claude Code에서 바로 사용 가능
  - 3라운드 브레인스토밍 프로토콜로 확증 편향 방지

## 활용 가능성
- **사업화 가능성**: 높음. Free/Per-report($5)/Pro Monthly($29)/Pro Annual($19/월) 4-tier 과금 구현 완료. MCP 생태계 확산과 함께 B2C + B2D(Developer) 시장 동시 진입 가능.
- **논문/연구 가능성**: 중간. A2UI(AI-to-UI 실시간 렌더링), 대화형 비즈니스 분석 파이프라인, MCP 기반 도구 통합 아키텍처 등이 HCI/AI 응용 분야 논문 소재.
- **특허 가능성**: 중간. A2UI 실시간 렌더링 방식, 기획→분석 자동 매핑 규칙, 의존성 그래프 기반 섹션 생성 파이프라인이 방법 특허 후보.
