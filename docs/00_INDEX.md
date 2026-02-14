# WebMCP 아키텍처 학습 가이드

> WebMCP 프로젝트를 처음부터 끝까지 이해하기 위한 체계적 학습 문서

## 문서 구성

| 순서 | 파일 | 내용 |
|------|------|------|
| 1 | [01_OVERVIEW.md](./01_OVERVIEW.md) | 프로젝트 개요 - WebMCP가 뭔지, 왜 만들었는지 |
| 2 | [02_ARCHITECTURE.md](./02_ARCHITECTURE.md) | 전체 아키텍처 - 시스템 구조와 데이터 흐름 |
| 3 | [03_API_REFERENCE.md](./03_API_REFERENCE.md) | API 상세 - WebIDL, 인터페이스, 코드 예제 |
| 4 | [04_MCP_vs_WebMCP.md](./04_MCP_vs_WebMCP.md) | MCP와 WebMCP 비교 - 프로토콜 레이어별 차이점 |
| 5 | [05_SECURITY.md](./05_SECURITY.md) | 보안/프라이버시 - 위협 모델과 공격 시나리오 |
| 6 | [06_SERVICE_WORKERS.md](./06_SERVICE_WORKERS.md) | Service Worker 확장 - 백그라운드 도구 실행 |
| 7 | [07_USE_CASES.md](./07_USE_CASES.md) | 실전 사용 사례 - 3가지 시나리오 상세 분석 |
| 8 | [08_SPEC_STRUCTURE.md](./08_SPEC_STRUCTURE.md) | 스펙 문서 구조 - Bikeshed, W3C 프로세스, 리포 구조 |
| 9 | [09_CHROME_STATUS.md](./09_CHROME_STATUS.md) | Chrome 146 구현 현황 - Declarative API, 타임라인 |
| 10 | [10_BUSINESS_OPPORTUNITY.md](./10_BUSINESS_OPPORTUNITY.md) | 비즈니스 기회 분석 - 시장, 경쟁, 7가지 모델 |
| 11 | [11_MCP_SDK_REUSE.md](./11_MCP_SDK_REUSE.md) | MCP SDK 재활용 - 가능한 것/불가능한 것, 변환 도구 |
| 12 | [12_DEEP_RESEARCH.md](./12_DEEP_RESEARCH.md) | 심층 리서치 - 생태계 전체 지도, 투자, 경쟁, 한국 기회 |

## 권장 학습 순서

```
01_OVERVIEW (왜 만들었나?)
    |
    v
02_ARCHITECTURE (어떻게 동작하나?)
    |
    v
03_API_REFERENCE (코드로는 어떻게 쓰나?)
    |
    +---> 04_MCP_vs_WebMCP (기존 MCP와 뭐가 다른가?)
    |
    v
07_USE_CASES (실제로 어떤 상황에서 쓰나?)
    |
    v
05_SECURITY (어떤 위험이 있나?)
    |
    v
06_SERVICE_WORKERS (미래 확장은?)
    |
    v
08_SPEC_STRUCTURE (W3C 스펙은 어떻게 만드나?)
```

## 원본 리포지토리

- GitHub: https://github.com/webmachinelearning/webmcp
- 스펙 페이지: https://webmachinelearning.github.io/webmcp
- Chrome 블로그: https://developer.chrome.com/blog/webmcp-epp
- W3C 그룹: Web Machine Learning Community Group
- 상태: CG-DRAFT → Chrome 146 Early Preview (2026.02)
- 첫 공개: 2025년 8월 13일

## 핵심 외부 참고 자료

- [Chrome WebMCP Early Preview 발표](https://developer.chrome.com/blog/webmcp-epp)
- [VentureBeat: Chrome ships WebMCP](https://venturebeat.com/infrastructure/google-chrome-ships-webmcp-in-early-preview-turning-every-website-into-a)
- [WordLift: WebMCP is the new Schema.org](https://wordlift.io/blog/en/webmcp-is-the-new-schema-org/)
- [SearchEngineLand: WebMCP SEO implications](https://searchengineland.com/google-releases-preview-of-webmcp-how-ai-agents-interact-with-websites-469024)
- [Bug0: Chrome 146 구현 가이드](https://bug0.com/blog/webmcp-chrome-146-guide)
- [MCP 공식 SDK (TypeScript)](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP 공식 SDK (Python)](https://github.com/modelcontextprotocol/python-sdk)
